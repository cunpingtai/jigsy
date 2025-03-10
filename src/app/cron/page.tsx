import { SchedulerControl } from "@/components/shared/SchedulerControl";
import { Toaster } from "@/components/ui/sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SessionProvider } from "../[locale]/SessionProvider";
import { Metadata } from "next";
import { getCurrentUser } from "../api/util";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Cron",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CronPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return redirect("/");
  }

  return (
    <html suppressHydrationWarning={true}>
      <meta charSet="utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no"
      />
      <body className={`gradient-bg antialiased`}>
        <GoogleOAuthProvider clientId={process.env.GOOGLE_CLIENT_ID || ""}>
          <SessionProvider>
            <SchedulerControl />
          </SessionProvider>
        </GoogleOAuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
