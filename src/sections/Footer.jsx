import { motion } from "framer-motion";

const footerLinks = {
  "Quick Links": ["Home", "Rides", "Resort", "Gallery", "Location"],
};

const socialLinks = [
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Twitter",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
      </svg>
    ),
  },
];

const contactInfo = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 mt-0.5 shrink-0">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    text: "RSM Wave Valley Water Park and Resort, Malari, Gonda, Uttar Pradesh",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 shrink-0">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.29 6.29l1.09-1.09a2 2 0 0 1 2.11-.45c.91.32 1.85.55 2.81.68A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    text: "+91 93355 61261",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 shrink-0">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    text: "rsmwavevelly@gmail.com",
  },
];

export default function Footer() {
  return (
    <footer className="relative bg-[#061a2e] text-gray-400 overflow-hidden">

      {/* Top wave transition */}
      <div className="w-full overflow-hidden leading-none -mt-1">
        <svg viewBox="0 0 1440 80" className="w-full h-16 md:h-20" preserveAspectRatio="none">
          <path fill="#0a2540" d="M0,40 C360,80 1080,0 1440,40 L1440,0 L0,0 Z" />
        </svg>
      </div>

      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-4 pb-12">

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            {/* Logo + name */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-lg" />
                <img
                  src="/rsm-wave-valley-logo.png"
                  alt="RSM Wave Valley"
                  className="relative w-14 h-14 object-contain drop-shadow-lg"
                />
              </div>
              <div className="leading-tight">
                <p
                  className="text-2xl font-black tracking-tight"
                  style={{
                    background: "linear-gradient(135deg, #38bdf8, #e0f2fe, #38bdf8)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  RSM
                </p>
                <p className="text-sm font-bold text-cyan-300 tracking-wide -mt-1">Wave Valley</p>
              </div>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              The ultimate destination for water fun and summer adventures. Making unforgettable memories since day one.
            </p>

            {/* Social icons */}
            <div className="flex gap-3">
              {socialLinks.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  whileHover={{ scale: 1.15, backgroundColor: "rgba(34,211,238,0.2)" }}
                  whileTap={{ scale: 0.92 }}
                  className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-gray-400 hover:text-cyan-400 transition-colors duration-200"
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links Section */}
          {Object.entries(footerLinks).map(([heading, links], colIdx) => (
            <motion.div
              key={heading}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * (colIdx + 1) }}
            >
              <h4 className="text-white font-bold text-base mb-5 tracking-wide">{heading}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <motion.a
                      href={`#${link.toLowerCase()}`}
                      className="text-sm text-gray-400 hover:text-cyan-400 transition-colors duration-200 flex items-center gap-2 group"
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <span className="w-1 h-1 rounded-full bg-cyan-500/50 group-hover:bg-cyan-400 transition-colors" />
                      {link}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <h4 className="text-white font-bold text-base mb-5 tracking-wide">Contact Us</h4>
            <ul className="space-y-4">
              {contactInfo.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                  <span className="text-cyan-400">{item.icon}</span>
                  <span className="leading-relaxed">{item.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Divider & Credits */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs md:text-sm">
          <p className="text-gray-500 order-2 sm:order-1">
            © 2026 RSM Wave Valley Water Park & Resort. All rights reserved.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-gray-500 order-1 sm:order-2">
            <div className="flex items-center gap-1.5">
              <span className="opacity-60">⚡ Developed by</span>
              <div className="text-xs text-white/40 flex items-center gap-1">
  

  <motion.a
    href="https://www.linkedin.com/in/himanshu-kushwaha-734728333/"
    target="_blank"
    rel="noopener noreferrer"
    className="hover:text-white/70 transition-colors"
    whileHover={{ scale: 1.03 }}
  >
    Himanshu
  </motion.a>

  <span>&</span>

  <motion.a
    href="https://www.linkedin.com/in/himani-tripathi-750761357?utm_source=share_via&utm_content=profile&utm_medium=member_android"
    target="_blank"
    rel="noopener noreferrer"
    className="hover:text-white/70 transition-colors"
    whileHover={{ scale: 1.03 }}
  >
    Himani
  </motion.a>
  <span>&</span>
  <motion.a
    href="https://www.linkedin.com/in/ashutosh-dubey-2bb3b8330"
    target="_blank"
    rel="noopener noreferrer"
    className="hover:text-white/70 transition-colors"
    whileHover={{ scale: 1.03 }}
  >
    Ashutosh
  </motion.a>
</div>
            </div>
            
            <div className="w-px h-3 bg-white/10 hidden sm:block" />
            
            <div className="flex items-center gap-1.5">
              <span className="opacity-60">Powered by</span>
               <motion.a
    href="https://www.instagram.com/varyonics?igsh=MW0xZjFpNGR6eTFvMA=="
    target="_blank"
    rel="noopener noreferrer"
    className="hover:text-white/70 transition-colors"
    whileHover={{ scale: 1.03 }}
  >
   Varyonics
  </motion.a>
              
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
