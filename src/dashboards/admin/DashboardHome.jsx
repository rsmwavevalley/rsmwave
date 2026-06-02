import { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";

export default function DashboardHome() {
  const [stats, setStats] = useState({
    todayBookings: 0,
    todayVisitors: 0,
    todayRevenue: 0,
    verifiedTicketsToday: 0,
  });
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Query KPI statistics
        const statsData = await adminService.getDashboardStats();
        setStats({
          todayBookings: statsData.todayBookings || 0,
          todayVisitors: statsData.todayVisitors || 0,
          todayRevenue: statsData.todayRevenue || 0,
          verifiedTicketsToday: statsData.verifiedTicketsToday || 0,
        });

        // Query check-ins log to populate the Recent Activity Table
        const checkinsData = await adminService.getCheckinLogs();
        setRecentCheckins(checkinsData.slice(0, 5)); // display the recent 5 entries only
      } catch (err) {
        console.error("Dashboard data load failed:", err);
        setError("Could not load dashboard statistics. Check backend API connection.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

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
    <div className="space-y-8 text-slate-800">
      
      {/* 🏙️ PAGE HEADER */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Manager Overview</h2>
          <p className="text-slate-500 text-sm">Real-time water park admissions and sales tracking.</p>
        </div>
        <div className="text-xs bg-slate-200/60 font-bold px-3 py-1.5 rounded-full border border-slate-300/40 text-slate-600">
          Live Syncing 🟢
        </div>
      </div>

      {/* Dynamic Error Indicator */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm font-semibold">
          ⚠ {error}
        </div>
      )}

      {/* 📊 4 RESPONSIVE KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Today's Bookings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[140px]">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Today's Bookings</span>
          <div className="mt-2">
            <span className="text-4xl font-black text-slate-900">{stats.todayBookings}</span>
            <span className="text-xs text-slate-500 block mt-1">Confirmed slots</span>
          </div>
        </div>

        {/* Card 2: Today's Visitors */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[140px]">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Today's Visitors</span>
          <div className="mt-2">
            <span className="text-4xl font-black text-slate-900">{stats.todayVisitors}</span>
            <span className="text-xs text-slate-500 block mt-1">Expected guests</span>
          </div>
        </div>

        {/* Card 3: Today's Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[140px]">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Today's Revenue</span>
          <div className="mt-2">
            <span className="text-4xl font-black text-blue-600">₹{stats.todayRevenue.toLocaleString("en-IN")}</span>
            <span className="text-xs text-slate-500 block mt-1">Processed transactions</span>
          </div>
        </div>

        {/* Card 4: Verified Tickets */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[140px]">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Verified Admissions</span>
          <div className="mt-2">
            <span className="text-4xl font-black text-green-600">{stats.verifiedTicketsToday}</span>
            <span className="text-xs text-slate-500 block mt-1">Checked in at gate</span>
          </div>
        </div>

      </div>

      {/* 📋 RECENT ACTIVITY TABLE */}
      <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm overflow-hidden">
        <h3 className="text-lg font-black mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
          <span>📋</span> Recent Check-ins
        </h3>
        
        {recentCheckins.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No check-in logs recorded today yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-xs font-bold">
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Guest Name</th>
                  <th className="py-3 px-4">Guests</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentCheckins.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-4 font-bold font-mono text-slate-900">{item.bookingId}</td>
                    <td className="py-4 px-4 font-semibold text-slate-800">{item.name || item.booking?.name || "Anonymous"}</td>
                    <td className="py-4 px-4 font-bold">{item.guestCount || item.booking?.peopleCount || 1}</td>
                    <td className="py-4 px-4 font-bold text-slate-900">₹{(item.amount || item.booking?.totalAmount || 0).toLocaleString("en-IN")}</td>
                    <td className="py-4 px-4">
                      <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-green-200">
                        USED
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-slate-500">
                      {item.checkInTime ? new Date(item.checkInTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
