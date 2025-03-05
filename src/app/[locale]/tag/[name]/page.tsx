import * as server from "@/services/server";
import MainLayout from "@/components/layout/main-layout";
import TagPuzzlesPage from "./hook";
import { redirect } from "next/navigation";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; name: string }>;
  searchParams: Promise<{ page: string }>;
}) {
  const { locale, name } = await params;
  const { page } = await searchParams;

  if (!name) {
    return redirect(`/${locale}/explore`);
  }

  const pageSize = 24;
  const currentPage = parseInt(page) || 1;

  const response = await server.tagService.getTagByName(name, {
    page: currentPage,
    pageSize,
  });

  // 转换数据为 AtomFeatured 格式
  const featuredAtoms = response.data.map((atom) => ({
    atom: atom,
    reason: `Tagged with ${name}`,
    createdAt: new Date().toISOString(),
  }));

  const totalPages = Math.ceil(response.pagination.total / pageSize);

  return (
    <MainLayout locale={locale}>
      <TagPuzzlesPage
        locale={locale}
        tagName={name}
        initialPuzzles={featuredAtoms}
        initialTotalPages={totalPages}
        initialPage={currentPage}
        tagDescription={response.description}
      />
    </MainLayout>
  );
}
