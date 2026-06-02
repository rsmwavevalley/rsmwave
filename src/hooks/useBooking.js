import { useState, useEffect } from "react";
import { bookingService } from "../services/bookingService";
import { paymentService } from "../services/paymentService";
import { ticketService } from "../services/ticketService";

export const BOOKING_STATES = {
  DRAFT: "DRAFT",
  BOOKING_CREATED: "BOOKING_CREATED",
  PAYMENT_PENDING: "PAYMENT_PENDING",
  PAYMENT_SUCCESS: "PAYMENT_SUCCESS",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  TICKET_GENERATING: "TICKET_GENERATING",
  TICKET_READY: "TICKET_READY",
};

export const useBooking = () => {
  // 1. Core Form States
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    guests: 2,
    preferredDate: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [bookingState, setBookingState] = useState(BOOKING_STATES.DRAFT);
  const [apiError, setApiError] = useState(null);

  // 2. Dynamic Configurations (Pricing & Capacity)
  const [pricingConfig, setPricingConfig] = useState({ ticketPrice: 650 });
  const [capacityInfo, setCapacityInfo] = useState({ totalCapacity: 1000, remainingCapacity: 1000, soldOut: false });
  const [loadingCapacity, setLoadingCapacity] = useState(false);

  // 3. Post-Checkout Confirmation Payload
  const [successPayload, setSuccessPayload] = useState({
    bookingId: "",
    paymentId: "",
    visitDate: "",
    guestCount: 2,
    ticketUrl: "",
  });

  // Fetch initial pricing rules on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await bookingService.getPricingConfig();
        setPricingConfig(config);
      } catch (err) {
        console.error("Could not fetch pricing rules. Falling back to default configuration.");
      }
    };
    fetchConfig();
  }, []);

  // Fetch slot capacities when a preferred date is selected
  useEffect(() => {
    if (!formData.preferredDate) return;

    const fetchCapacity = async () => {
      setLoadingCapacity(true);
      try {
        const capacity = await bookingService.getDateCapacity(formData.preferredDate);
        setCapacityInfo(capacity);
      } catch (err) {
        console.error("Could not fetch slot capacities.");
      } finally {
        setLoadingCapacity(false);
      }
    };

    fetchCapacity();
  }, [formData.preferredDate]);

  // Real-time pricing calculations based on configurator
  const ticketCost = pricingConfig.ticketPrice || 650;
  const totalAmount = formData.guests * ticketCost;

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    if (apiError) setApiError(null);
  };

  // Perform full form validation
  const validateForm = () => {
    const newErrors = {};

    // Name Check
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email Check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Indian Phone Check (10 digits starting 6-9)
    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (phoneDigits.length !== 10) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    } else if (!/^[6-9]/.test(phoneDigits)) {
      newErrors.phone = "Must start with 6, 7, 8, or 9";
    }

    // Preferred Date Check
    if (!formData.preferredDate) {
      newErrors.preferredDate = "Visit Date is required";
    } else {
      const selected = new Date(formData.preferredDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        newErrors.preferredDate = "Visit Date cannot be in the past";
      }
    }

    // Guests Count Check
    if (!formData.guests || formData.guests < 1) {
      newErrors.guests = "At least 1 guest required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Reset booking status to draft
   */
  const resetForm = () => {
    setFormData({ name: "", phone: "", email: "", guests: 2, preferredDate: "", message: "" });
    setErrors({});
    setBookingState(BOOKING_STATES.DRAFT);
    setApiError(null);
  };

  /**
   * Execute entire Booking & Razorpay flow orchestrator
   */
  const handleBookingSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validateForm()) return;
    if (capacityInfo.soldOut) {
      setApiError("Selected date is fully sold out. Please choose a different date.");
      return;
    }

    setApiError(null);
    setBookingState(BOOKING_STATES.BOOKING_CREATED);

    let activeBooking = null;

    try {
      // Step 1: Create local reservation inside the database
      const bookingResponse = await bookingService.createBooking(formData);
      activeBooking = bookingResponse.booking;
      
      setBookingState(BOOKING_STATES.PAYMENT_PENDING);

      // Step 2: Request backend to construct a Razorpay checkout order
      const orderResponse = await paymentService.createOrder(activeBooking.bookingId);
      const orderData = orderResponse.order;

      // Step 3: Launch checkout modal overlay
      paymentService.openRazorpayCheckout(
        orderData,
        activeBooking,
        // OnSuccess callback
        async (payload) => {
          setBookingState(BOOKING_STATES.PAYMENT_SUCCESS);
          try {
            // Step 4: Submit tokens to verify signatures & change DB status to PAID
            const verification = await paymentService.verifyPayment(payload);
            
            setBookingState(BOOKING_STATES.TICKET_GENERATING);

            // Step 5: Start polling to check if the PDF compilation finished
            const compiledTicketUrl = await ticketService.pollTicketStatus(activeBooking.bookingId);

            // Step 6: Render Success Fulfillment screen
            setSuccessPayload({
              bookingId: activeBooking.bookingId,
              paymentId: payload.razorpay_payment_id,
              visitDate: activeBooking.visitDate,
              guestCount: activeBooking.peopleCount,
              ticketUrl: compiledTicketUrl,
            });

            setBookingState(BOOKING_STATES.TICKET_READY);
          } catch (verifyErr) {
            console.error("Signature verification failed:", verifyErr);
            setApiError(verifyErr.message || "Payment verification failed. Please contact manager.");
            setBookingState(BOOKING_STATES.PAYMENT_FAILED);
          }
        },
        // OnFailure callback
        (checkoutErr) => {
          console.warn("Razorpay overlay exited/failed:", checkoutErr);
          setApiError(checkoutErr.message || "Checkout aborted.");
          setBookingState(BOOKING_STATES.PAYMENT_FAILED);
        }
      );
    } catch (err) {
      console.error("Booking initialization failed:", err);
      setApiError(err.message || "Could not register reservation. Please try again.");
      setBookingState(BOOKING_STATES.DRAFT);
    }
  };

  /**
   * Safe file downloader wrapper
   */
  const triggerTicketDownload = async () => {
    if (!successPayload.ticketUrl) return;
    try {
      await ticketService.downloadTicket(successPayload.bookingId, successPayload.ticketUrl);
    } catch (err) {
      console.error("Ticket download failed:", err);
      alert("Download failed. We have opened your ticket in a new tab instead!");
    }
  };

  return {
    formData,
    errors,
    bookingState,
    apiError,
    pricingConfig,
    capacityInfo,
    loadingCapacity,
    successPayload,
    totalAmount,
    updateField,
    resetForm,
    handleBookingSubmit,
    triggerTicketDownload,
  };
};
