import { getCurrentUser } from "@/app/api/util";
import MainLayout from "@/components/layout/main-layout";
import { PuzzleDetail } from "@/components/puzzle/PuzzleDetail";
import * as server from "@/services/server";

export default async function PuzzlePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const user = await getCurrentUser();
  const { id, locale } = await params;
  const atom = await server.atomService.getAtomById(Number(id));
  const groupAtoms = atom.groupId
    ? await server.atomService.getGroupAtoms(atom.groupId)
    : { data: [] };

  const atomFeatured = await server.atomService.getAtomFeatured(atom.id);
  return (
    <MainLayout locale={locale}>
      <PuzzleDetail
        locale={locale}
        role={user?.role as string}
        puzzle={atom}
        groupAtoms={groupAtoms.data.filter((a) => a.id !== atom.id)}
        isFeatured={!!atomFeatured?.isFeatured}
      />
    </MainLayout>
  );
}
