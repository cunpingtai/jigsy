import MainLayout from "@/components/layout/main-layout";
import { MainContent } from "@/components/explore/MainContent";
import * as server from "@/services/server";
import { Hero } from "@/components/shared/Hero";
import { FAQ } from "@/components/shared/FAQ";
import { Features } from "@/components/shared/Features";
import { getData } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const newData = getData(locale);
  return {
    title: newData.exploreH1,
    description: newData.exploreH21,
    keywords: newData.websiteKeywords,
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
    groupId: group ? group?.id : "",
    page: Number(page) || 1,
    pageSize: 24,
  });

  const featuredAtoms = await server.featureService.getFeaturedAtoms({
    language: locale,
  });

  const data = getData(locale);

  const faqItems = data.faqItems;

  const featureItems = data.featureItems;

  return (
    <MainLayout locale={locale}>
      <Hero
        title={data.exploreH1}
        subtitle={data.exploreH21}
        className="mb-8"
      />
      <MainContent
        locale={locale}
        categoryName={category?.name || ""}
        groupName={group?.name || ""}
        categories={categories}
        atoms={atoms}
        featuredAtoms={featuredAtoms.data}
      />
      <Features
        items={featureItems}
        title={data.featuresTitle}
        className="mt-16 mb-12"
      />
      <FAQ items={faqItems} title={data.faqTitle} className="mb-16" />
    </MainLayout>
  );
}
