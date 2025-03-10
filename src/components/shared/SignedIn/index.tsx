import { useSession, signIn } from "next-auth/react";

export const SignedIn = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();

  if (status === "loading" || !session) {
    return null;
  }

  return <>{children}</>;
};
