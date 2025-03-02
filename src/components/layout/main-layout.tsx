import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { getCurrentUser } from "@/app/api/util";

interface MainLayoutProps {
  children: React.ReactNode;
  locale?: string;
}

export default async function MainLayout({
  children,
  locale,
}: MainLayoutProps) {
  const user = await getCurrentUser();
  return (
    <div className="flex flex-col min-h-screen">
      <Header locale={locale} isAdmin={user?.role === "ADMIN"} />

      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>

      <Footer />
    </div>
  );
}
