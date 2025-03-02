import { redirect } from "next/navigation";
import * as server from "@/services/server";
import { getCurrentUser } from "@/app/api/util";
import PlayRecordPage from "./hook";
import MainLayout from "@/components/layout/main-layout";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
  const { locale } = await params;
  const user = await getCurrentUser();
  const { page, pageSize } = await searchParams;

  if (!user) {
    return redirect(`/${locale}/explore`);
  }

  const { data, pagination } = await server.atomService.getUserGameRecords({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 12,
  });

  return (
    <MainLayout locale={locale}>
      <PlayRecordPage
        locale={locale}
        records={data}
        total={pagination.total}
        currentPage={Number(page) || 1}
        pageSize={Number(pageSize) || 12}
      />
    </MainLayout>
  );
}
