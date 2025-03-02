import MainLayout from "@/components/layout/main-layout";
import { PuzzleCreator } from "@/components/puzzle/PuzzleCreator";
import * as server from "@/services/server";

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
