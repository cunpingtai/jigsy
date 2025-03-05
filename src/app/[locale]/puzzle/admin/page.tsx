import * as server from "@/services/server";
import MainLayout from "@/components/layout/main-layout";
import { getCurrentUser } from "@/app/api/util";
import { redirect } from "next/navigation";
import AdminPage from "./hook";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page: string; status: string; search: string }>;
}) {
  const { locale } = await params;
  const { page, status, search } = await searchParams;

  const pageSize = 24;

  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return redirect(`/${locale}/explore`);
  }

  const response = await server.atomService.getAtoms({
    page: parseInt(page) || 1,
    pageSize: pageSize,
    status: status || "ALL",
    title: search || "",
  });

  return (
    <MainLayout locale={locale}>
      <AdminPage
        search={search}
        locale={locale}
        result={response}
        status={status as any}
      />
    </MainLayout>
  );
}
