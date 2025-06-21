import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Indian Stock Trading Bot",
  description: "Real-time analysis and automated trading signals for NSE stocks",
};

export default function TradingBotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
