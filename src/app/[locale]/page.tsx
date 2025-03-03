import { langsFetcher, staticDataFetcher, websiteFetcher } from "@/fetch";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export async function generateStaticParams() {
  const langs = await langsFetcher();
  return langs.map((l) => ({ lang: l.lang.value }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const staticData = await staticDataFetcher(locale);
  const website = await websiteFetcher(locale);

  return {
    title: staticData?.websiteTitle,
    description: staticData?.websiteDescription,
    keywords: staticData?.websiteKeywords,
    alternates: {
      canonical: `${website.domain}/${locale}`,
    },
    openGraph: {
      title: staticData?.websiteTitle,
      description: staticData?.websiteDescription,
      url: `${website.domain}/${locale}`,
      siteName: staticData?.websiteTitle,
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

export default async function LocalePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  redirect(`/${locale}/explore`);
}
