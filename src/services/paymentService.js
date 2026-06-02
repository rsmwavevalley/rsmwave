import { apiClient } from "../utils/apiClient";

export const paymentService = {
  /**
   * Request backend to create a Razorpay Order
   */
  createOrder: async (bookingId) => {
    return await apiClient.post("/api/payments/create-order", { bookingId });
  },

  /**
   * Submit transaction signature to backend to verify payment and trigger ticket generation
   */
  verifyPayment: async (payload) => {
    return await apiClient.post("/api/payments/verify-payment", {
      razorpay_order_id: payload.razorpay_order_id,
      razorpay_payment_id: payload.razorpay_payment_id,
      razorpay_signature: payload.razorpay_signature,
      bookingId: payload.bookingId,
    });
  },

  /**
   * Launch Razorpay Web Checkout Modal using injected window instance
   */
  openRazorpayCheckout: (orderData, bookingData, onSuccess, onFailure) => {
    if (!window.Razorpay) {
      return onFailure(new Error("Razorpay Checkout SDK is not loaded. Please check your internet connection."));
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SvyRpoM6jkG1iC", // fallback dev key matching backend .env
      amount: orderData.amount, // in paise
      currency: orderData.currency || "INR",
      name: "RSM Wave Valley",
      description: "Water Park & Resort Admission E-Ticket",
      order_id: orderData.id,
      handler: function (response) {
        // Payment Succeeded on Razorpay Gate - return payment tokens
        onSuccess({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          bookingId: bookingData.bookingId,
        });
      },
      prefill: {
        name: bookingData.name,
        email: bookingData.email,
        contact: bookingData.mobile,
      },
      theme: {
        color: "#0369a1", // beautiful blue matching branding
      },
      modal: {
        ondismiss: function () {
          onFailure(new Error("Checkout closed by guest."));
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Failed to initialize Razorpay UI overlay:", err);
      onFailure(err);
    }
  },
};
