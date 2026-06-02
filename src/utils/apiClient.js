const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const apiClient = {
  get: async (endpoint) => {
    try {
      const token = typeof window !== "undefined" ? sessionStorage.getItem("WV_ADMIN_TOKEN") : null;
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["x-admin-pin"] = token;
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `GET Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error(`apiClient GET Error [${endpoint}]:`, err);
      throw err;
    }
  },

  post: async (endpoint, payload) => {
    try {
      const token = typeof window !== "undefined" ? sessionStorage.getItem("WV_ADMIN_TOKEN") : null;
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["x-admin-pin"] = token;
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `POST Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error(`apiClient POST Error [${endpoint}]:`, err);
      throw err;
    }
  },
};
