import PuzzleGameWrapper from "@/components/puzzle/PuzzleGame";
import * as server from "@/services/server";
import { staticDataFetcher } from "@/fetch";
import { getCurrentUser } from "@/app/api/util";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const staticData = await staticDataFetcher(locale);

  return {
    title: staticData.gameH1,
    description: staticData.websiteDescription,
    keywords: staticData.websiteKeywords,
  };
}
export default async function PuzzlePlayPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const puzzle = await server.atomService.getAtomById(parseInt(id));
  const user = await getCurrentUser();
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
