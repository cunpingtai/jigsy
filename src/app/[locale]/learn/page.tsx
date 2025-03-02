import MainLayout from "@/components/layout/main-layout";
import { MainContent } from "@/components/learn/MainContent";
import { getCurrentUser } from "../../api/util";
import { redirect } from "next/navigation";

export default async function Learn() {
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
