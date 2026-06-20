import { useBooking, BOOKING_STATES } from "../hooks/useBooking";
import { motion, AnimatePresence } from "framer-motion";

const InputField = ({ icon, label, type = "text", value, onChange, placeholder, error, min }) => (
  <div className="group relative">
    <div className="relative">
      <div className={`absolute inset-0 bg-white/40 backdrop-blur-xl rounded-2xl border transition-all duration-300
        ${error
          ? "border-red-400 bg-red-50/30"
          : "border-white/60 group-focus-within:border-white/80 group-focus-within:bg-white/50"
        }`}
      />
      <div className="relative p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg shadow-lg bg-gradient-to-br
            ${error ? "from-red-400 to-rose-500" : "from-blue-500 to-cyan-500"}`}>
            {icon}
          </div>
          <div className="flex items-center gap-2">
            <label className={`text-sm font-semibold transition-colors
              ${error ? "text-red-500" : "text-gray-700 group-focus-within:text-blue-600"}`}>
              {label}
            </label>
            <span className="text-red-400 text-sm font-bold">*</span>
          </div>
        </div>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-400 text-base font-medium"
        />
        {error && (
          <p className="mt-2 text-xs font-medium text-red-500 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
      </div>
    </div>
  </div>
);

export default function Booking() {
  const {
    formData,
    errors,
    bookingState,
    apiError,
    pricingConfig,
    capacityInfo,
    loadingCapacity,
    successPayload,
    totalAmount,
    baseAmount,
    discountAmount,
    couponCode,
    setCouponCode,
    updateField,
    resetForm,
    handleBookingSubmit,
    triggerTicketDownload,
  } = useBooking();

  // Unified WhatsApp backup helper URL
  const getWhatsAppBackupUrl = () => {
    const formattedDate = formData.preferredDate
      ? new Date(formData.preferredDate).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      })
      : "Not specified";

    const isCouponApplied = couponCode && ["OMGS", "RAZAMS", "JOBEEFIE"].includes(couponCode.trim().toUpperCase());

    const waMsg = [
      `*WAVE VALLEY — Manual Booking Request*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `Guest: ${formData.name}`,
      `Phone: +91 ${formData.phone}`,
      `Email: ${formData.email}`,
      `Visit Date: ${formattedDate}`,
      `Group Size: ${formData.guests} Guest(s)`,
      `Coupon Applied: ${isCouponApplied ? couponCode.trim().toUpperCase() : "None"}`,
      `Total Paid: ₹${totalAmount}`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `_Note: Submitted via Web fallback because checkout was interrupted._`,
    ].join("\n");

    return `https://wa.me/919335561261?text=${encodeURIComponent(waMsg)}`;
  };

  return (
    <div id="booking">
      <section id="contact" className="min-h-screen relative overflow-hidden py-12 md:py-20 px-4">
        {/* 🌊 STATIC BACKGROUND WITH BLURS */}
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50" />
          <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-blue-300 to-cyan-200 rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-tr from-purple-300 to-pink-200 rounded-full blur-3xl opacity-15" />
        </div>

        <div className="relative z-10">
          {/* HEADER BRANDING */}
          <div className="text-center mb-16 md:mb-20">
            <motion.div
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full backdrop-blur-xl bg-gradient-to-r from-orange-400/20 to-pink-400/20 border border-orange-300/40 mb-8"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <span className="text-xl">✨</span>
              <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent font-bold text-sm tracking-widest">
                EXCLUSIVE ONLINE E-TICKET RESERVATION
              </span>
            </motion.div>

            <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-cyan-700 bg-clip-text text-transparent">
                Plan Your Perfect
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Water Adventure
              </span>
            </h2>

            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-light">
              Skip the queues at Gonda. Get instant secure E-Tickets via Razorpay and download your QR check-in pass immediately!
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">

              {/* 1. DRAFT STATE & PAYMENT FAILED VIEWS (SHOWS BOOKING FORM) */}
              {(bookingState === BOOKING_STATES.DRAFT || bookingState === BOOKING_STATES.PAYMENT_FAILED) && (
                <motion.form
                  key="booking-form"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  onSubmit={handleBookingSubmit}
                  className="space-y-8"
                  noValidate
                >
                  {/* Error Banner for aborts or failed payments */}
                  {apiError && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-800 shadow-md">
                      <h4 className="font-bold text-lg mb-2">⚠ Checkout Interrupted</h4>
                      <p className="text-sm mb-4">{apiError}</p>
                      <div className="flex flex-wrap gap-4">
                        <button
                          type="button"
                          onClick={handleBookingSubmit}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition"
                        >
                          Retry Online Payment 🔄
                        </button>
                        <a
                          href={getWhatsAppBackupUrl()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-500 hover:bg-green-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl inline-flex items-center gap-1.5 transition"
                        >
                          Book Manually on WhatsApp 💬
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Section A: Your Information */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl shadow-lg">
                        👤
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Your Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField
                        icon="👤"
                        label="Full Name"
                        value={formData.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        placeholder="Enter your name"
                        error={errors.name}
                      />
                      <InputField
                        icon="📧"
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="your@email.com"
                        error={errors.email}
                      />
                      <div className="md:col-span-2">
                        <InputField
                          icon="📞"
                          label="Phone Number"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => updateField("phone", e.target.value)}
                          placeholder="10-digit mobile number"
                          error={errors.phone}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section B: Visit Details */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl shadow-lg">
                        📅
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Visit Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField
                        icon="📅"
                        label="Preferred Date"
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => updateField("preferredDate", e.target.value)}
                        error={errors.preferredDate}
                      />

                      {/* Guest Counter */}
                      <div className="group relative">
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/60 transition-all duration-300" />
                        <div className="relative p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg shadow-lg">
                              👥
                            </div>
                            <label className="text-sm font-semibold text-gray-700">Number of Guests</label>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                              <button
                                type="button"
                                onClick={() => updateField("guests", Math.max(1, formData.guests - 1))}
                                className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 hover:bg-gray-50 active:scale-90 transition-all"
                              >
                                -
                              </button>
                              <span className="text-3xl font-black text-gray-900 w-12 text-center">{formData.guests}</span>
                              <button
                                type="button"
                                onClick={() => updateField("guests", formData.guests + 1)}
                                className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 hover:bg-gray-50 active:scale-90 transition-all"
                              >
                                +
                              </button>
                            </div>
                            {errors.guests && (
                              <span className="text-xs font-bold text-red-500">{errors.guests}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Coupon Code Input */}
                      <div className="group relative md:col-span-2">
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/60 group-focus-within:border-white/80 group-focus-within:bg-white/50 transition-all duration-300" />
                        <div className="relative p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white text-lg shadow-lg">
                              🎟
                            </div>
                            <label className="text-sm font-semibold text-gray-700">Coupon Code</label>
                          </div>
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder="PLACE YOUR COUPON CODE if you have! "
                            className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-400 text-base font-medium uppercase"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Pricing and Capacity Monitor */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Dynamic Pricing breakdown Card */}
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-2xl p-6 shadow-xl space-y-4">
                      <div className="flex justify-between items-center border-b border-white/20 pb-2">
                        <span className="text-xs font-bold uppercase tracking-widest opacity-80">Pricing Summary</span>
                        <span className="bg-white/20 text-xs px-2.5 py-1 rounded-full font-bold">₹{pricingConfig.ticketPrice || 600}/Guest</span>
                      </div>
                      <div className="space-y-2 text-sm font-medium">
                        <div className="flex justify-between">
                          <span className="opacity-80">Guests Count:</span>
                          <span className="font-bold">{formData.guests} Guest(s)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-80">Base Amount:</span>
                          <span className="font-bold">₹{baseAmount}</span>
                        </div>
                        {couponCode && ["OMGS", "RAZAMS", "JOBEEFIE"].includes(couponCode.trim().toUpperCase()) && (
                          <div className="flex justify-between text-yellow-200">
                            <span className="opacity-90">Discount Applied:</span>
                            <span className="font-bold">-₹{discountAmount}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-black border-t border-white/20 pt-2">
                          <span>Final Payable:</span>
                          <span>₹{totalAmount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Future Capacity Warning Widget */}
                    <div className="bg-white/50 backdrop-blur-xl border border-white/80 rounded-2xl p-6 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">Park Capacity Check</span>
                        {loadingCapacity ? (
                          <p className="text-sm text-gray-500">Checking slot availability...</p>
                        ) : formData.preferredDate ? (
                          <div>
                            {capacityInfo.soldOut ? (
                              <p className="text-red-500 text-lg font-black">Selected date sold out! ❌</p>
                            ) : capacityInfo.remainingCapacity < 200 ? (
                              <p className="text-amber-600 text-lg font-black">Only {capacityInfo.remainingCapacity} slots left! ⏳</p>
                            ) : (
                              <p className="text-green-600 text-lg font-bold">Slots Available (100% capacity open) ✓</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Select a visit date to inspect park slots.</p>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-4">
                        RSM Wave Valley reserves slot capacity strictly to 1000 guests/day for maximum safety.
                      </p>
                    </div>
                  </div>

                  {/* Section C: Additional Message */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/60 group-focus-within:border-white/80 group-focus-within:bg-white/50 transition-all duration-300" />
                    <div className="relative p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white text-lg shadow-lg">
                          💬
                        </div>
                        <label className="text-sm font-semibold text-gray-700">Special Requests (Optional)</label>
                      </div>
                      <textarea
                        value={formData.message}
                        onChange={(e) => updateField("message", e.target.value)}
                        placeholder="Please note any physical challenges, large events or dietary requirements here..."
                        className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-400 text-base font-medium min-h-[120px] resize-none"
                      />
                    </div>
                  </div>

                  {/* Submit Trigger */}
                  <motion.button
                    type="submit"
                    disabled={capacityInfo.soldOut}
                    whileHover={capacityInfo.soldOut ? {} : { scale: 1.01 }}
                    whileTap={capacityInfo.soldOut ? {} : { scale: 0.98 }}
                    className={`w-full py-6 text-white rounded-2xl font-black text-xl shadow-xl transition-all
                    ${capacityInfo.soldOut
                        ? "bg-gray-400 cursor-not-allowed shadow-none"
                        : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-blue-500/40 shadow-blue-500/25"
                      }`}
                  >
                    {capacityInfo.soldOut ? "Selected Date Sold Out ❌" : "Confirm & Pay Online 🚀"}
                  </motion.button>
                </motion.form>
              )}

              {/* 2. LOADING STATES VIEWS */}
              {(bookingState === BOOKING_STATES.BOOKING_CREATED ||
                bookingState === BOOKING_STATES.PAYMENT_PENDING ||
                bookingState === BOOKING_STATES.PAYMENT_SUCCESS ||
                bookingState === BOOKING_STATES.TICKET_GENERATING) && (
                  <motion.div
                    key="loading-overlay"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white/80 backdrop-blur-2xl p-12 rounded-[2.5rem] border border-white text-center shadow-2xl min-h-[400px] flex flex-col justify-center items-center"
                  >
                    <div className="relative w-20 h-20 mb-8">
                      <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
                      <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin" />
                    </div>

                    <h3 className="text-3xl font-black text-gray-900 mb-4">
                      {bookingState === BOOKING_STATES.BOOKING_CREATED && "Initializing Booking..."}
                      {bookingState === BOOKING_STATES.PAYMENT_PENDING && "Opening Payment Gateway..."}
                      {bookingState === BOOKING_STATES.PAYMENT_SUCCESS && "Authenticating Transaction..."}
                      {bookingState === BOOKING_STATES.TICKET_GENERATING && "Compiling E-Ticket PDF..."}
                    </h3>

                    <p className="text-gray-600 text-lg max-w-md mx-auto">
                      {bookingState === BOOKING_STATES.BOOKING_CREATED && "Caching reservation codes inside database servers."}
                      {bookingState === BOOKING_STATES.PAYMENT_PENDING && "Loading secure Razorpay modal. Please do not close this window."}
                      {bookingState === BOOKING_STATES.PAYMENT_SUCCESS && "Verifying secure payment signatures. Almost done!"}
                      {bookingState === BOOKING_STATES.TICKET_GENERATING && "Generating encrypted entry QR codes and compiling ticket documentation."}
                    </p>
                  </motion.div>
                )}

              {/* 3. SUCCESS / TICKET READY DASHBOARD */}
              {bookingState === BOOKING_STATES.TICKET_READY && (
                <motion.div
                  key="success-receipt"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white/80 backdrop-blur-2xl p-8 md:p-12 rounded-[2.5rem] border border-white shadow-2xl"
                >
                  {/* Success Indicator */}
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white text-4xl mx-auto mb-6 shadow-lg shadow-green-500/20">
                    ✓
                  </div>

                  <h3 className="text-3xl md:text-4xl font-black text-gray-900 text-center mb-2">🎉 Booking Confirmed!</h3>
                  <p className="text-gray-600 text-center mb-8 font-light text-base md:text-lg">
                    Thank you, {formData.name || successPayload.name}. Your payment was verified and slot capacity has been locked.
                  </p>

                  {/* E-Ticket Dashboard Info */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 md:p-8 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
                    <div>
                      <span className="text-xs uppercase font-bold text-gray-400 block mb-1">Booking Identification</span>
                      <strong className="text-base text-gray-900 font-bold font-mono">{successPayload.bookingId}</strong>
                    </div>
                    <div>
                      <span className="text-xs uppercase font-bold text-gray-400 block mb-1">Razorpay Payment ID</span>
                      <strong className="text-base text-gray-900 font-bold font-mono">{successPayload.paymentId}</strong>
                    </div>
                    <hr className="md:col-span-2 border-slate-200" />
                    <div>
                      <span className="text-xs uppercase font-bold text-gray-400 block mb-1">Scheduled Visit Date</span>
                      <strong className="text-base text-gray-900 font-bold">
                        {new Date(successPayload.visitDate).toLocaleDateString("en-IN", {
                          day: "numeric", month: "long", year: "numeric"
                        })}
                      </strong>
                    </div>
                    <div>
                      <span className="text-xs uppercase font-bold text-gray-400 block mb-1">Allocated Guests Slots</span>
                      <strong className="text-base text-gray-900 font-bold">{successPayload.guestCount} Guest(s)</strong>
                    </div>
                  </div>

                  {/* Mobile Responsive Action Drawer */}
                  <div className="space-y-4">
                    <button
                      onClick={triggerTicketDownload}
                      className="w-full py-5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2"
                    >
                      <span>📥</span> Download E-Ticket (PDF)
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <a
                        href="https://wa.me/919335561261"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm text-center shadow-lg shadow-green-500/10 transition-all inline-flex items-center justify-center gap-1.5"
                      >
                        Need Help? Chat on WhatsApp 💬
                      </a>

                      <button
                        onClick={resetForm}
                        className="py-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold text-sm text-center transition-all"
                      >
                        Book Another Ticket 🔄
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}