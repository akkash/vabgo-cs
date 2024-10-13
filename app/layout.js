import { Outfit } from "next/font/google";
import "./globals.css";
import Provider from "./Provider";
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from '../app/contexts/AuthContext'

const inter = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "Vabgo - Commercial Properties",
  description: "Discover great local Commercial Properties",
  icons: {
    icon: '/favicon.ico', // Add this line
  },
};

export default async function RootLayout({ children }) {
  // Move the supabase client creation inside the function
  const supabase = createServerComponentClient({ cookies }); // Ensure cookies is passed correctly

  // New implementation could go here
  // For example:
  // const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Provider>
            {/* New components or logic could be added here */}
            <Toaster />
            {children}
          </Provider>
        </AuthProvider>
      </body>
    </html>
  );
}
