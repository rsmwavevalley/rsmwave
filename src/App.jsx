import { useState } from "react";
import { motion, useScroll } from "framer-motion";
import { FaWhatsapp, FaTimes } from "react-icons/fa";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";

// Admin Dashboard Components
import { AdminAuthProvider } from "./hooks/useAdminAuth";
import PinScreen from "./dashboards/admin/PinScreen";
import AdminLayout from "./dashboards/admin/AdminLayout";
import DashboardHome from "./dashboards/admin/DashboardHome";
import BookingsList from "./dashboards/admin/BookingsList";
import VerifyTicket from "./dashboards/admin/VerifyTicket";
import CheckinHistory from "./dashboards/admin/CheckinHistory";

// Decoupled Customer Presentation Wrapper Layout
function ClientLayout() {
  const { scrollYProgress } = useScroll();
  const [open, setOpen] = useState(false);

  const phoneNumber = "919335561261";
  const message = "Hi 👋 I am interested in your service!";
  const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <>
      {/* 🌊 SCROLL PROGRESS */}
      <motion.div
        style={{ scaleX: scrollYProgress }}
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-400 to-blue-500 origin-left z-[100]"
      />

      <Navbar />
      <Home />

      {/* CHAT BOX */}
      {open && (
        <div className="fixed bottom-24 right-5 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden z-[999]">
          <div className="bg-green-500 text-white p-4 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-sm">Chat with us</h3>
              <p className="text-xs opacity-80">We reply instantly ⚡</p>
            </div>
            <FaTimes className="cursor-pointer" onClick={() => setOpen(false)} />
          </div>

          <div className="p-4 text-sm text-gray-700">
            <p className="mb-3">
              Hi 👋 <br />
              Welcome to RSM Wave Valley!
            </p>

            <a
              href={whatsappURL}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center bg-green-500 text-white py-2 rounded-lg"
            >
              Start Chat
            </a>
          </div>
        </div>
      )}

      {/* FLOAT BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-[999] bg-green-500 text-white p-4 rounded-full shadow-lg"
      >
        <FaWhatsapp size={22} />
      </button>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer Portal */}
        <Route path="/" element={<ClientLayout />} />

        {/* Private Administration Portal Gates */}
        <Route path="/admin" element={<AdminAuthProvider />}>
          {/* PIN passcode input card gate */}
          <Route index element={<PinScreen />} />
          
          {/* Navigation layout nested viewport pages */}
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="bookings" element={<BookingsList />} />
            <Route path="verify-ticket" element={<VerifyTicket />} />
            <Route path="checkin-history" element={<CheckinHistory />} />
          </Route>
          
          {/* Catch-all admin resets */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        {/* Global Catch-all redirect to public landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;