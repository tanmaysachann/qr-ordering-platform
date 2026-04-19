import Link from "next/link";
import { Coffee, QrCode, ShoppingBag, CreditCard, ArrowRight } from "lucide-react";

export default function HomePage() {
  const steps = [
    {
      num: "01",
      icon: <QrCode size={20} />,
      title: "Scan QR Code",
      desc: "Point your camera at the QR code on your table",
    },
    {
      num: "02",
      icon: <ShoppingBag size={20} />,
      title: "Browse & Order",
      desc: "Explore the menu and add your favourites to the cart",
    },
    {
      num: "03",
      icon: <CreditCard size={20} />,
      title: "Pay Securely",
      desc: "Complete payment instantly with PhonePe",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0c12] flex flex-col items-center justify-center px-6 relative overflow-hidden">

      {/* Background glow blobs */}
      <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#b45309]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-80px] right-[-60px] w-[300px] h-[300px] rounded-full bg-[#f43f5e]/6 blur-[100px] pointer-events-none" />

      {/* Subtle dot-grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 w-full max-w-sm stagger-children">

        {/* Logo mark */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-5 animate-float">
            <div className="absolute inset-0 rounded-2xl bg-[#b45309]/40 blur-xl scale-110" />
            <div className="relative w-16 h-16 bg-gradient-to-br from-[#f59e0b] to-[#b45309] rounded-2xl flex items-center justify-center shadow-lg">
              <Coffee size={30} className="text-white" />
            </div>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white mb-3">
            Cafe<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f59e0b] to-[#b45309]">Order</span>
          </h1>
          <p className="text-[#8892a4] text-sm text-center leading-relaxed max-w-[280px]">
            Skip the queue. Scan, order, and pay right from your table.
          </p>
        </div>

        {/* How it works */}
        <div className="mb-8">
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#b45309] mb-4 text-center">
            How it works
          </p>

          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-[22px] top-8 bottom-8 w-px bg-gradient-to-b from-[#b45309]/40 via-[#b45309]/20 to-transparent" />

            <div className="space-y-3">
              {steps.map((step) => (
                <div key={step.num} className="flex items-start gap-4 pl-1">
                  {/* Step icon bubble */}
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-[#1a1d27] border border-[#2a2f4a] flex items-center justify-center text-[#b45309]">
                      {step.icon}
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold text-[#b45309]/70 bg-[#0a0c12] px-0.5 leading-none">
                      {step.num}
                    </span>
                  </div>

                  {/* Text */}
                  <div className="pt-1.5">
                    <p className="text-sm font-semibold text-[#e8eaf0]">{step.title}</p>
                    <p className="text-xs text-[#8892a4] leading-relaxed mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Link
            href="/login"
            className="group relative flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#f59e0b] to-[#b45309] text-white rounded-xl py-3 text-sm font-semibold shadow-lg shadow-[#b45309]/25 hover:shadow-[#b45309]/40 hover:brightness-110 transition-all duration-200 overflow-hidden"
          >
            <span className="shine-overlay" />
            Staff Login
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>

          <p className="text-[11px] text-[#8892a4] text-center">
            Customers — scan the QR code at your table to start ordering
          </p>
        </div>

      </div>
    </div>
  );
}
