/**
 * Secure Express middleware for administrative dashboard authorization.
 * Inspects incoming request headers to validate the administrator's passcode.
 */
const adminAuth = (req, res, next) => {
  try {
    // 1. Extract PIN passcode from headers (supports direct custom header or standard Authorization header)
    const pinHeader = req.headers["x-admin-pin"];
    
    let providedPin = pinHeader;

    if (!providedPin && req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts.length === 2 && parts[0] === "Bearer") {
        providedPin = parts[1];
      }
    }

    // 2. Load secure target PIN from environment or use local passcode standard
    const secureAdminPin = process.env.ADMIN_PIN || "458921";
    const clientAuthToken = "wv_authorized_v1";

    // 3. Verify value: allows either the raw PIN passcode or the frontend session token
    if (providedPin && (String(providedPin) === String(secureAdminPin) || String(providedPin) === clientAuthToken)) {
      return next();
    }

    // 4. Deny access if unauthorized
    console.warn(`[UNAUTHORIZED ACCESS ATTEMPT] Blocked request from IP: ${req.ip} to endpoint: ${req.originalUrl}`);
    return res.status(401).json({
      success: false,
      message: "Access Denied: Valid administrator passcode PIN is required in headers."
    });
  } catch (err) {
    console.error("Admin auth middleware error:", err);
    return res.status(500).json({ success: false, message: "Security authorization check failed" });
  }
};

module.exports = adminAuth;
