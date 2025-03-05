import { getCurrentUser } from "@/app/api/util";
import MainLayout from "@/components/layout/main-layout";
import { PuzzleCreator } from "@/components/puzzle/PuzzleCreator";
import { Hero } from "@/components/shared/Hero";
import { staticDataFetcher } from "@/fetch";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const staticData = await staticDataFetcher(locale);

  return {
    title: staticData.createH1,
    description: staticData.createH2,
    keywords: staticData.websiteKeywords,
  };
}

export default async function CreatePuzzlePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const staticData = await staticDataFetcher(locale);
  const user = await getCurrentUser();
  return (
    <MainLayout locale={locale}>
      <Hero title={staticData.createH1} subtitle={staticData.createH2} />
      <PuzzleCreator isAdmin={user?.role === "ADMIN"} locale={locale} />
    </MainLayout>
  );
}
