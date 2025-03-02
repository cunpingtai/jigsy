import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { UserIcon } from "lucide-react";

type UserMenuProps = {
  locale: string;
};

export const UserMenu = ({ locale }: UserMenuProps) => {
  return (
    <div className="flex items-center space-x-4">
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton fallbackRedirectUrl={`/${locale}/explore`}>
          <Button variant="outline">
            <UserIcon className="w-4 h-4" />
          </Button>
        </SignInButton>
      </SignedOut>
    </div>
  );
};
