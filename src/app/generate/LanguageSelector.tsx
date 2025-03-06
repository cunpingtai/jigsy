import { FC, useState } from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { data } from "@/data";

export interface LanguageSelectorProps {
  className?: string;
  onChange?: (language: keyof typeof data) => void;
  defaultLanguage?: keyof typeof data;
}

type LanguageCode = keyof typeof data;

const languageNames: Record<LanguageCode, string> = {
  de: "德语",
  en: "英语",
  ru: "俄语",
  zh: "中文",
  es: "西班牙语",
  fr: "法语",
  it: "意大利语",
  ja: "日语",
  ko: "韩语",
  pt: "葡萄牙语",
};

export const LanguageSelector: FC<LanguageSelectorProps> = ({
  className,
  onChange,
  defaultLanguage = "zh",
}) => {
  const [selectedLanguage, setSelectedLanguage] =
    useState<LanguageCode>(defaultLanguage);

  const handleLanguageChange = (language: LanguageCode) => {
    setSelectedLanguage(language);
    onChange?.(language);
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <span className="text-sm font-medium">语言:</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            {languageNames[selectedLanguage]}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          {Object.keys(data).map((lang) => (
            <DropdownMenuItem
              key={lang}
              className="flex items-center justify-between"
              onClick={() => handleLanguageChange(lang as LanguageCode)}
            >
              {languageNames[lang as LanguageCode]}
              {selectedLanguage === lang && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
