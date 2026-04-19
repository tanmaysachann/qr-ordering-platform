import Link from "next/link";
import { Coffee, QrCode, ShoppingBag, CreditCard, ArrowRight, Zap } from "lucide-react";

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
        {/* Top-center amber bloom */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-[#b45309]/6 blur-[160px]" />
        {/* Bottom-right accent */}
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full bg-[#f43f5e]/3 blur-[140px]" />
        {/* Bottom-left cool blue */}
        <div className="absolute bottom-20 -left-20 w-[300px] h-[300px] rounded-full bg-[#3b82f6]/3 blur-[120px]" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Radial vignette so dots fade at edges */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, #07080f 100%)" }} />
      </div>

      {/* ── Nav bar ── */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-[#f59e0b] to-[#b45309] rounded-lg flex items-center justify-center">
            <Coffee size={16} className="text-white" />
          </div>
          <span className="font-bold text-base tracking-tight">
            Cafe<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f59e0b] to-[#b45309]">Order</span>
          </span>
        </div>
        <Link
          href="/login"
          className="text-xs font-semibold text-[#8892a4] hover:text-white transition-colors border border-[#2a2f4a] hover:border-[#b45309]/50 px-4 py-2 rounded-lg"
        >
          Staff Login
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
          <div className="relative w-24 h-24 bg-gradient-to-br from-[#d97706] via-[#c2610c] to-[#92400e] rounded-3xl flex items-center justify-center shadow-xl shadow-[#b45309]/15">
            <Coffee size={44} className="text-white" />
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

        {/* Steps — horizontal cards */}
        <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
          {steps.map((step, i) => (
            <div
              key={step.num}
              className="relative group text-left p-5 rounded-2xl border border-[#1e2235] bg-[#0d0f1a]/80 backdrop-blur-sm overflow-hidden"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[#b45309]/4 to-transparent pointer-events-none" />

              {/* Step number — large watermark */}
              <span className="absolute top-3 right-4 text-5xl font-black text-white/[0.04] select-none leading-none">
                {step.num}
              </span>

              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-[#b45309]/8 border border-[#b45309]/12 flex items-center justify-center text-[#c2610c] mb-4">
                {step.icon}
              </div>

              <p className="text-sm font-semibold text-white mb-1">{step.title}</p>
              <p className="text-xs text-[#8892a4] leading-relaxed">{step.desc}</p>

              {/* Connector arrow (not last) */}
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
          Staff Login
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
