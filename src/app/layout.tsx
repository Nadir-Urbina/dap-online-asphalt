import type { Metadata, Viewport } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import NavBar from "@/components/NavBar";

const montserrat = Montserrat({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DAP Online Plant - Asphalt & Equipment Store",
  description: "Order asphalt mixes, tools, and plant equipment online. Professional asphalt solutions for your construction needs.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} ${inter.variable} antialiased`}
      >
        <AuthProvider>
          <NavBar />
          <main className="min-h-screen">
            {children}
          </main>
        </AuthProvider>
        <footer className="bg-bg-surface text-text-primary py-6 sm:py-8 border-t border-border-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div>
                <h3 className="heading-sm text-secondary mb-3 sm:mb-4">Plant Locations</h3>
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-text-secondary">
                  <div>
                    <p className="font-medium text-text-primary">Phillips Hwy Plant</p>
                    <p>7544 Philips Highway</p>
                    <p>Jacksonville, FL 32256</p>
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">12th Street Plant</p>
                    <p>6820 West 12th Street</p>
                    <p>Jacksonville, FL 32254</p>
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">Green Cove Springs Plant</p>
                    <p>1921 Jersey Avenue</p>
                    <p>Green Cove Springs, FL 32043</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="heading-sm text-secondary mb-3 sm:mb-4">Contact</h3>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-text-secondary">
                  <p>Phone: (904) 555-0123</p>
                  <p>Email: orders@daponline.com</p>
                  <p>Emergency: (904) 555-0124</p>
                </div>
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <h3 className="heading-sm text-secondary mb-3 sm:mb-4">Mix Availability</h3>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-text-secondary">
                  <p className="font-medium text-text-primary">All Locations:</p>
                  <p>Monday - Friday: 7:00 AM - 4:00 PM</p>
                  <p>Weekends: Available by request</p>
                  <p className="text-text-muted mt-2">Additional charges apply for after-hours service</p>
                </div>
              </div>
            </div>
            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border-secondary text-center text-xs sm:text-sm text-text-muted">
              <p>&copy; 2024 DAP Online Plant. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
