import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "./providers";
import { neobrutalism } from "@clerk/themes";
import { zhCN } from "@clerk/localizations";
import { Toaster } from "@/components/ui/sonner";
import { SyncUserHook } from "./hook";
import { getData } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const newData = getData(locale);
  return {
    title: newData.websiteTitle,
    description: newData.websiteDescription,
    keywords: newData.websiteKeywords,
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const newData = getData(locale);

  return (
    <ClerkProvider
      appearance={{ baseTheme: neobrutalism }}
      afterSignOutUrl={`/${locale}/explore`}
      localization={zhCN}
    >
      <html lang="en" suppressHydrationWarning={true}>
        <body className={`gradient-bg antialiased`}>
          <SyncUserHook />
          <Providers locale={locale} data={newData}>
            {children}
          </Providers>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
