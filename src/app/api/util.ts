import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function getCurrentUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return null;
  }
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  if (!user) {
    return null;
  }

  return user;
}

export async function currentUserId() {
  const user = await getCurrentUser();
  return user?.id;
}
