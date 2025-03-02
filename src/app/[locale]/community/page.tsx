import MainLayout from "@/components/layout/main-layout";
import { MainContent } from "@/components/community/MainContent";
import { getCurrentUser } from "../../api/util";
import { redirect } from "next/navigation";

export default async function Community() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return redirect("/en/explore");
  }
  return (
    <MainLayout>
      <MainContent />
    </MainLayout>
  );
}
