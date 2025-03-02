import MainLayout from "@/components/layout/main-layout";
import { PuzzleCreator } from "@/components/puzzle/PuzzleCreator";
import { Hero } from "@/components/shared/Hero";

import { getData } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const newData = getData(locale);
  return {
    title: newData.createH1,
    description: newData.createH2,
    keywords: newData.websiteKeywords,
  };
}

export default async function CreatePuzzlePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const data = getData(locale);
  return (
    <MainLayout locale={locale}>
      <Hero title={data.createH1} subtitle={data.createH2} />
      <PuzzleCreator locale={locale} />
    </MainLayout>
  );
}
