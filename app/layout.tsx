import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type { Metadata } from "next";
import { Inter, Poppins, Sansita_Swashed } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sansitaSwashed = Sansita_Swashed({
  variable: "--font-sansita",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Confirm Bakery",
    template: "%s | Confirm Bakery",
  },
  description:
    "Fresh bread, cakes, pastries, and treats from Confirm Bakery in Ghana.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-GH"
      className={`${inter.variable} ${poppins.variable} ${sansitaSwashed.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ClerkProvider
          appearance={{
            theme: shadcn,
            variables: {
              colorPrimary: "#933c24",
              borderRadius: "0.625rem",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
