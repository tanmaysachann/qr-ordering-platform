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
} from "lucide-react";
import { LandingThemeToggle } from "@/frontend/components/landing-theme-toggle";

function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      {/* Scan-frame mark */}
      <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M3.5 7V3.5H7"     stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16.5 7V3.5H13"   stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3.5 13V16.5H7"   stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16.5 13V16.5H13" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="10" cy="10" r="1.6" fill="white"/>
        </svg>
      </div>
      <span className="font-semibold text-[15px] tracking-tight text-foreground">
        Scan<span className="text-primary">&amp;</span>Pay
      </span>
    </div>
  );
}

const STATS = [
  { value: "10,000+", label: "Orders processed" },
  { value: "20+", label: "Partner cafes" },
  { value: "< 2 min", label: "Avg order time" },
  { value: "99.9%", label: "Payment success" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">

      {/* ── Nav ── */}
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Wordmark />
          <nav className="flex items-center gap-1">
            <Link
              href="#how-it-works"
              className="hidden sm:inline-flex text-sm text-muted hover:text-foreground px-3 py-1.5 rounded-md hover:bg-surface-hover transition-colors"
            >
              How it works
            </Link>
            <Link
              href="#for-cafes"
              className="hidden sm:inline-flex text-sm text-muted hover:text-foreground px-3 py-1.5 rounded-md hover:bg-surface-hover transition-colors"
            >
              For cafes
            </Link>
            <div className="hidden sm:block w-px h-4 bg-border mx-1" />
            <LandingThemeToggle />
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold bg-primary text-white hover:bg-primary-dark px-4 py-1.5 rounded-md transition-colors ml-1"
            >
              Sign in
              <ArrowRight size={13} />
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary/[0.06] rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 pt-24 sm:pt-32 pb-16 sm:pb-20 text-center">

          <div className="inline-flex items-center gap-2 text-xs text-muted border border-border bg-surface px-3 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            Now live at 20+ cafes across India
          </div>

          <h1 className="text-5xl sm:text-[68px] font-bold tracking-[-0.04em] leading-[1.0] text-foreground mb-6">
            Order straight
            <br />
            <span className="text-primary">from the table.</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted leading-relaxed max-w-xl mx-auto mb-10">
            Customers scan a QR code, browse your menu, and pay. No app,
            no queue, no waiter needed. Orders reach the kitchen the moment
            payment clears.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Open dashboard
              <ArrowRight size={15} />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted border border-border px-6 py-2.5 rounded-lg hover:bg-surface-hover hover:text-foreground transition-colors"
            >
              How it works
            </Link>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border border border-border rounded-2xl overflow-hidden max-w-3xl mx-auto">
            {STATS.map((s) => (
              <div key={s.label} className="bg-surface px-6 py-5 text-left sm:text-center">
                <div className="text-2xl font-bold text-foreground mb-0.5">{s.value}</div>
                <div className="text-xs text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="border-t border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-20 sm:py-28">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.14em] text-primary font-semibold mb-3">
              For customers
            </p>
            <h2 className="text-3xl sm:text-[44px] font-bold tracking-tight text-foreground mb-4">
              Seat to served in 3 steps.
            </h2>
            <p className="text-muted max-w-md mx-auto leading-relaxed">
              No downloads, no sign-ups. Just point your camera and your order
              is on its way.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Step
              num={1}
              icon={<QrCode size={22} />}
              title="Scan the QR"
              desc="Point your camera at the code on your table. The menu opens instantly in your browser. No app needed."
            />
            <Step
              num={2}
              icon={<ListOrdered size={22} />}
              title="Build your order"
              desc="Browse the full menu, add items to your cart, and review before confirming."
            />
            <Step
              num={3}
              icon={<CreditCard size={22} />}
              title="Pay with PhonePe"
              desc="Tap to pay securely. Your order is sent to the kitchen the instant payment goes through."
            />
          </div>
        </div>
      </section>

      {/* ── For cafes ── */}
      <section id="for-cafes" className="border-t border-border bg-background">
        <div className="max-w-6xl mx-auto px-6 py-20 sm:py-28">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.14em] text-primary font-semibold mb-3">
              For cafes
            </p>
            <h2 className="text-3xl sm:text-[44px] font-bold tracking-tight text-foreground mb-4">
              Everything you need.
              <br />
              Nothing you don't.
            </h2>
            <p className="text-muted max-w-md mx-auto leading-relaxed">
              A complete back office: menus, live orders, and deep analytics,
              all in one dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Feature
              icon={<ChefHat size={20} />}
              title="Menu management"
              desc="Add, edit, or disable items and categories. Changes go live on every table QR instantly."
              bullets={[
                "Image uploads with Cloudinary",
                "Category and availability toggles",
                "Updates across all tables in real time",
              ]}
            />
            <Feature
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
            <Feature
              icon={<LineChart size={20} />}
              title="Deep insights"
              desc="Peak hours, top sellers, repeat customer rate: the metrics that actually shape business decisions."
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
        <div className="max-w-6xl mx-auto px-6 py-20 sm:py-28 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground mb-5">
            Ready for your first
            <br />
            <span className="text-primary">QR order?</span>
          </h2>
          <p className="text-muted max-w-sm mx-auto mb-10 leading-relaxed">
            Sign in to your dashboard, or reach out and we'll get your cafe
            onboarded in one short call.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Sign in to dashboard
              <ArrowRight size={15} />
            </Link>
            <a
              href="mailto:hello@scanandpay.in"
              className="inline-flex items-center gap-2 border border-border text-foreground text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-surface-hover transition-colors"
            >
              Contact us
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Wordmark />
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} Scan&amp;Pay. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Step({
  num,
  icon,
  title,
  desc,
}: {
  num: number;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-background border border-border rounded-2xl p-8">
      <div className="flex items-start justify-between mb-6">
        <span className="text-4xl font-bold text-border leading-none select-none">
          0{num}
        </span>
        <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{desc}</p>
    </div>
  );
}

function Feature({
  icon,
  title,
  desc,
  bullets,
  highlight,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  bullets: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-7 border flex flex-col ${
        highlight
          ? "border-primary/30 bg-primary/[0.04]"
          : "border-border bg-surface"
      }`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 flex-shrink-0 ${
          highlight ? "bg-primary text-white" : "bg-primary/10 text-primary"
        }`}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted leading-relaxed mb-6">{desc}</p>
      <ul className="mt-auto space-y-2.5">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-xs text-muted">
            <CheckCircle
              size={13}
              className={`mt-0.5 flex-shrink-0 ${
                highlight ? "text-primary" : "text-success"
              }`}
            />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}
