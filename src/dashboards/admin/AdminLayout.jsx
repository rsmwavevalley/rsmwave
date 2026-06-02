import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../hooks/useAdminAuth";

export default function AdminLayout() {
  const { isAuthenticated, loading, logout } = useAdminAuth();
  const location = useLocation();

  // Authentication Boundary: Guard all subroutes
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  // Helper to highlight active navigation paths
  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      
      {/* 🏙️ TOP BRAND BANNER BAR */}
      <header className="bg-blue-900 text-white shadow-md z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black tracking-wider">RSM WAVE VALLEY</h1>
            <span className="bg-blue-700/80 text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-blue-600/40">ADMIN</span>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-blue-800 hover:bg-blue-700 text-xs font-bold rounded-lg border border-blue-700 transition min-h-[40px] flex items-center justify-center"
          >
            Logout 🚪
          </button>
        </div>
      </header>

      {/* 🧭 OPERATIONAL NAVIGATION BAR */}
      <nav className="bg-white border-b border-slate-200 z-20 shadow-sm overflow-x-auto">
        <div className="max-w-7xl mx-auto flex px-2 py-1 gap-1 md:gap-3 min-h-[56px] items-center">
          {[
            { name: "Dashboard", path: "/admin/dashboard", icon: "📊" },
            { name: "Bookings", path: "/admin/bookings", icon: "📋" },
            { name: "Verify Ticket", path: "/admin/verify-ticket", icon: "📷" },
            { name: "History", path: "/admin/checkin-history", icon: "⏳" },
          ].map((link, idx) => (
            <Link
              key={idx}
              to={link.path}
              className={`px-4 py-2.5 rounded-xl font-black text-xs md:text-sm tracking-wide transition flex items-center gap-1.5 whitespace-nowrap min-h-[48px]
                ${isActive(link.path)
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
            >
              <span>{link.icon}</span> {link.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* 🌍 MAIN VIEWPORT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 z-10">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        Gonda Water Park check-in framework. Version 1.0 (Production Setup)
      </footer>
    </div>
  );
}
