"use client";
import { useI18n } from "@/app/[locale]/providers";

import { FC } from "react";
import Link from "next/link";

export const Footer: FC = () => {
  const { data } = useI18n();

  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-4">{data.about}</h3>
            <p className="text-sm text-muted-foreground">
              {data.siteDescription}
            </p>
          </div>
          {/* <div>
            <h3 className="font-semibold mb-4">快速链接</h3>
            <div className="space-y-2">
              <Link
                href="/about"
                className="block text-sm text-muted-foreground hover:text-primary"
              >
                关于我们
              </Link>
              <Link
                href="/contact"
                className="block text-sm text-muted-foreground hover:text-primary"
              >
                联系方式
              </Link>
              <Link
                href="/community-guidelines"
                className="block text-sm text-muted-foreground hover:text-primary"
              >
                社区规则
              </Link>
              <Link
                href="/privacy-policy"
                className="block text-sm text-muted-foreground hover:text-primary"
              >
                隐私政策
              </Link>
              <Link
                href="/cookie-preferences"
                className="block text-sm text-muted-foreground hover:text-primary"
              >
                饼干偏好
              </Link>
            </div>
          </div> */}
          <div>
            <h3 className="font-semibold mb-4">{data.contact}</h3>
            <p className="text-sm text-muted-foreground">{data.email}</p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          {data.copyright}
        </div>
      </div>
    </footer>
  );
};
