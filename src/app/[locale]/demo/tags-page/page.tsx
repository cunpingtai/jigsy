import MainLayout from "@/components/layout/main-layout";
import Tags from "../tags";

export default async function Demo({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <MainLayout locale={locale}>
      <Tags locale={locale} />
    </MainLayout>
  );
}
