import { signIn } from "next-auth/react";

export const SignInButton = ({ children }: { children: React.ReactNode }) => {
  return (
    <div onClick={() => signIn("google", { callbackUrl: "/" })}>{children}</div>
  );
};
