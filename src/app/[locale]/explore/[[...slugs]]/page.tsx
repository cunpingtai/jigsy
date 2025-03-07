import MainLayout from "@/components/layout/main-layout";
import { MainContent } from "@/components/explore/MainContent";
import * as server from "@/services/server";
import { Hero } from "@/components/shared/Hero";
import { FAQ } from "@/components/shared/FAQ";
import { Features } from "@/components/shared/Features";
import { JsonLd } from "@/components/json-ld";
import { staticDataFetcher, websiteFetcher } from "@/fetch";
import { Metadata } from "next";
import { getCurrentUser } from "@/app/api/util";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const staticData = await staticDataFetcher(locale);
  const website = await websiteFetcher(locale);

  return {
    title: staticData?.exploreH1,
    description: staticData?.exploreH21,
    keywords: staticData?.websiteKeywords,
    alternates: {
      canonical: `${website.domain}/${locale}`,
    },
    openGraph: {
      title: staticData?.exploreH1,
      description: staticData?.exploreH21,
      url: `${website.domain}/${locale}`,
      siteName: staticData?.exploreH1,
      locale: locale,
      type: "website",
      images: [
        {
          url: `${website.domain}/og-image.webp`,
          width: 1200,
          height: 630,
          alt: staticData?.exploreH1,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: staticData?.exploreH1,
      description: staticData?.exploreH21,
      images: [`${website.domain}/og-image.webp`],
    },
  };
}

export default async function Explore({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slugs: string[] }>;
  searchParams: Promise<{ page: string }>;
}) {
  const { locale, slugs } = await params;
  const { page } = await searchParams;
  const [categoryName, groupName] = slugs || [];
  // const user = await getCurrentUser();
  const categories = await server.categoryService.getAllCategories({
    language: locale,
  });
  const category = categories.find(
    (c) => decodeURIComponent(c.name) === decodeURIComponent(categoryName)
  );
  const group = category?.groups.find(
    (g) => decodeURIComponent(g.name) === decodeURIComponent(groupName)
  );

  const atoms = await server.atomService.getAtoms({
    language: locale,
    categoryId: category ? category?.id : "",
    groupId: group ? group?.id : "",
    page: Number(page) || 1,
    pageSize: 24,
  });

  const featuredAtoms = await server.featureService.getFeaturedAtoms({
    language: locale,
  });

  const [staticData, website] = await Promise.all([
    staticDataFetcher(locale),
    websiteFetcher(locale),
  ]);

  // 创建结构化数据
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: staticData?.websiteTitle,
    description: staticData?.websiteDescription,
    url: `${website.domain}/${locale}`,
    inLanguage: locale,
    publisher: {
      "@type": "Organization",
      name: staticData?.websiteTitle,
      url: website.domain,
      logo: {
        "@type": "ImageObject",
        url: `${website.domain}/logo.webp`, // 确保这个路径存在
      },
    },
  };

  const faqItems = staticData.faqItems;

  const featureItems = staticData.featureItems;

  return (
    <MainLayout locale={locale}>
      <JsonLd data={jsonLd} />

      <Hero
        title={staticData.exploreH1}
        subtitle={staticData.exploreH21}
        className="mb-8"
      />
      <MainContent
        // isAdmin={user?.role === "ADMIN"}
        isAdmin={false}
        locale={locale}
        category={category}
        group={group}
        categories={categories}
        atoms={atoms}
        featuredAtoms={featuredAtoms.data}
      />
      <Features
        items={featureItems}
        title={staticData.featuresTitle}
        className="mt-16 mb-12"
      />
      <FAQ items={faqItems} title={staticData.faqTitle} className="mb-16" />
    </MainLayout>
  );
}
