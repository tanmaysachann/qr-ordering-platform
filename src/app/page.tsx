import Link from "next/link";
import { QrCode, ShoppingBag, CreditCard, ArrowRight, Zap } from "lucide-react";

function ScanPayLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Top-left QR finder */}
      <rect x="2" y="2" width="13" height="13" rx="3" fill="url(#g1)" />
      <rect x="5" y="5" width="7" height="7" rx="1.5" fill="#07080f" />
      {/* Top-right QR finder */}
      <rect x="25" y="2" width="13" height="13" rx="3" fill="url(#g1)" />
      <rect x="28" y="5" width="7" height="7" rx="1.5" fill="#07080f" />
      {/* Bottom-left QR finder */}
      <rect x="2" y="25" width="13" height="13" rx="3" fill="url(#g1)" />
      <rect x="5" y="28" width="7" height="7" rx="1.5" fill="#07080f" />
      {/* Data dots */}
      <rect x="25" y="25" width="4" height="4" rx="1" fill="#f59e0b" opacity="0.7" />
      <rect x="31" y="25" width="4" height="4" rx="1" fill="#f59e0b" opacity="0.5" />
      <rect x="25" y="31" width="4" height="4" rx="1" fill="#f59e0b" opacity="0.5" />
      <rect x="31" y="31" width="4" height="4" rx="1" fill="#f59e0b" opacity="0.3" />
      {/* Lightning bolt overlay — center */}
      <path
        d="M22 15 L17 22 H20.5 L18 28 L24 20 H20.5 Z"
        fill="url(#g2)"
        opacity="0.95"
      />
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function ScanPayLogoLarge() {
  return (
    <svg width="96" height="96" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="13" height="13" rx="3" fill="url(#lg1)" />
      <rect x="5" y="5" width="7" height="7" rx="1.5" fill="#07080f" />
      <rect x="25" y="2" width="13" height="13" rx="3" fill="url(#lg1)" />
      <rect x="28" y="5" width="7" height="7" rx="1.5" fill="#07080f" />
      <rect x="2" y="25" width="13" height="13" rx="3" fill="url(#lg1)" />
      <rect x="5" y="28" width="7" height="7" rx="1.5" fill="#07080f" />
      <rect x="25" y="25" width="4" height="4" rx="1" fill="#f59e0b" opacity="0.8" />
      <rect x="31" y="25" width="4" height="4" rx="1" fill="#f59e0b" opacity="0.55" />
      <rect x="25" y="31" width="4" height="4" rx="1" fill="#f59e0b" opacity="0.55" />
      <rect x="31" y="31" width="4" height="4" rx="1" fill="#f59e0b" opacity="0.35" />
      <path
        d="M22 15 L17 22 H20.5 L18 28 L24 20 H20.5 Z"
        fill="url(#lg2)"
      />
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="lg2" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function HomePage() {
  const steps = [
    {
      num: "01",
      icon: <QrCode size={22} />,
      title: "Scan QR Code",
      desc: "Point your camera at the QR code on your table. No app needed.",
    },
    {
      num: "02",
      icon: <ShoppingBag size={22} />,
      title: "Browse & Order",
      desc: "Explore the full menu and add your favourites to the cart.",
    },
    {
      num: "03",
      icon: <CreditCard size={22} />,
      title: "Pay Securely",
      desc: "Complete payment instantly with PhonePe.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#07080f] text-white flex flex-col relative overflow-hidden">

      {/* ── Background atmosphere ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-[#b45309]/6 blur-[160px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full bg-[#f43f5e]/3 blur-[140px]" />
        <div className="absolute bottom-20 -left-20 w-[300px] h-[300px] rounded-full bg-[#3b82f6]/3 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, #07080f 100%)" }} />
      </div>

      {/* ── Nav bar ── */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2.5">
          <ScanPayLogo size={32} />
          <span className="font-bold text-base tracking-tight">
            Scan<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f59e0b] to-[#b45309]">&amp;Pay</span>
          </span>
        </div>
        <Link
          href="/login"
          className="text-xs font-semibold text-[#8892a4] hover:text-white transition-colors border border-[#2a2f4a] hover:border-[#b45309]/50 px-4 py-2 rounded-lg"
        >
          Login
        </Link>
      </header>

      {/* ── Hero ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 border border-[#b45309]/20 bg-[#b45309]/5 px-3 py-1 rounded-full mb-8">
          <Zap size={11} className="text-[#d97706]" />
          <span className="text-[11px] font-medium text-[#d97706]/80 tracking-wide">Zero wait. Zero hassle.</span>
        </div>

        {/* Logo icon — floating */}
        <div className="relative mb-8 animate-float">
          <div className="absolute inset-0 rounded-3xl bg-[#b45309]/20 blur-2xl scale-125" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-[#1a1408] via-[#0d0f1a] to-[#07080f] rounded-3xl flex items-center justify-center shadow-xl shadow-[#b45309]/15 border border-[#f59e0b]/10">
            <ScanPayLogoLarge />
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tighter leading-[1.05] mb-5">
          Order from your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d97706] to-[#92400e]">
            table.
          </span>
        </h1>
        <p className="text-[#8892a4] text-base sm:text-lg leading-relaxed max-w-md mb-14">
          Scan the QR code, browse the menu, and pay. All without leaving your seat.
        </p>

        {/* Steps */}
        <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
          {steps.map((step, i) => (
            <div
              key={step.num}
              className="relative group text-left p-5 rounded-2xl border border-[#1e2235] bg-[#0d0f1a]/80 backdrop-blur-sm overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[#b45309]/4 to-transparent pointer-events-none" />
              <span className="absolute top-3 right-4 text-5xl font-black text-white/[0.04] select-none leading-none">
                {step.num}
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#b45309]/8 border border-[#b45309]/12 flex items-center justify-center text-[#c2610c] mb-4">
                {step.icon}
              </div>
              <p className="text-sm font-semibold text-white mb-1">{step.title}</p>
              <p className="text-xs text-[#8892a4] leading-relaxed">{step.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-[#2a2f4a]">
                  <ArrowRight size={16} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/login"
          className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-[#d97706] to-[#92400e] text-white px-8 py-3.5 rounded-xl font-semibold text-sm shadow-lg shadow-[#b45309]/15 hover:shadow-[#b45309]/25 hover:brightness-105 transition-all duration-200 overflow-hidden"
        >
          <span className="shine-overlay" />
          Login
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 text-center py-6">
        <p className="text-[11px] text-[#4a5268]">
          Customers: scan the QR code at your table to start ordering
        </p>
      </footer>
    </div>
  );
}
