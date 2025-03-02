import PuzzleGameWrapper from "@/components/puzzle/PuzzleGame";
import * as server from "@/services/server";
import { currentUser } from "@clerk/nextjs/server";

import { getData } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const newData = getData(locale);
  return {
    title: newData.gameH1,
    description: newData.websiteDescription,
    keywords: newData.websiteKeywords,
  };
}
export default async function PuzzlePlayPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const puzzle = await server.atomService.getAtomById(parseInt(id));
  const user = await currentUser();
  return (
    <div className="min-h-screen">
      <PuzzleGameWrapper
        locale={locale}
        puzzle={puzzle}
        id={parseInt(id)}
        hasUser={!!user}
      />
    </div>
  );
}
