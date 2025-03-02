import { getCurrentUser } from "@/app/api/util";
import { SignUp } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return redirect("/en/explore");
  }
  return <SignUp />;
}
