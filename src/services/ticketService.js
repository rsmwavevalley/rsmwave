import { apiClient } from "../utils/apiClient";

export const ticketService = {
  /**
   * Polls the backend ticket generation service to check if the PDF compilation is complete.
   * If a dedicated status API doesn't exist, resolves after a safe timeout as a fallback.
   */
  pollTicketStatus: async (bookingId, maxRetries = 5, delayMs = 1500) => {
    let retries = 0;
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    while (retries < maxRetries) {
      try {
        // Query the ticket status API
        const statusData = await apiClient.get(`/api/tickets/status/${bookingId}`);
        if (statusData.ready) {
          return `${API_URL}/tickets/${bookingId}.pdf`;
        }
      } catch (err) {
        console.warn("Ticket status route not ready. Falling back to artificial sleep buffer.");
        // Fallback: wait for the PDF compilation write-stream to complete (usually 1.5 seconds)
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return `${API_URL}/tickets/${bookingId}.pdf`;
      }
      
      retries++;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    
    throw new Error("E-Ticket compilation timed out on the server.");
  },

  /**
   * Fetches the generated ticket file as a Blob and triggers a virtual link download.
   * Highly optimized for mobile devices and handles absolute/relative assets.
   */
  downloadTicket: async (bookingId, relativeOrAbsoluteUrl) => {
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      // Normalize URL: ensure it starts with http/https or maps relative web links
      let downloadUrl = relativeOrAbsoluteUrl;
      if (relativeOrAbsoluteUrl.startsWith("/")) {
        downloadUrl = `${BASE_URL}${relativeOrAbsoluteUrl}`;
      } else if (relativeOrAbsoluteUrl.startsWith("C:")) {
        // If backend returned a local absolute path, map it to our static route relative web url
        downloadUrl = `${BASE_URL}/tickets/${bookingId}.pdf`;
      }

      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error("Could not download E-Ticket document.");
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", `RSM-Ticket-${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up DOM assets
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Ticket download failed:", err);
      // Fallback: Attempt simple window.open if blob generation fails
      window.open(relativeOrAbsoluteUrl, "_blank");
    }
  },
};
