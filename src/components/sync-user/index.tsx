"use client";
import * as client from "@/services/client";
import { useEffect } from "react";

type SyncUserProps = {
  username: string;
  email: string;
  avatar: string;
  clerkId: string;
};

export default function SyncUser({
  username,
  email,
  avatar,
  clerkId,
}: SyncUserProps) {
  useEffect(() => {
    client.userService.createOrUpdateUserByClerkId(clerkId, {
      name: username || "",
      email: email || "",
      avatar: avatar || "",
    });
  }, [clerkId, username, email, avatar]);
  return null;
}
