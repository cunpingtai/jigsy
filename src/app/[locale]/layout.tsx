import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "./providers";
import { neobrutalism } from "@clerk/themes";
import {
  zhCN,
  enUS,
  esES,
  frFR,
  deDE,
  itIT,
  jaJP,
  koKR,
  ptBR,
  ruRU,
} from "@clerk/localizations";
import { Toaster } from "@/components/ui/sonner";
import { SyncUserHook } from "./hook";
import { JetBrains_Mono } from "next/font/google";
import {
  infoFetcher,
  langFieldFetcher,
  langsFetcher,
  metaFetcher,
  scriptFetcher,
  staticDataFetcher,
  websiteFetcher,
} from "@/fetch";
import Script from "next/script";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"], // Specify the font weights you need
});

const getLocalization = (locale: string) => {
  switch (locale) {
    case "zh":
    case "zh-CN":
      return zhCN;
    case "en":
    case "en-US":
      return enUS;
    case "es":
    case "es-ES":
      return esES;
    case "fr":
    case "fr-FR":
      return frFR;
    case "de":
    case "de-DE":
      return deDE;
    case "it":
    case "it-IT":
      return itIT;
    case "ja":
    case "ja-JP":
      return jaJP;
    case "ko":
    case "ko-KR":
      return koKR;
    case "pt":
    case "pt-BR":
      return ptBR;
    case "ru":
    case "ru-RU":
      return ruRU;
    default:
      return enUS;
  }
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const staticData = await staticDataFetcher(locale);
  const website = await websiteFetcher(locale);

  return {
    title: {
      template: `${staticData.websiteTitle}`,
      default: staticData.websiteDescription,
    },
    description: staticData.websiteDescription,
    keywords: staticData.websiteKeywords,
    icons: {
      icon: [
        { url: "/favicon.webp", type: "image/webp" },
        { url: "/favicon-32x32.webp", type: "image/webp", sizes: "32x32" },
        { url: "/favicon-192x192.webp", type: "image/webp", sizes: "192x192" },
      ],
      apple: [{ url: "/apple-icon.webp" }],
    },
    openGraph: {
      title: staticData.websiteTitle,
      description: staticData.websiteDescription,
      url: `${website.domain}/${locale}`,
      siteName: staticData.websiteTitle || "Jigsy Puzzle",
      locale: locale,
      type: "website",
      images: [
        {
          url: `${website.domain}/og-image.webp`,
          width: 1200,
          height: 630,
          alt: staticData?.websiteTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: staticData?.websiteTitle,
      description: staticData?.websiteDescription,
      images: [`${website.domain}/og-image.webp`],
    },
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
  const staticData = await staticDataFetcher(locale);
  const [meta, info, langs, scripts, configLangs] = await Promise.all([
    metaFetcher(locale),
    infoFetcher(locale),
    langsFetcher(),
    scriptFetcher(locale),
    langFieldFetcher(locale),
  ]);

  const scriptScripts = scripts.filter((s) => s.type === "script");
  const srcScripts = scripts.filter((s) => s.type === "string");
  const objectScripts = scripts.filter((s) => s.type === "object");

  return (
    <ClerkProvider
      appearance={{ baseTheme: neobrutalism }}
      afterSignOutUrl={`/${locale}/explore`}
      localization={getLocalization(locale)}
    >
      <html
        lang={info.lang?.value || locale}
        dir={meta.direction || "ltr"}
        className={mono.className}
        style={{ fontFamily: meta.fontFamily }}
        suppressHydrationWarning={true}
      >
        {langs.map(({ website_id, domain, lang }) => {
          const hrefLang =
            process.env.NEXT_PUBLIC_RESOURCE_WEBSITE_ID === website_id
              ? "x-default"
              : lang.value;
          return (
            <link
              title={lang.value}
              key={website_id}
              rel="alternate"
              hrefLang={hrefLang}
              href={`${domain}/${lang.value}`}
            />
          );
        })}
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <body className={`gradient-bg antialiased`}>
          {objectScripts.map((script, index) => {
            let obj: Record<string, any> = {};
            try {
              obj = JSON.parse(script.value);
            } catch (e) {
              console.error(e);
            }

            return (
              <Script
                strategy="beforeInteractive"
                id={index.toString()}
                key={index}
                {...obj}
              />
            );
          })}

          {scriptScripts.map((script, index) => (
            <Script
              strategy="beforeInteractive"
              id={index.toString()}
              key={index}
            >
              {script.value}
            </Script>
          ))}

          {srcScripts.map((script, index) => (
            <Script
              strategy="beforeInteractive"
              id={index.toString()}
              key={index}
              title={script.value}
              src={script.value}
            />
          ))}
          <SyncUserHook />
          <Providers
            locale={locale}
            data={staticData}
            langs={
              configLangs?.langs?.map((l: any) => ({
                value: l.name,
                name: l.label,
              })) || []
            }
          >
            {children}
          </Providers>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
