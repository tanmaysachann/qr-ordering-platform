import Link from "next/link";
import { Coffee, QrCode, ShoppingBag, CreditCard } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/25">
          <Coffee size={40} className="text-white" />
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-2">
          Cafe<span className="text-primary">Order</span>
        </h1>
        <p className="text-muted mb-8">
          Scan the QR code at your table to browse the menu, order, and pay instantly.
        </p>

        {/* Steps */}
        <div className="space-y-4 mb-10 text-left">
          {[
            { icon: <QrCode size={22} />, title: "Scan QR Code", desc: "Point your camera at the QR code on your table" },
            { icon: <ShoppingBag size={22} />, title: "Browse & Order", desc: "Add your favourite items to the cart" },
            { icon: <CreditCard size={22} />, title: "Pay Securely", desc: "Complete payment with PhonePe" },
          ].map((step, i) => (
            <div key={i} className="flex gap-4 items-start bg-surface rounded-2xl p-4 border border-border">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                {step.icon}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{step.title}</h3>
                <p className="text-xs text-muted">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full text-center bg-surface text-foreground border border-border rounded-xl py-3 font-medium hover:bg-surface-hover transition-colors"
          >
            Staff Login
          </Link>
          <p className="text-xs text-muted">
            Customers: Scan the QR code at the cafe to start ordering
          </p>
        </div>
      </div>
    </div>
  );
}
