import { apiClient } from "../utils/apiClient";

export const adminService = {
  /**
   * Submit entered PIN to backend for authentication validation
   */
  verifyPin: async (pin) => {
    return await apiClient.post("/api/admin/verify-pin", { pin: String(pin) });
  },

  /**
   * Fetch manager dashboard stats metrics
   */
  getDashboardStats: async () => {
    return await apiClient.get("/api/admin/dashboard");
  },

  /**
   * Fetch all bookings records
   */
  getBookings: async () => {
    return await apiClient.get("/api/admin/bookings");
  },

  /**
   * Query the gate scanner verification endpoint
   */
  verifyTicket: async (bookingId) => {
    return await apiClient.post("/api/admin/verify-ticket", { bookingId: String(bookingId) });
  },

  /**
   * Log the customer entry admittance at the gate
   */
  checkinTicket: async (bookingId) => {
    return await apiClient.post("/api/admin/checkin", { bookingId: String(bookingId) });
  },

  /**
   * Retrieve gate check-in entry audit logs
   */
  getCheckinLogs: async () => {
    return await apiClient.get("/api/admin/checkins");
  },
};
