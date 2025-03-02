import MainLayout from "@/components/layout/main-layout";
import { MainContent } from "@/components/profile/MainContent";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../../api/util";

export default async function Profile() {
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
