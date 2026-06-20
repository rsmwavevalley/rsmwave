import { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import { useNavigate } from "react-router-dom";

export default function BookingsList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // 'all', 'today', 'upcoming', 'past'
  const [paymentFilter, setPaymentFilter] = useState("all"); // 'all', 'PAID', 'PENDING'

  const navigate = useNavigate();

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminService.getBookings();
        setBookings(data || []);
      } catch (err) {
        console.error("Bookings load failed:", err);
        setError("Could not load booking records. Check API connection.");
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
  }, []);

  // Filter & Query logic
  const filteredBookings = bookings.filter((booking) => {
    // 1. Search Query mapping (Name, Phone, or Booking ID)
    const matchSearch =
      booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.mobile.includes(searchTerm);

    // 2. Payment Status filter
    const matchPayment = paymentFilter === "all" || booking.paymentStatus === paymentFilter;

    // 3. Date boundary mapping
    const bookingDate = new Date(booking.visitDate);
    bookingDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let matchDate = true;
    if (dateFilter === "today") {
      matchDate = bookingDate.getTime() === today.getTime();
    } else if (dateFilter === "upcoming") {
      matchDate = bookingDate > today;
    } else if (dateFilter === "past") {
      matchDate = bookingDate < today;
    }

    return matchSearch && matchPayment && matchDate;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-slate-200 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Booking Records</h2>
          <p className="text-slate-500 text-sm">View, query, and verify tickets database.</p>
        </div>
      </div>

      {/* Dynamic Alerts */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm font-semibold">
          ⚠ {error}
        </div>
      )}

      {/* 🔍 SEARCH AND FILTERS BAR (optimized for gate mobile check-in) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Search by Guest Name, Mobile, or Booking ID..."
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm min-h-[48px]"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Date Filter Select */}
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Visit Filter</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold outline-none bg-slate-50 min-h-[44px]"
            >
              <option value="all">All Dates</option>
              <option value="today">Today's Visits</option>
              <option value="upcoming">Upcoming Visits</option>
              <option value="past">Past Visits</option>
            </select>
          </div>

          {/* Payment Filter Select */}
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Payment Filter</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold outline-none bg-slate-50 min-h-[44px]"
            >
              <option value="all">All Payments</option>
              <option value="PAID">PAID Only</option>
              <option value="PENDING">PENDING Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* 📊 BOOKINGS DISPLAY VIEWPORTS */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-[2rem] p-12 text-center text-slate-400 text-sm shadow-sm">
          No records match active search queries or filters.
        </div>
      ) : (
        <>
          {/* Desktop Table View (> 768px) */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-xs font-bold">
                    <th className="py-3 px-4">Booking ID</th>
                    <th className="py-3 px-4">Guest Name</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Visit Date</th>
                    <th className="py-3 px-4">Guests</th>
                    <th className="py-3 px-4">Coupon</th>
                    <th className="py-3 px-4">Discount</th>
                    <th className="py-3 px-4">Final Paid</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredBookings.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-4 font-bold font-mono text-slate-900">{item.bookingId}</td>
                      <td className="py-4 px-4 font-semibold text-slate-800">{item.name}</td>
                      <td className="py-4 px-4 font-medium text-slate-600">{item.mobile}</td>
                      <td className="py-4 px-4 font-bold">
                        {new Date(item.visitDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="py-4 px-4 font-bold text-center">{item.peopleCount}</td>
                      <td className="py-4 px-4 font-semibold text-slate-700">{item.couponCode || "-"}</td>
                      <td className="py-4 px-4 font-bold text-slate-600">{item.discountAmount ? `₹${item.discountAmount}` : "-"}</td>
                      <td className="py-4 px-4 font-bold text-slate-900">₹{item.totalAmount.toLocaleString("en-IN")}</td>
                      <td className="py-4 px-4">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded uppercase border
                          ${item.paymentStatus === "PAID"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-orange-50 text-orange-700 border-orange-200"
                          }`}
                        >
                          {item.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {item.paymentStatus === "PAID" ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                            VALID
                          </span>
                        ) : (
                          <span className="bg-orange-50 text-orange-700 border border-orange-200 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                            UNPAID
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => navigate("/admin/verify-ticket", { state: { bookingId: item.bookingId } })}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-3 rounded-lg transition min-h-[36px]"
                        >
                          Verify 📷
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Collapsible Cards View (< 768px) */}
          <div className="md:hidden space-y-4">
            {filteredBookings.map((item, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Booking Reference</span>
                    <strong className="font-mono text-base font-black text-slate-900">{item.bookingId}</strong>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded uppercase border
                    ${item.paymentStatus === "PAID"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-orange-50 text-orange-700 border-orange-200"
                    }`}
                  >
                    {item.paymentStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Guest Name</span>
                    <span className="font-bold text-slate-800">{item.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Mobile Number</span>
                    <span className="font-semibold text-slate-600">{item.mobile}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Visit Date</span>
                    <span className="font-bold">
                      {new Date(item.visitDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Guests & Pricing</span>
                    <span className="font-bold text-slate-900">{item.peopleCount} Guests {item.couponCode ? `(${item.couponCode})` : ""} / Paid: ₹{item.totalAmount}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => navigate("/admin/verify-ticket", { state: { bookingId: item.bookingId } })}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md shadow-blue-600/10 transition min-h-[48px] flex items-center justify-center"
                  >
                    Launch Check-in Scanner 📷
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}
