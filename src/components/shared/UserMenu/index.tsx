import { Button } from "@/components/ui/button";
import { UserIcon } from "lucide-react";
import { SignInButton } from "@/components/shared/SignInButton";
import { SignedOut } from "@/components/shared/SignedOut";
import { SignedIn } from "@/components/shared/SignedIn";
import { UserButton } from "@/components/shared/UserButton";

export const UserMenu = () => {
  return (
    <div className="flex items-center space-x-4">
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton>
          <Button variant="outline">
            <UserIcon className="w-4 h-4" />
          </Button>
        </SignInButton>
      </SignedOut>
    </div>
  );
};
