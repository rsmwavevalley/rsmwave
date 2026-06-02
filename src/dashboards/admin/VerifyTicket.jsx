import { useState, useEffect, useRef } from "react";
import { adminService } from "../../services/adminService";
import { Html5Qrcode } from "html5-qrcode";
import { useLocation } from "react-router-dom";

export default function VerifyTicket() {
  const location = useLocation();
  
  // Intake and scanning states
  const [manualId, setManualId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Camera scanner states
  const [scanning, setScanning] = useState(false);
  const [scannerInstance, setScannerInstance] = useState(null);
  const qrRef = useRef(null);

  // Verification result card payload
  const [result, setResult] = useState(null);
  const [checkinSuccess, setCheckinSuccess] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState(false);

  // Auto-fill ID from bookings navigation state if available
  useEffect(() => {
    if (location.state && location.state.bookingId) {
      setManualId(location.state.bookingId);
      // Automatically trigger verification on direct page link
      verifyTicketId(location.state.bookingId);
    }
  }, [location.state]);

  // Clean up scanner instances on navigate/unmount
  useEffect(() => {
    return () => {
      if (scannerInstance && scannerInstance.isScanning) {
        scannerInstance.stop().catch((err) => console.error("Scanner cleanup error:", err));
      }
    };
  }, [scannerInstance]);

  /**
   * Initialize Camera scanner overlay
   */
  const startCamera = async () => {
    setError(null);
    setResult(null);
    setCheckinSuccess(false);
    setScanning(true);

    // Defer camera initialization to the next event loop tick.
    // This ensures React has completed its state re-render and mounted <div id="reader"> in the DOM.
    setTimeout(async () => {
      try {
        const html5Qrcode = new Html5Qrcode("reader");
        setScannerInstance(html5Qrcode);

        const config = {
          fps: 10,
          qrbox: (width, height) => {
            const size = Math.min(width, height) * 0.7; // responsive box focus
            return { width: size, height: size };
          }
        };

        await html5Qrcode.start(
          { facingMode: "environment" }, // prioritize rear camera for gatekeepers
          config,
          (decodedText) => {
            // Success parsed callback
            handleParsedQR(decodedText, html5Qrcode);
          },
          (errorMessage) => {
            // Keep scanner logs quiet during search frames
          }
        );
      } catch (err) {
        console.error("Camera access failure:", err);
        setError("Could not activate camera. Please ensure permissions are granted.");
        setScanning(false);
      }
    }, 50);
  };

  /**
   * Stop camera and reset interface
   */
  const stopCamera = async () => {
    if (scannerInstance) {
      try {
        await scannerInstance.stop();
      } catch (err) {
        console.warn("Scanner stop warning:", err);
      }
      setScannerInstance(null);
    }
    setScanning(false);
  };

  /**
   * Intercept QR parsing and lookup database bookings
   */
  const handleParsedQR = async (decodedString, activeScanner) => {
    // Attempt camera shut down immediately to prevent repeat triggers
    try {
      await activeScanner.stop();
      setScanning(false);
      setScannerInstance(null);
    } catch (err) {
      console.warn("Post-scan camera shut down error:", err);
    }

    let parsedId = decodedString.trim();

    // Check if the decoded payload is JSON and extract bookingId
    try {
      const jsonPayload = JSON.parse(decodedString);
      if (jsonPayload && jsonPayload.bookingId) {
        parsedId = jsonPayload.bookingId;
      }
    } catch (e) {
      // Safe fallback: Check if it is the multiline "Booking ID: RSM-XXXXXX" text format
      const match = decodedString.match(/Booking ID:\s*(RSM-\d+)/i);
      if (match && match[1]) {
        parsedId = match[1];
      }
    }

    await verifyTicketId(parsedId);
  };

  /**
   * POST payload to verify-ticket endpoint on backend
   */
  const verifyTicketId = async (id) => {
    if (!id.trim()) {
      setError("Please input a valid Booking reference ID.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setCheckinSuccess(false);

    try {
      const ticketData = await adminService.verifyTicket(id.trim());
      setResult(ticketData);
    } catch (err) {
      console.error("Ticket verification check failed:", err);
      setError(err.message || "Failed to fetch verification status. Verify network connectivity.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Submit ticket ID to check-in endpoint to admit guest and set database flag to USED
   */
  const handleAllowEntry = async () => {
    if (!result || !result.bookingId) return;

    setCheckinLoading(true);
    setError(null);

    try {
      const response = await adminService.checkinTicket(result.bookingId);
      if (response.success) {
        setCheckinSuccess(true);
        
        // Instant re-fetch from the backend to get the updated database states and transition to ALREADY_USED
        const updatedData = await adminService.verifyTicket(result.bookingId);
        setResult(updatedData);

        // After 2.5 seconds, automatically reset the search panel/scanner interface for the next guest
        setTimeout(() => {
          setResult(null);
          setManualId("");
          setCheckinSuccess(false);
        }, 1500);
      } else {
        throw new Error(response.message || "Could not log admission entry.");
      }
    } catch (err) {
      console.error("Checkin admittance error:", err);
      setError(err.message || "Could not process gate admission.");
    } finally {
      setCheckinLoading(false);
    }
  };

  // Status Badge configurations (high contrast, readable in bright Gonda sunlight)
  const getStatusBadgeConfig = (state, fallback) => {
    const activeState = state || fallback;
    switch (activeState) {
      case "VALID_FOR_ENTRY":
      case "VALID":
        return { label: "Valid For Entry", style: "bg-green-600 text-white border-green-700" };
      case "ALREADY_USED":
      case "USED":
        return { label: "Ticket Already Used", style: "bg-red-600 text-white border-red-700" };
      case "PAYMENT_PENDING":
      case "UNPAID":
        return { label: "Payment Not Completed", style: "bg-orange-500 text-white border-orange-600" };
      case "EXPIRED":
        return { label: "Visit Date Expired", style: "bg-slate-500 text-white border-slate-600" };
      case "FUTURE_VISIT_DATE":
      case "NOT_VALID_YET":
        return { label: "Valid Ticket - Visit Date Not Reached", style: "bg-yellow-500 text-slate-900 border-yellow-600" };
      case "CANCELLED":
        return { label: "Booking Cancelled", style: "bg-red-600 text-white border-red-700" };
      case "NOT_FOUND":
      default:
        return { label: "Ticket Not Found", style: "bg-red-600 text-white border-red-700" };
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-slate-800 pb-10">
      
      {/* HEADER */}
      <div className="text-center border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-black tracking-tight flex items-center justify-center gap-2">
          <span>📷</span> Gate Admission Scanner
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Scan QR passes or input booking IDs manually. Optimized for Android check-ins under sunlight.
        </p>
      </div>

      {/* Dynamic Alerts */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm font-semibold text-center">
          ⚠ {error}
        </div>
      )}

      {/* 📷 QR CAMERA CONTAINER (Optimized aspect for mobile viewports) */}
      <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex flex-col items-center">
        {!scanning ? (
          <button
            onClick={startCamera}
            className="w-full py-6 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-2xl font-black text-xl shadow-lg shadow-blue-600/20 transition min-h-[60px] flex items-center justify-center gap-2"
          >
            📷 Launch Camera Scanner
          </button>
        ) : (
          <div className="w-full flex flex-col items-center space-y-4">
            <div className="w-full max-w-sm aspect-square overflow-hidden bg-slate-900 border border-slate-300 rounded-2xl relative shadow-inner">
              <div id="reader" className="w-full h-full object-cover"></div>
            </div>
            <button
              onClick={stopCamera}
              className="w-full py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-2xl font-bold text-sm min-h-[50px]"
            >
              Cancel Camera Scan ✕
            </button>
          </div>
        )}
      </div>

      {/* 🔍 MANUAL CHECKOUT FALLBACK SLOT */}
      {!scanning && (
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">Manual Ticket Search</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={manualId}
              onChange={(e) => setManualId(e.target.value.toUpperCase())}
              placeholder="e.g. RSM-373386"
              className="flex-1 px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-bold min-h-[50px]"
            />
            <button
              onClick={() => verifyTicketId(manualId)}
              disabled={loading || !manualId.trim()}
              className="px-6 bg-slate-800 hover:bg-slate-900 text-white font-black text-sm rounded-xl min-h-[50px]"
            >
              Search 🔍
            </button>
          </div>
        </div>
      )}

      {/* 🔄 PROCESSING LOADING SCREEN */}
      {loading && (
        <div className="bg-white border border-slate-200 rounded-[2rem] p-10 shadow-sm text-center">
          <div className="relative w-10 h-10 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin" />
          </div>
          <p className="text-slate-500 font-bold text-sm">Accessing database servers...</p>
        </div>
      )}

      {/* 🎫 VERIFICATION RESULT CARD (Large typography and touch triggers) */}
      {result && !loading && (
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 shadow-md space-y-6">
          
          {/* Status Badge Block (60px high, high density color) */}
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2 text-center">Verification Status</span>
            <div className={`w-full py-4 text-center font-black text-lg rounded-2xl border uppercase min-h-[56px] flex items-center justify-center tracking-wide
              ${getStatusBadgeConfig(result.verificationState, result.verificationStatus).style}`}
            >
              {result.message || getStatusBadgeConfig(result.verificationState, result.verificationStatus).label}
            </div>
          </div>

          {/* Admittance Success Banner */}
          {checkinSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-green-800 text-center font-bold text-sm space-y-1">
              <div>🎉 Guest Checked In Successfully</div>
              <div className="text-xs text-green-600 font-medium">✓ Entry Recorded</div>
            </div>
          )}

          {/* Customer Metadata Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 md:p-6 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Ticket Reference ID</span>
              <strong className="text-sm text-slate-900 font-bold font-mono">{result.bookingId}</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Guests Count</span>
              <strong className="text-sm text-slate-900 font-black">{result.guestCount} Guest(s)</strong>
            </div>
            <hr className="col-span-2 border-slate-200" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Guest Name</span>
              <strong className="text-sm text-slate-900 font-bold">{result.name}</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Mobile Number</span>
              <strong className="text-sm text-slate-900 font-medium">{result.mobile}</strong>
            </div>
            <hr className="col-span-2 border-slate-200" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Scheduled Visit Date</span>
              <strong className="text-sm text-slate-900 font-bold">
                {new Date(result.visitDate).toLocaleDateString("en-IN", {
                  day: "numeric", month: "long", year: "numeric"
                })}
              </strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Paid (Razorpay)</span>
              <strong className="text-sm text-slate-900 font-black">₹{result.amount.toLocaleString("en-IN")}</strong>
            </div>
          </div>

          {/* Admittance Decision Buttons Layer (60px high targets) */}
          <div className="space-y-3">
            {(result.verificationState === "VALID_FOR_ENTRY" || result.verificationStatus === "VALID") ? (
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleAllowEntry}
                  disabled={checkinLoading}
                  className="w-full py-5 bg-gradient-to-r from-green-600 to-emerald-500 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-2xl font-black text-lg shadow-lg shadow-green-600/20 disabled:shadow-none transition min-h-[60px] flex items-center justify-center"
                >
                  {checkinLoading ? "Checking Guest In..." : "✓ ALLOW ENTRY"}
                </button>
                <button
                  onClick={() => setResult(null)}
                  disabled={checkinLoading}
                  className="w-full py-4 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-800 text-white rounded-2xl font-bold text-sm min-h-[50px]"
                >
                  ✕ REJECT ENTRY
                </button>
              </div>
            ) : (
              <button
                onClick={() => setResult(null)}
                disabled={checkinLoading}
                className="w-full py-4 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-700 text-white rounded-2xl font-bold text-sm min-h-[50px]"
              >
                Scan / Check Next Ticket 🔄
              </button>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
