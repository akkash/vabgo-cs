import { Outfit } from "next/font/google";
import "./globals.css";
import Provider from "./Provider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";

const inter = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "Vabgo - Commercial Properties",
  description: "Discover great local Commercial Properties",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en">
    <Head>
      <link rel="icon" href="/favicon.ico" />
    </Head>
      <body className={inter.className}>
        <Provider>
         <Toaster />

         {children}
        </Provider>
       </body>
    </html>
    </ClerkProvider>
  );
}
