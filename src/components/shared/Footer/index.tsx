import { FC } from "react";
import Link from "next/link";

export const Footer: FC = () => {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-4">关于我们</h3>
            <p className="text-sm text-muted-foreground">
              拼图挑战是一个充满乐趣的在线拼图社区，让我们一起享受拼图的乐趣。
            </p>
          </div>
          <div>
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
          </div>
          <div>
            <h3 className="font-semibold mb-4">联系我们</h3>
            <p className="text-sm text-muted-foreground">
              邮箱：contact@puzzlechallenge.com
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © 2024 拼图挑战. 保留所有权利.
        </div>
      </div>
    </footer>
  );
};
