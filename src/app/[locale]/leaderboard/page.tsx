import MainLayout from "@/components/layout/main-layout";
import { MainContent } from "@/components/leaderboard/MainContent";
import { getCurrentUser } from "../../api/util";
import { redirect } from "next/navigation";

export default async function Leaderboard() {
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
