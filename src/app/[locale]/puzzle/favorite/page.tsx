import * as server from "@/services/server";
import MainLayout from "@/components/layout/main-layout";
import { getCurrentUser } from "@/app/api/util";
import { redirect } from "next/navigation";
import FavoritePage from "./hook";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page: string }>;
}) {
  const { locale } = await params;
  const { page } = await searchParams;

  const pageSize = 24;

  const user = await getCurrentUser();

  if (!user) {
    return redirect(`/${locale}/explore`);
  }

  const response = await server.atomService.getUserFavoriteAtoms({
    userId: user.id,
    page: parseInt(page) || 1,
    pageSize: pageSize,
  });
  return (
    <MainLayout locale={locale}>
      <FavoritePage locale={locale} result={response} />
    </MainLayout>
  );
}
