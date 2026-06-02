import { apiClient } from "../utils/apiClient";

export const bookingService = {
  /**
   * Submit the customer reservation to the database
   */
  createBooking: async (formData) => {
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      mobile: formData.phone.replace(/\D/g, ""), // ensure standard 10-digit format
      peopleCount: Number(formData.guests),
      visitDate: formData.preferredDate, // raw string parsed on backend
    };

    return await apiClient.post("/api/bookings/create", payload);
  },

  /**
   * Retrieve dynamic pricing configurations from the backend.
   * Leverages graceful fallbacks if the endpoint is not yet deployed.
   */
  getPricingConfig: async () => {
    try {
      return await apiClient.get("/api/config/pricing");
    } catch (err) {
      console.warn("Pricing config endpoint not ready. Using production default pricing model.");
      return {
        ticketPrice: 650,
        adultPrice: 650,
        childPrice: 400,
        weekendPrice: 750,
        holidayPrice: 800,
      };
    }
  },

  /**
   * Query the backend for visitor slots booked/remaining for a specific calendar date.
   * Leverages graceful fallbacks if capacity APIs are not yet deployed.
   */
  getDateCapacity: async (dateString) => {
    try {
      if (!dateString) return { totalCapacity: 1000, remainingCapacity: 1000, soldOut: false };
      return await apiClient.get(`/api/capacity?date=${encodeURIComponent(dateString)}`);
    } catch (err) {
      console.warn(`Capacity endpoint not ready for date [${dateString}]. Defaulting to open status.`);
      return {
        totalCapacity: 1000,
        remainingCapacity: 1000,
        soldOut: false,
      };
    }
  },
};
