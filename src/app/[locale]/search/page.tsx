import MainLayout from "@/components/layout/main-layout";
import SearchPage from "./hook";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <MainLayout locale={locale}>
      <SearchPage locale={locale} />
    </MainLayout>
  );
}
