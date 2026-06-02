import { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";

export default function CheckinHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search query state
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadCheckinLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminService.getCheckinLogs();
        setLogs(data || []);
      } catch (err) {
        console.error("Check-in logs load failed:", err);
        setError("Could not load audit check-in history. Check backend API connection.");
      } finally {
        setLoading(false);
      }
    };
    loadCheckinLogs();
  }, []);

  // Search logic matching guest name or booking ID
  const filteredLogs = logs.filter((log) => {
    const matchId = log.bookingId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchName = log.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      log.booking?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchId || matchName;
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
      <div className="text-left border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <span>⏳</span> Check-In History
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Review admitted ticket rosters and check-in audit logs.
        </p>
      </div>

      {/* Dynamic Alerts */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm font-semibold text-center">
          ⚠ {error}
        </div>
      )}

      {/* 🔍 SEARCH AND FILTERS BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 Search check-ins by Guest Name or Booking ID..."
          className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-medium min-h-[48px]"
        />
      </div>

      {/* 📊 HISTORY LIST GRID */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-[2rem] p-12 text-center text-slate-400 text-sm shadow-sm">
          No admission logs recorded yet today.
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
                    <th className="py-3 px-4 text-center">Guests</th>
                    <th className="py-3 px-4 text-center">Admitted Status</th>
                    <th className="py-3 px-4">Check-In Time</th>
                    <th className="py-3 px-4 text-right">Operator Node</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredLogs.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-4 font-bold font-mono text-slate-900">{item.bookingId}</td>
                      <td className="py-4 px-4 font-semibold text-slate-800">
                        {item.name || item.booking?.name || "Anonymous"}
                      </td>
                      <td className="py-4 px-4 font-bold text-center">
                        {item.guestCount || item.booking?.peopleCount || 1} Guest(s)
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-black px-2.5 py-1 rounded uppercase">
                          USED
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-600">
                        {item.checkInTime ? new Date(item.checkInTime).toLocaleString("en-IN", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: true
                        }) : new Date().toLocaleString("en-IN", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: true
                        })}
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-slate-400 text-xs">
                        {item.operator || "GATE_STAFF_NODE"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards View (< 768px) */}
          <div className="md:hidden space-y-4">
            {filteredLogs.map((item, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Booking Reference</span>
                    <strong className="font-mono text-base font-black text-slate-900">{item.bookingId}</strong>
                  </div>
                  <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-black px-2.5 py-1 rounded uppercase">
                    USED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Guest Name</span>
                    <span className="font-bold text-slate-800">{item.name || item.booking?.name || "Anonymous"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Total Guests Admitted</span>
                    <span className="font-bold text-slate-900">{item.guestCount || item.booking?.peopleCount || 1} Guest(s)</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Gate Entrance Timestamp</span>
                    <span className="font-semibold text-slate-600">
                      {item.checkInTime ? new Date(item.checkInTime).toLocaleString("en-IN", {
                        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                      }) : new Date().toLocaleString("en-IN", {
                        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-bold">
                  <span>Operator</span>
                  <span>{item.operator || "GATE_STAFF_NODE"}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}
