"use client";
import { FC } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Moon,
  Sun,
  Home,
  Trophy,
  Search,
  Puzzle,
  Menu,
  Video,
  MessageCircle,
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

const navigationItems = [
  {
    icon: Home,
    label: "首页",
    href: "/",
  },
  {
    icon: Trophy,
    label: "排行榜",
    href: "/leaderboard",
  },
  {
    icon: Search,
    label: "发现",
    href: "/explore",
  },
  {
    icon: Puzzle,
    label: "拼图编辑器",
    href: "/puzzle/create",
  },
  {
    icon: Video,
    label: "学习",
    href: "/learn",
  },
  {
    icon: MessageCircle,
    label: "社区",
    href: "/community",
  },
];

export const Header: FC = () => {
  const { theme, setTheme } = useTheme();

  // 模拟用户数据，实际应该从用户认证系统获取
  const user = {
    name: "张三",
    email: "zhangsan@example.com",
    avatar: "https://github.com/shadcn.png",
  };

  const handleSignOut = () => {
    // 处理退出登录逻辑
    console.log("用户退出登录");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold whitespace-nowrap">
              拼图挑战
            </span>
          </Link>

          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <Link href={item.href} legacyBehavior passHref>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
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

        <div className="hidden lg:flex items-center space-x-4 justify-center max-w-sm flex-1">
          <Input
            placeholder="搜索拼图..."
            className="focus:w-full w-36 transition-all duration-300"
          />
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
          <Button className="transition-transform hover:scale-105">
            创建拼图
          </Button>
          <UserMenu user={user} onSignOut={handleSignOut} />
        </div>
      </div>
    </header>
  );
};
