"use client";
import { FC, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Moon,
  Sun,
  Search,
  Puzzle,
  Menu,
  Tag,
  Group,
  ChartBarStacked,
  Home,
  Clock,
  Rocket,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserMenu } from "../UserMenu";
import { LanguageSelector } from "../LanguageSelector";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useI18n } from "@/app/[locale]/providers";
import { SignedIn } from "../SignedIn";
import { signIn, useSession } from "next-auth/react";
import { useGoogleOneTapLogin } from "@react-oauth/google";
export const Header: FC<{ locale?: string; isAdmin?: boolean }> = ({
  locale,
  isAdmin,
}) => {
  const { data } = useI18n();
  const navigationItems = [
    // {
    //   icon: Home,
    //   label: data.home,
    //   href: "/",
    // },
    // {
    //   icon: Trophy,
    //   label: data.leaderboard,
    //   href: "/leaderboard",
    // },
    {
      icon: Home,
      label: data.explore,
      href: "/explore",
    },
    {
      icon: Puzzle,
      label: data.puzzle,
      href: "/puzzle/create",
    },
    {
      label: "调度",
      href: "/cron",
      icon: Clock,
      private: true,
      root: true,
    },
    {
      label: "生成",
      href: "/generate",
      icon: Rocket,
      private: true,
      root: true,
    },
    // {
    //   icon: ChartBarStacked,
    //   label: data.categories,
    //   href: "/demo/categories-page",
    //   private: true,
    // },
    // {
    //   icon: Group,
    //   label: data.groups,
    //   href: "/demo/groups-page",
    //   private: true,
    // },
    // {
    //   icon: Tag,
    //   label: data.tags,
    //   href: "/demo/tags-page",
    //   private: true,
    // },
    // {
    //   icon: Video,
    //   label: "学习",
    //   href: "/learn",
    // },
    // {
    //   icon: MessageCircle,
    //   label: "社区",
    //   href: "/community",
    // },
  ];

  const { status } = useSession();
  useGoogleOneTapLogin({
    onSuccess: async (credentialResponse) => {
      // 使用 credential 参数，并指定 callbackUrl 避免重定向
      const result = await signIn("credentials", {
        redirect: false,
        credential: credentialResponse.credential,
        callbackUrl: window.location.href,
      });

      if (!result?.ok) {
        console.error("登录失败:", result?.error);
      }
    },
    onError: () => {
      console.log("Login Failed");
    },
    disabled: status === "authenticated" || status === "loading",
  });

  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto">
        <div className="flex items-center gap-6">
          <Link
            href={`/${locale}/explore`}
            className={cn("flex items-center space-x-2")}
          >
            <Image
              src="/logo.png"
              alt="logo"
              width={1024}
              height={1024}
              className="w-12 h-12"
            />
            <span className="text-xl font-bold whitespace-nowrap">
              {data.siteTitle}
            </span>
          </Link>

          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {navigationItems.map((item) => {
                const c = (
                  <NavigationMenuItem key={item.href}>
                    <Link
                      href={item.root ? item.href : `/${locale}${item.href}`}
                      legacyBehavior
                      passHref
                    >
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                      >
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                );

                if (item.private && !isAdmin) {
                  return null;
                }

                return c;
              })}
            </NavigationMenuList>
          </NavigationMenu>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex flex-col space-y-4 mt-6">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="hidden lg:flex items-center space-x-4 justify-center max-w-xs flex-1">
          <Input
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={data.search}
            className="w-80 transition-all duration-300"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                router.push(`/${locale}/search?q=${searchQuery}`);
              }
            }}
          />
          <Link href={`/${locale}/search?q=${searchQuery}`}>
            <Button variant="outline">
              <Search className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="transition-transform hover:scale-110"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <SignedIn>
            <Link href="/puzzle/create">
              <Button className="transition-transform hover:scale-105">
                {data.createPuzzle}
              </Button>
            </Link>
          </SignedIn>
          <LanguageSelector
            defaultLanguage={locale}
            onLanguageChange={(language) => {
              console.log(language);
            }}
          />
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
