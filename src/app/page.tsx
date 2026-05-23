import Link from "next/link";
import {
  ArrowRight,
  QrCode,
  ListOrdered,
  CreditCard,
  ChefHat,
  LineChart,
  Bell,
  CheckCircle,
  Menu,
} from "lucide-react";
import { ThemeToggle } from "@/frontend/components/ui/theme-toggle";

function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M3.5 7V3.5H7"     stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16.5 7V3.5H13"   stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3.5 13V16.5H7"   stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16.5 13V16.5H13" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="10" cy="10" r="1.6" fill="white"/>
        </svg>
      </div>
      <span className="font-bold text-[15px] tracking-tight text-foreground">
        Scan<span className="text-primary">&amp;</span>Pay
      </span>
    </div>
  );
}

const STATS = [
  { value: "10k+",    label: "Active Customers" },
  { value: "20+",     label: "Partner Cafes" },
  { value: "< 2 min", label: "Avg Order Time" },
  { value: "99.9%",   label: "Uptime SLA" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased overflow-x-hidden">

      {/* Noise overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.025]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* ── Nav ── */}
      <header className="fixed top-0 w-full z-50 bg-background/85 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/"><Wordmark /></Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#how-it-works" className="text-muted hover:text-foreground transition-colors text-sm font-medium">
              How it works
            </Link>
            <Link href="#for-cafes" className="text-muted hover:text-foreground transition-colors text-sm font-medium">
              For cafes
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Mobile hamburger */}
            <details className="md:hidden group relative">
              <summary className="list-none cursor-pointer p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors">
                <Menu size={18} />
              </summary>
              <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-xl shadow-lg overflow-hidden">
                <Link href="#how-it-works" className="block px-4 py-3 text-sm text-muted hover:text-foreground hover:bg-surface-hover transition-colors">
                  How it works
                </Link>
                <Link href="#for-cafes" className="block px-4 py-3 text-sm text-muted hover:text-foreground hover:bg-surface-hover transition-colors border-t border-border">
                  For cafes
                </Link>
                <div className="border-t border-border p-3">
                  <Link
                    href="/login"
                    className="w-full bg-primary text-white hover:bg-primary-dark transition-all duration-150 px-4 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-1.5"
                  >
                    Get Started <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </details>

            {/* Desktop CTA */}
            <Link
              href="/login"
              className="hidden md:flex bg-primary text-white hover:bg-primary-dark active:scale-[0.98] transition-all duration-150 px-5 py-2 rounded-full text-sm font-semibold items-center gap-1.5"
            >
              Get Started
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{
            position: "absolute", width: 700, height: 700,
            top: "5%", left: "50%", transform: "translateX(-50%)",
            background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)",
            borderRadius: "50%",
          }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 md:pt-36 pb-16 sm:pb-20 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-0 rounded-full border border-border bg-surface/80 backdrop-blur-sm mb-8 sm:mb-10 overflow-hidden animate-fade-in-up">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/15 border-r border-border text-primary text-[11px] font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Live
            </span>
            <span className="px-3 py-1.5 text-[11px] font-medium text-muted tracking-wide">
              20+ cafes &nbsp;·&nbsp; 🇮🇳 India
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-[clamp(2.6rem,8vw,6rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-foreground max-w-4xl mb-5 sm:mb-7 animate-fade-in-up"
            style={{ animationDelay: "60ms" }}
          >
            Order straight
            <br />
            <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              from the table.
            </span>
          </h1>

          {/* Sub */}
          <p
            className="text-base sm:text-lg lg:text-xl text-muted max-w-xl sm:max-w-2xl leading-relaxed mb-10 sm:mb-12 animate-fade-in-up px-2 sm:px-0"
            style={{ animationDelay: "120ms" }}
          >
            Customers scan a QR code, browse your menu, and pay / no app, no queue,
            no waiter needed. Orders hit the kitchen the moment payment clears.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-16 sm:mb-24 w-full sm:w-auto animate-fade-in-up px-4 sm:px-0"
            style={{ animationDelay: "180ms" }}
          >
            <Link
              href="/login"
              className="w-full sm:w-auto bg-primary text-white px-8 sm:px-9 py-3.5 sm:py-4 rounded-full text-sm font-bold uppercase tracking-wide hover:bg-primary-dark hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 group shadow-lg shadow-primary/20"
            >
              Open Dashboard
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="#how-it-works"
              className="w-full sm:w-auto border border-border text-foreground px-8 sm:px-9 py-3.5 sm:py-4 rounded-full text-sm font-semibold uppercase tracking-wide hover:bg-surface-hover transition-all duration-200 flex items-center justify-center"
            >
              How it works
            </Link>
          </div>

          {/* Stats bar */}
          <div
            className="w-full max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden border border-border animate-fade-in-up"
            style={{ animationDelay: "240ms" }}
          >
            {STATS.map((s) => (
              <div key={s.label} className="bg-surface flex flex-col items-center justify-center py-5 sm:py-7 px-3 sm:px-4 text-center">
                <span className="text-[clamp(1.4rem,4vw,2.2rem)] font-extrabold tracking-tight text-foreground leading-none mb-1">{s.value}</span>
                <span className="text-[10px] sm:text-[11px] text-muted uppercase tracking-wider font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="border-t border-border bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-36">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <p className="text-xs uppercase tracking-[0.16em] text-primary font-bold mb-4">
              For customers
            </p>
            <h2 className="text-[clamp(1.8rem,5vw,3.2rem)] font-extrabold tracking-tight text-foreground mb-4 sm:mb-5">
              Seat to served in 3 steps.
            </h2>
            <p className="text-muted max-w-lg mx-auto text-base sm:text-lg leading-relaxed px-2 sm:px-0">
              No downloads, no sign-ups. Just point your camera and your order is on its way.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 items-stretch">
            <LandingStep num={1} icon={<QrCode size={22} />} title="Scan the QR"
              desc="Point your camera at the code on your table. The menu opens instantly in your browser. No app needed." />
            <LandingStep num={2} icon={<ListOrdered size={22} />} title="Build your order"
              desc="Browse the full menu, add items to your cart, and review your selection before confirming." />
            <LandingStep num={3} icon={<CreditCard size={22} />} title="Pay with PhonePe"
              desc="Tap to pay securely. Your order is sent to the kitchen the instant payment goes through." />
          </div>
        </div>
      </section>

      {/* ── For cafes ── */}
      <section id="for-cafes" className="border-t border-border bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-36">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <p className="text-xs uppercase tracking-[0.16em] text-primary font-bold mb-4">
              For cafes
            </p>
            <h2 className="text-[clamp(1.8rem,5vw,3.2rem)] font-extrabold tracking-tight text-foreground mb-4 sm:mb-5">
              Everything you need.
              <br />
              Nothing you don&apos;t.
            </h2>
            <p className="text-muted max-w-lg mx-auto text-base sm:text-lg leading-relaxed px-2 sm:px-0">
              A complete back office / menus, live orders, and deep analytics, all in one dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 items-stretch">
            <LandingFeature
              icon={<ChefHat size={20} />}
              title="Menu management"
              desc="Add, edit, or disable items and categories. Changes go live on every table QR instantly."
              bullets={[
                "Image uploads with Cloudinary",
                "Category and availability toggles",
                "Real-time updates across all tables",
              ]}
            />
            <LandingFeature
              icon={<Bell size={20} />}
              title="Live order stream"
              desc="New orders appear on your screen the moment they're placed. Move them through prep to ready with a tap."
              bullets={[
                "Real-time push via Server-Sent Events",
                "One-tap status updates",
                "Full order history and receipts",
              ]}
              highlight
            />
            <LandingFeature
              icon={<LineChart size={20} />}
              title="Deep insights"
              desc="Peak hours, top sellers, repeat customer rate / the metrics that shape real business decisions."
              bullets={[
                "Hourly and daily footfall charts",
                "Revenue breakdown per item",
                "Repeat customer tracking",
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-border bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-36 text-center">
          <h2 className="text-[clamp(2rem,5vw,3.8rem)] font-extrabold tracking-tight text-foreground mb-5 sm:mb-6">
            Ready for your first
            <br />
            <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              QR order?
            </span>
          </h2>
          <p className="text-muted text-base sm:text-lg max-w-md mx-auto mb-10 sm:mb-12 leading-relaxed px-4 sm:px-0">
            Sign in to your dashboard and we&apos;ll get your cafe onboarded in minutes.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-primary text-white px-8 sm:px-9 py-3.5 sm:py-4 rounded-full text-sm font-bold uppercase tracking-wide hover:bg-primary-dark hover:scale-[1.02] transition-all duration-200 shadow-lg shadow-primary/20"
          >
            Open Dashboard
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 text-center md:text-left">
          <Wordmark />
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} Scan&amp;Pay. Empowering modern dining.
          </p>
          <div className="flex gap-6 text-xs text-muted">
            <span className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LandingStep({
  num, icon, title, desc,
}: {
  num: number; icon: React.ReactNode; title: string; desc: string;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-background p-6 sm:p-8 lg:p-10 relative overflow-hidden group hover:border-primary/30 hover:bg-surface transition-colors duration-300 h-full">
      <div className="flex items-start justify-between mb-6 sm:mb-8">
        <span className="text-4xl sm:text-5xl font-extrabold text-border leading-none select-none">
          0{num}
        </span>
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
      </div>
      <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{desc}</p>
    </div>
  );
}

function LandingFeature({
  icon, title, desc, bullets, highlight,
}: {
  icon: React.ReactNode; title: string; desc: string; bullets: string[]; highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded-2xl p-6 sm:p-8 lg:p-10 relative overflow-hidden h-full transition-colors duration-300 ${
        highlight
          ? "bg-primary/[0.06] border border-primary/25 hover:border-primary/40"
          : "border border-border bg-surface hover:border-primary/20"
      }`}
    >
      <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-5 sm:mb-6 flex-shrink-0 ${
        highlight ? "bg-primary text-white" : "bg-primary/10 text-primary"
      }`}>
        {icon}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3">{title}</h3>
      <p className="text-sm text-muted leading-relaxed mb-6 sm:mb-8">{desc}</p>
      <ul className="mt-auto space-y-2.5 sm:space-y-3">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2.5 text-sm text-muted">
            <CheckCircle size={15} className={`mt-0.5 flex-shrink-0 ${highlight ? "text-primary" : "text-primary/50"}`} />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}
