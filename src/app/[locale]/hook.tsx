"use client";
import SyncUser from "@/components/sync-user";
import { useUser } from "@clerk/nextjs";

export function SyncUserHook() {
  const user = useUser();
  if (!user) return null;
  if (!user.user) return null;

  return (
    <SyncUser
      username={user.user?.username || ""}
      email={user.user?.emailAddresses[0]?.emailAddress || ""}
      avatar={user.user?.imageUrl || ""}
      clerkId={user.user?.id}
    />
  );
}
