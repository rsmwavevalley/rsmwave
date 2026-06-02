import { useState, useEffect } from "react";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { useNavigate } from "react-router-dom";

export default function PinScreen() {
  const [pin, setPin] = useState("");
  const [validationError, setValidationError] = useState("");
  const { login, isAuthenticated, loading, authError } = useAdminAuth();
  const navigate = useNavigate();

  // Redirect to dashboard immediately if already verified session exists
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    // Enforce standard 6-digit PIN checks
    if (!pin.trim()) {
      setValidationError("Passcode PIN is required.");
      return;
    }
    if (pin.replace(/\D/g, "").length !== 6) {
      setValidationError("Passcode must be exactly 6 digits.");
      return;
    }

    const success = await login(pin);
    if (success) {
      navigate("/admin/dashboard", { replace: true });
    }
  };

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6); // standard digit lock
    setPin(value);
    if (validationError) setValidationError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-[2rem] p-8 shadow-xl text-gray-900">
        
        {/* HEADER BRAND */}
        <div className="text-center mb-8">
          <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-2">RSM WAVE VALLEY</h2>
          <h1 className="text-3xl font-black tracking-tight text-slate-800">Admin Portal Gate</h1>
          <p className="text-slate-500 text-sm mt-2">
            Outdoor sunlight operations. Passcode authorization required.
          </p>
        </div>

        {/* Dynamic Alerts */}
        {(validationError || authError) && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm font-semibold">
            ⚠ {validationError || authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* PIN Input Slots */}
          <div>
            <label htmlFor="pin-input" className="block text-xs uppercase font-bold text-slate-400 mb-3 tracking-wider text-center">
              Enter 6-Digit Admin Passcode
            </label>
            <input
              id="pin-input"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={handlePinChange}
              placeholder="••••••"
              disabled={loading}
              className="w-full text-center tracking-[1.5em] text-3xl font-black py-4 px-6 border-2 border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition placeholder:opacity-40"
            />
          </div>

          {/* Checkout Action Taps */}
          <button
            type="submit"
            disabled={loading || pin.length !== 6}
            className={`w-full py-5 text-white text-lg font-black rounded-2xl shadow-lg transition duration-200 min-h-[60px] flex items-center justify-center
              ${loading || pin.length !== 6
                ? "bg-slate-300 cursor-not-allowed shadow-none"
                : "bg-blue-600 hover:bg-blue-700 active:scale-[0.99] shadow-blue-600/20"
              }`}
          >
            {loading ? "Authorizing Slots..." : "Access Dashboard 🚀"}
          </button>
        </form>

        {/* Footer Brand Info */}
        <div className="mt-8 text-center text-xs text-slate-400">
          Malari, Gonda operational checkout node.
        </div>
      </div>
    </div>
  );
}
