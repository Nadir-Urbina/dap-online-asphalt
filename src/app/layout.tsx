import type { Metadata, Viewport } from "next";
import { Montserrat, Inter } from "next/font/google";
import Image from "next/image";
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
  title: "Duval Asphalt - Online Plant Store",
  description: "Order premium asphalt mixes, tools, and plant equipment online from Duval Asphalt. Professional asphalt solutions for your construction needs.",
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
            {/* Logo and Company Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-border-secondary">
              <div className="flex flex-col items-center sm:items-start mb-4 sm:mb-0">
                <Image
                  src="/DA_Logo.jpeg"
                  alt="Duval Asphalt"
                  width={150}
                  height={50}
                  className="h-12 w-auto object-contain mb-2"
                />
                <p className="text-xs sm:text-sm text-text-muted text-center sm:text-left">
                  Professional Asphalt Solutions
                </p>
              </div>
              <div className="text-center sm:text-right text-xs sm:text-sm text-text-secondary">
                <p>Phone: (904) 555-0123</p>
                <p>Email: orders@duvalasphalt.com</p>
                <p>Emergency: (904) 555-0124</p>
              </div>
            </div>
            
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
                <h3 className="heading-sm text-secondary mb-3 sm:mb-4">Services</h3>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-text-secondary">
                  <p>Hot Mix Asphalt Production</p>
                  <p>Equipment & Tool Sales</p>
                  <p>Custom Mix Design</p>
                  <p>Bulk Material Supply</p>
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
              <p>&copy; 2024 Duval Asphalt. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
