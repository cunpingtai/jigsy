import { User } from "@clerk/nextjs/server";
import * as server from "@/services/server";

type SyncUserProps = {
  user: User;
};

export default async function SyncUser({ user }: SyncUserProps) {
  const data = await server.userService.createOrUpdateUserByClerkId(user.id, {
    name: user.username || "",
    email: user.emailAddresses[0]?.emailAddress,
    avatar: user.imageUrl,
  });
  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
