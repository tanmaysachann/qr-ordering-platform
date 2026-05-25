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
  TrendingUp,
} from "lucide-react";
import { ThemeToggle } from "@/frontend/components/ui/theme-toggle";
import { FadeIn } from "@/frontend/components/ui/fade-in";

/* ── Wordmark ─────────────────────────────────────────────── */
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

/* ── Browser-frame dashboard mockup ──────────────────────── */
const MOCK_ORDERS = [
  { id: "#1041", customer: "Rohit M.",  items: "Cappuccino × 2, Croissant",   amt: "₹460", time: "8m ago",   status: "Preparing", sBg: "rgba(251,191,36,0.14)", sText: "#f59e0b", isNew: false },
  { id: "#1042", customer: "Priya S.", items: "Club Sandwich, Iced Tea",      amt: "₹380", time: "just now", status: "New",        sBg: "rgba(99,102,241,0.14)", sText: "#818cf8", isNew: true  },
  { id: "#1043", customer: "Aditya K.", items: "Masala Chai × 3",             amt: "₹270", time: "14m ago",  status: "Ready",      sBg: "rgba(34,197,94,0.14)",  sText: "#22c55e", isNew: false },
  { id: "#1044", customer: "Sara T.",  items: "Cold Brew, Muffin × 2",       amt: "₹390", time: "19m ago",  status: "Preparing", sBg: "rgba(251,191,36,0.14)", sText: "#f59e0b", isNew: false },
];

