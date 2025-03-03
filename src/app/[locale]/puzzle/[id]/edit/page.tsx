import MainLayout from "@/components/layout/main-layout";
import { PuzzleCreator } from "@/components/puzzle/PuzzleCreator";
import { staticDataFetcher } from "@/fetch";
import * as server from "@/services/server";

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
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const atom = await server.atomService.getAtomById(Number(id));
  return (
    <MainLayout locale={locale}>
      <PuzzleCreator atom={atom} id={id} locale={locale} />
    </MainLayout>
  );
}
