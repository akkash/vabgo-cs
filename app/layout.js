import { Outfit } from "next/font/google";
import "./globals.css";
import Provider from "./Provider";
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Toaster } from "@/components/ui/sonner";

const inter = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "Vabgo - Commercial Properties",
  description: "Discover great local Commercial Properties",
};

export default async function RootLayout({ children }) {
  // Move the supabase client creation inside the function
  const supabase = createServerComponentClient({ cookies }); // This line needs to be updated

  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider>
          <Toaster />
          {children}
        </Provider>
      </body>
    </html>
  );
}
