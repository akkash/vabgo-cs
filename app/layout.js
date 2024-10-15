import { Outfit } from "next/font/google";
import "./globals.css";
import Provider from "./Provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from '../app/contexts/AuthContext'

const inter = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "Vabgo - Commercial Properties",
  description: "Discover great local Commercial Properties",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Provider>
            <Toaster />
            {children}
          </Provider>
        </AuthProvider>
      </body>
    </html>
  );
}
