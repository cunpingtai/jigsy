import * as server from "@/services/server";
import MainLayout from "@/components/layout/main-layout";
import { getCurrentUser } from "@/app/api/util";
import { redirect } from "next/navigation";
import RecordPage from "./hook";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page: string }>;
}) {
  const { locale } = await params;
  const { page } = await searchParams;

  const pageSize = 100;

  const user = await getCurrentUser();

  if (!user) {
    return redirect(`/${locale}/explore`);
  }

  const response = await server.atomService.getAtoms({
    userId: user.id,
    status: "ALL",
    page: parseInt(page) || 1,
    pageSize: pageSize,
  });

  return (
    <MainLayout locale={locale}>
      <RecordPage locale={locale} result={response} />
    </MainLayout>
  );
}
