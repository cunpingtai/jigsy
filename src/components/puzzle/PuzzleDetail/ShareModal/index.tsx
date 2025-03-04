import { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Copy, Link as LinkIcon } from "lucide-react";
import { useI18n } from "@/app/[locale]/providers";
import { toast } from "sonner";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  puzzleId: string;
  locale: string;
}

export const ShareModal: FC<ShareModalProps> = ({
  open,
  onClose,
  puzzleId,
  locale,
}) => {
  const { data } = useI18n();
  const [copied, setCopied] = useState({
    link: false,
    embed: false,
  });

  // 获取当前页面链接
  const pageUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${locale}/puzzle/${puzzleId}`
      : `/${locale}/puzzle/${puzzleId}`;

  // 获取嵌入链接
  const embedCode = `<iframe src="${
    typeof window !== "undefined" ? window.location.origin : ""
  }/${locale}/puzzle/${puzzleId}/embed" width="100%" height="500" frameborder="0" allowfullscreen></iframe>`;

  // 复制链接函数
  const copyToClipboard = async (text: string, type: "link" | "embed") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied({ ...copied, [type]: true });
      toast.success(data.copySuccess);

      // 3秒后重置复制状态
      setTimeout(() => {
        setCopied({ ...copied, [type]: false });
      }, 3000);
    } catch (err) {
      console.error("复制失败:", err);
      toast.error(data.copyFailed);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{data.sharePuzzle}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full mt-4">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="link">{data.shareLink}</TabsTrigger>
            {/* <TabsTrigger value="embed">{data.embedCode}</TabsTrigger> */}
          </TabsList>

          <TabsContent value="link" className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={pageUrl} readOnly className="pl-9" />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(pageUrl, "link")}
              >
                {copied.link ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {data.shareLinkDescription}
            </p>
          </TabsContent>

          <TabsContent value="embed" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input value={embedCode} readOnly />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(embedCode, "embed")}
              >
                {copied.embed ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {data.embedDescription}
            </p>
            <div className="border rounded-md p-4 bg-muted/30">
              <p className="text-sm font-medium mb-2">{data.previewEmbed}</p>
              <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">
                  {data.embedPreviewPlaceholder}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