function DashboardMockup() {
  const S = {
    wrap:        { border: "1px solid #1c1c24", borderRadius: "16px", overflow: "hidden", boxShadow: "0 48px 120px rgba(0,0,0,0.55), 0 12px 32px rgba(0,0,0,0.35)" } as React.CSSProperties,
    chrome:      { display: "flex", alignItems: "center", padding: "9px 14px", gap: "10px", background: "#111118", borderBottom: "1px solid #1c1c24" } as React.CSSProperties,
    urlPill:     { display: "flex", alignItems: "center", gap: "5px", background: "#0d0d12", borderRadius: "6px", padding: "3px 10px", fontSize: "10px", fontFamily: "monospace", color: "#46465a" } as React.CSSProperties,
    shell:       { display: "flex", height: "388px", background: "#0d0d12" } as React.CSSProperties,
    sidebar:     { width: "148px", flexShrink: 0, display: "flex", flexDirection: "column" as const, background: "#111118", borderRight: "1px solid #1c1c24", padding: "16px 10px" },
    navItem:     (a: boolean) => ({ display: "flex", alignItems: "center", gap: "7px", padding: "6px 9px", borderRadius: "7px", fontSize: "11px", fontWeight: a ? 600 : 400, cursor: "default", ...(a ? { background: "#1e1e2e", color: "#a5b4fc" } : { color: "#3d3d52" }) }) as React.CSSProperties,
    main:        { flex: 1, display: "flex", flexDirection: "column" as const, overflow: "hidden" },
    statsBar:    { display: "flex", gap: "6px", padding: "12px 16px", borderBottom: "1px solid #1c1c24", flexShrink: 0 } as React.CSSProperties,
    statChip:    (c: string) => ({ flex: 1, background: "#111118", border: "1px solid #1c1c24", borderRadius: "8px", padding: "8px 10px", display: "flex", flexDirection: "column" as const, gap: "2px", borderTop: `2px solid ${c}` }),
    orderList:   { flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" as const, gap: "4px", padding: "10px 12px" },
    orderRow:    (isNew: boolean) => ({ display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "8px", background: isNew ? "rgba(99,102,241,0.07)" : "#111118", border: isNew ? "1px solid rgba(99,102,241,0.22)" : "1px solid #1c1c24", position: "relative" as const, overflow: "hidden" }),
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: "300ms" }}>

      <div style={S.wrap}>

        {/* Browser chrome */}
        <div style={S.chrome}>
          <div style={{ display: "flex", gap: "5px", flexShrink: 0 }}>
            {["#ff5f57","#febc2e","#28c840"].map(c => <span key={c} style={{ width: "9px", height: "9px", borderRadius: "50%", background: c, display: "block" }} />)}
          </div>
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <div style={S.urlPill}>
              <span style={{ color: "#22c55e", fontSize: "7px", lineHeight: 1 }}>●</span>
              dashboard.scanandpay.app/orders
            </div>
          </div>
          <div style={{ width: "44px" }} />
        </div>

        {/* App shell */}
        <div style={S.shell}>

          {/* Sidebar */}
          <div style={S.sidebar}>

            {/* Brand */}
            <div style={{ padding: "2px 4px", marginBottom: "18px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#d0d0e0", letterSpacing: "-0.02em" }}>Blue Tokai</div>
              <div style={{ fontSize: "9px", color: "#3d3d52", marginTop: "1px" }}>Koramangala</div>
            </div>

            {/* Nav items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
              {[
                { label: "Orders",    Icon: Bell,      active: true,  badge: 4 as number | undefined },
                { label: "Menu",      Icon: ChefHat,   active: false, badge: undefined },
                { label: "Analytics", Icon: LineChart,  active: false, badge: undefined },
                { label: "QR Code",   Icon: QrCode,    active: false, badge: undefined },
              ].map(({ label, Icon, active, badge }) => (
                <div key={label} style={S.navItem(active)}>
                  <Icon size={11} />
                  {label}
                  {badge && (
                    <span style={{ marginLeft: "auto", background: "#6366f1", color: "#fff", fontSize: "8px", fontWeight: 700, padding: "1px 5px", borderRadius: "99px", lineHeight: "14px" }}>
                      {badge}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Revenue block */}
            <div style={{ marginTop: "auto", borderTop: "1px solid #1c1c24", paddingTop: "14px" }}>
              <div style={{ fontSize: "8px", textTransform: "uppercase", letterSpacing: "0.10em", color: "#3d3d52", marginBottom: "7px" }}>Today&apos;s revenue</div>
              <div className="[font-family:var(--font-jb-mono)]" style={{ fontSize: "20px", fontWeight: 700, color: "#f0f0f8", letterSpacing: "-0.04em", lineHeight: 1 }}>
                ₹12,840
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "9px", color: "#22c55e", fontWeight: 600, marginTop: "6px" }}>
                <TrendingUp size={9} />
                +18% vs yesterday
              </div>
            </div>
          </div>

          {/* Main panel */}
          <div style={S.main}>

            {/* Top stats bar */}
            <div style={S.statsBar}>
              {[
                { label: "Revenue", value: "₹4,240", accent: "#6366f1" },
                { label: "Orders",  value: "18",      accent: "#22c55e" },
                { label: "Pending", value: "4",        accent: "#f59e0b" },
                { label: "Done",    value: "14",       accent: "#3d3d52" },
              ].map(c => (
                <div key={c.label} style={S.statChip(c.accent)}>
                  <div style={{ fontSize: "8px", color: "#3d3d52", textTransform: "uppercase", letterSpacing: "0.08em" }}>{c.label}</div>
                  <div className="[font-family:var(--font-jb-mono)]" style={{ fontSize: "14px", fontWeight: 700, color: "#d0d0e0", letterSpacing: "-0.02em" }}>{c.value}</div>
                </div>
              ))}
              {/* Live dot */}
              <div style={{ display: "flex", alignItems: "center", gap: "5px", marginLeft: "auto", flexShrink: 0 }}>
                <span className="animate-pulse" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", display: "block" }} />
                <span style={{ fontSize: "9px", fontWeight: 600, color: "#22c55e" }}>LIVE</span>
              </div>
            </div>

            {/* Column headers */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 24px 4px", flexShrink: 0 }}>
              {[["Order", "60px"], ["Items", "1"], ["Time", "52px"], ["Amount", "44px"], ["Status", "64px"]].map(([h, w]) => (
                <div key={h} style={{ fontSize: "8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "#2d2d40", ...(w === "1" ? { flex: 1 } : { width: w, flexShrink: 0, textAlign: h === "Amount" || h === "Status" ? "center" : "left" as "left" | "center" }) }}>
                  {h}
                </div>
              ))}
            </div>

            {/* Orders */}
            <div style={S.orderList}>
              {MOCK_ORDERS.map((row, i) => (
                <div key={i} style={S.orderRow(row.isNew)}>
                  {/* Status strip */}
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "3px", background: row.sText }} />

                  {/* Order ID */}
                  <div className="[font-family:var(--font-jb-mono)]" style={{ width: "60px", flexShrink: 0, fontSize: "10px", fontWeight: 700, color: row.isNew ? "#818cf8" : "#3d3d52" }}>
                    {row.id}
                  </div>

                  {/* Customer + Items */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "9px", fontWeight: 600, color: "#a0a0b8", marginBottom: "1px" }}>{row.customer}</div>
                    <div style={{ fontSize: "10px", color: "#5a5a70", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.items}</div>
                  </div>

                  {/* Time */}
                  <div style={{ width: "52px", flexShrink: 0, fontSize: "9px", color: "#2d2d40", textAlign: "right" }}>{row.time}</div>

                  {/* Amount */}
                  <div className="[font-family:var(--font-jb-mono)]" style={{ width: "44px", flexShrink: 0, fontSize: "11px", fontWeight: 700, color: "#d0d0e0", textAlign: "right" }}>{row.amt}</div>

                  {/* Status badge */}
                  <div style={{ width: "64px", flexShrink: 0, textAlign: "center", fontSize: "8px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", padding: "3px 0", borderRadius: "5px", background: row.sBg, color: row.sText }}>
                    {row.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Floating new-order toast */}
      <div className="hidden lg:flex items-center gap-3 animate-float" style={{
        position: "absolute", top: "-14px", right: "-18px",
        background: "#111118", border: "1px solid rgba(99,102,241,0.3)",
        borderRadius: "12px", padding: "10px 14px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.08)",
      }}>
        <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Bell size={14} color="#818cf8" />
        </div>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#d0d0e0", marginBottom: "2px" }}>New order #1042</div>
          <div style={{ fontSize: "10px", color: "#3d3d52" }}>Club Sandwich · ₹380 paid</div>
        </div>
      </div>

    </div>
  );
}

/* ── Marquee strip ────────────────────────────────────────── */
const MARQUEE_ITEMS = [
  "Zero friction", "No app needed", "PhonePe payments",
  "Real-time orders", "QR menus", "Instant kitchen alerts",
  "Live analytics", "Multi-table view", "Scan to order", "Setup in minutes",
];

function MarqueeStrip() {
  return (
    <div className="border-y border-border py-4 overflow-hidden bg-surface/50">
      <div className="flex items-center justify-center flex-wrap gap-x-10 gap-y-2 px-6">
        {MARQUEE_ITEMS.map(item => (
          <span key={item} className="inline-flex items-center gap-4 text-[11px] uppercase tracking-[0.14em] text-muted font-medium">
            {item}
            <span className="text-primary opacity-50">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div className="landing-page min-h-screen bg-background text-foreground antialiased overflow-x-hidden">

      {/* ── Navbar ── */}
      <header className="fixed top-0 w-full z-50 bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/"><Wordmark /></Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#problems"     className="text-muted hover:text-foreground transition-colors text-sm font-medium">Problems</a>
            <a href="#how-it-works" className="text-muted hover:text-foreground transition-colors text-sm font-medium">How it works</a>
            <a href="#for-cafes"    className="text-muted hover:text-foreground transition-colors text-sm font-medium">For cafes</a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="bg-primary text-white hover:bg-primary-dark px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-primary/20"
            >
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── (centered) ── */}
      <section className="relative overflow-hidden pt-28 pb-12 sm:pt-32 sm:pb-16">

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-8 animate-fade-in-up">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
              QR Ordering Platform · India
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          </div>

          {/* Headline — Syne display font */}
          <h1
            className="[font-family:var(--font-display)] text-[clamp(2.4rem,5vw,4.4rem)] font-extrabold leading-[1.08] tracking-[-0.03em] text-foreground max-w-4xl mb-6 animate-fade-in-up"
            style={{ animationDelay: "60ms" }}
          >
            Let customers order.
            <br />
            <span className="text-primary">Let staff focus.</span>
          </h1>

          {/* Subtext */}
          <p
            className="text-muted text-[1.05rem] leading-relaxed max-w-xl mb-10 animate-fade-in-up"
            style={{ animationDelay: "120ms" }}
          >
            Customers scan a QR code at their table, browse your live menu, and pay via PhonePe. No waiter, no app, no wait.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-wrap justify-center gap-3 mb-6 animate-fade-in-up"
            style={{ animationDelay: "180ms" }}
          >
            <Link
              href="/login"
              className="bg-primary text-white px-7 py-3.5 rounded-xl text-sm font-bold hover:bg-primary-dark transition-colors flex items-center gap-2 shadow-lg shadow-primary/25"
            >
              Open Dashboard
              <ArrowRight size={15} />
            </Link>
            <a
              href="#how-it-works"
              className="border border-border text-foreground px-7 py-3.5 rounded-xl text-sm font-semibold hover:bg-surface-hover transition-all flex items-center gap-2"
            >
              See how it works
            </a>
          </div>

          {/* Trust signals */}
          <div
            className="flex flex-wrap justify-center items-center gap-5 mb-10 animate-fade-in-up"
            style={{ animationDelay: "220ms" }}
          >
            {["No app required", "PhonePe payments", "Setup in minutes"].map((t) => (
              <div key={t} className="flex items-center gap-1.5 text-xs text-muted">
                <CheckCircle size={13} className="text-success flex-shrink-0" />
                {t}
              </div>
            ))}
          </div>

          {/* Browser mockup */}
          <DashboardMockup />
        </div>
      </section>

      {/* ── Marquee ── */}
      <MarqueeStrip />

      {/* ── Problems ── (editorial) ── */}
      <section id="problems" className="bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">

          <FadeIn className="mb-12">
            <p className="text-xs uppercase tracking-[0.16em] text-primary font-bold mb-5">
              The problem
            </p>
            <h2 className="[font-family:var(--font-display)] text-[clamp(1.8rem,4vw,3rem)] font-extrabold tracking-tight text-foreground max-w-xl leading-tight">
              Traditional ordering costs more than you think.
            </h2>
          </FadeIn>

          {/* Editorial list */}
          <div>
            {[
              {
                num: "01",
                title: "Waiters stretched thin",
                desc: "Too many tables, not enough hands. Orders get delayed, mistakes happen, and customers leave before ordering a second round.",
              },
              {
                num: "02",
                title: "Menus that can't keep up",
                desc: "A dish runs out but the laminated menu doesn't know. Your staff gets stuck in awkward conversations instead of delivering great service.",
              },
              {
                num: "03",
                title: "Payment creates a queue",
                desc: "The bill-splitting dance. Hunting for change. Waiting for a receipt. Payment friction is every cafe's least favourite closing act.",
              },
            ].map((item, i) => (
              <FadeIn key={item.num} delay={i * 80}>
                <div className="grid grid-cols-[72px_1fr] sm:grid-cols-[96px_1fr] gap-6 sm:gap-10 py-9 border-t border-border group cursor-default">
                  <div
                    className="[font-family:var(--font-display)] text-[2.5rem] sm:text-[3rem] font-extrabold text-border leading-none pt-1 tabular-nums group-hover:text-primary/20 transition-colors duration-300"
                  >
                    {item.num}
                  </div>
                  <div className="py-1">
                    <h3 className="text-[17px] sm:text-xl font-bold text-foreground mb-2.5 group-hover:text-primary transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-muted leading-relaxed text-[14px] sm:text-[15px] max-w-lg">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
            <div className="border-t border-border" />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="border-t border-border bg-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">

          <FadeIn className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.16em] text-primary font-bold mb-5">
              For customers
            </p>
            <h2 className="[font-family:var(--font-display)] text-[clamp(1.8rem,4vw,3rem)] font-extrabold tracking-tight text-foreground mb-4">
              From seat to served in 3 steps.
            </h2>
            <p className="text-muted max-w-md mx-auto leading-relaxed">
              No downloads. No sign-ups. Just point your camera.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                num: "01",
                icon: <QrCode size={20} />,
                title: "Scan the QR",
                desc: "Point your camera at the code on your table. The menu opens instantly in your browser. No app, no account needed.",
              },
              {
                num: "02",
                icon: <ListOrdered size={20} />,
                title: "Browse and order",
                desc: "Scroll through the full menu, add items to your cart, and review before confirming. It takes under a minute.",
              },
              {
                num: "03",
                icon: <CreditCard size={20} />,
                title: "Pay with PhonePe",
                desc: "Tap to pay securely. Your order fires to the kitchen the instant payment clears. No waiting for a waiter.",
              },
            ].map((step, i) => (
              <FadeIn key={step.num} delay={i * 100}>
                <div className="flex flex-col bg-background border border-border rounded-2xl p-7 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      {step.icon}
                    </div>
                    <span className="[font-family:var(--font-display)] text-4xl font-extrabold text-border leading-none tabular-nums">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="text-[15px] font-bold text-foreground mb-2.5">{step.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── For cafes — bento ── */}
      <section id="for-cafes" className="border-t border-border bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">

          <FadeIn className="mb-16">
            <p className="text-xs uppercase tracking-[0.16em] text-primary font-bold mb-5">
              For cafe owners
            </p>
            <h2 className="[font-family:var(--font-display)] text-[clamp(1.8rem,4vw,3rem)] font-extrabold tracking-tight text-foreground leading-tight">
              Everything your cafe needs.
              <br />
              <span className="text-muted">Nothing it doesn&apos;t.</span>
            </h2>
          </FadeIn>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-4 md:gap-5">

            {/* Live Orders — tall, primary card */}
            <FadeIn className="md:row-span-2">
              <div className="h-full bg-primary/[0.06] border border-primary/20 rounded-2xl p-8 hover:border-primary/35 transition-colors flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center mb-6 flex-shrink-0">
                  <Bell size={22} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Live order stream</h3>
                <p className="text-muted leading-relaxed mb-6 text-[15px]">
                  New orders appear on your screen the instant they&apos;re placed. Move orders through prep stages with a single tap. No refresh, no delay.
                </p>

                {/* Mock order feed */}
                <div className="rounded-xl border border-primary/15 bg-background/60 overflow-hidden mb-6 flex-shrink-0">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-primary/10">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted">Live feed</span>
                    <span className="flex items-center gap-1.5 text-[11px] text-success font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                      Connected
                    </span>
                  </div>
                  {[
                    { id: "#1042", items: "Cappuccino × 2, Croissant", amt: "₹460", status: "New", statusColor: "text-success bg-success/10" },
                    { id: "#1041", items: "Club Sandwich, Iced Tea", amt: "₹380", status: "Preparing", statusColor: "text-warning bg-warning/10" },
                    { id: "#1040", items: "Masala Chai × 3", amt: "₹270", status: "Ready", statusColor: "text-info bg-info/10" },
                  ].map((order, i) => (
                    <div key={order.id} className={`flex items-center justify-between px-4 py-3 ${i !== 2 ? "border-b border-primary/10" : ""}`}>
                      <div>
                        <p className="text-xs font-bold text-foreground">{order.id} &middot; {order.amt}</p>
                        <p className="text-[11px] text-muted mt-0.5 truncate max-w-[200px]">{order.items}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${order.statusColor}`}>{order.status}</span>
                    </div>
                  ))}
                </div>

                <ul className="space-y-3 mt-auto">
                  {[
                    "Real-time push via Server-Sent Events",
                    "One-tap status: Preparing → Ready → Done",
                    "Full order history and itemised receipts",
                    "Visual + audio alerts for new orders",
                  ].map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-muted">
                      <CheckCircle size={14} className="mt-0.5 text-primary flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>

            {/* Menu management */}
            <FadeIn delay={100}>
              <div className="bg-surface border border-border rounded-2xl p-7 hover:border-primary/20 transition-colors group h-full flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-colors duration-300 flex-shrink-0">
                  <ChefHat size={18} />
                </div>
                <h3 className="text-[15px] font-bold text-foreground mb-2">Menu management</h3>
                <p className="text-sm text-muted leading-relaxed mb-5 flex-1">
                  Add, edit, or disable items and categories. Changes go live on every table QR instantly. No reprinting, no waiting.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Image uploads", "Category toggles", "Instant sync"].map((t) => (
                    <span key={t} className="text-[11px] bg-background text-muted px-2.5 py-1 rounded-full font-medium border border-border">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Analytics */}
            <FadeIn delay={180}>
              <div className="bg-surface border border-border rounded-2xl p-7 hover:border-primary/20 transition-colors group h-full flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-colors duration-300 flex-shrink-0">
                  <LineChart size={18} />
                </div>
                <h3 className="text-[15px] font-bold text-foreground mb-2">Deep insights</h3>
                <p className="text-sm text-muted leading-relaxed mb-5 flex-1">
                  Peak hours, top sellers, revenue breakdown. The metrics that drive real decisions, not vanity numbers.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Hourly charts", "Item revenue", "Customer trends"].map((t) => (
                    <span key={t} className="text-[11px] bg-background text-muted px-2.5 py-1 rounded-full font-medium border border-border">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-t border-border bg-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden border border-border">
              {[
                { value: "10k+",    label: "Orders processed" },
                { value: "20+",     label: "Partner cafes" },
                { value: "< 2 min", label: "Avg order time" },
                { value: "99.9%",   label: "Platform uptime" },
              ].map((s) => (
                <div key={s.label} className="bg-surface flex flex-col items-center justify-center py-10 px-6 text-center">
                  <div className="[font-family:var(--font-display)] text-[clamp(1.8rem,4vw,3rem)] font-extrabold tracking-tight text-foreground leading-none mb-2.5 tabular-nums">
                    {s.value}
                  </div>
                  <div className="text-[11px] text-muted uppercase tracking-wider font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-border bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <FadeIn>
            <div className="relative bg-primary rounded-3xl px-8 sm:px-16 py-16 sm:py-20 text-center overflow-hidden">
              <div
                className="absolute inset-0 opacity-[0.1] pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
                  backgroundSize: "22px 22px",
                }}
              />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-white/10 blur-3xl rounded-full pointer-events-none" />

              <div className="relative z-10">
                <p className="text-white/60 text-xs uppercase tracking-[0.18em] font-bold mb-5">
                  Get started today
                </p>
                <h2 className="[font-family:var(--font-display)] text-[clamp(1.8rem,4.5vw,3.2rem)] font-extrabold tracking-tight text-white mb-5 leading-tight">
                  Your cafe&apos;s first QR order<br />is minutes away.
                </h2>
                <p className="text-white/60 text-base max-w-sm mx-auto mb-9 leading-relaxed">
                  Sign in to get your cafe onboarded and taking orders fast.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-xl text-sm font-bold hover:bg-white/90 transition-colors shadow-lg"
                >
                  Open Dashboard
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-5">
          <Wordmark />
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} Scan&amp;Pay · Built for modern dining.
          </p>
          <div className="flex gap-6 text-xs text-muted">
            <span className="hover:text-foreground transition-colors cursor-pointer">Privacy</span>
            <span className="hover:text-foreground transition-colors cursor-pointer">Terms</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
