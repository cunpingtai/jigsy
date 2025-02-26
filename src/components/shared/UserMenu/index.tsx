import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export const UserMenu = () => {
  return (
    <div className="flex items-center space-x-4">
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton>
          <Button variant="outline">登录</Button>
        </SignInButton>
      </SignedOut>
    </div>
  );
};
