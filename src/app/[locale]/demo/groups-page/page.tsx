import MainLayout from "@/components/layout/main-layout";
import Group from "../group";
import GroupsCategories from "../groups-categories";

export default async function Demo({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <MainLayout locale={locale}>
      <Group locale={locale} />
      <GroupsCategories locale={locale} />
    </MainLayout>
  );
}
