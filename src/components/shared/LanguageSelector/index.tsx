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
import {
  US,
  JP,
  DE,
  FR,
  CN,
  ES,
  IT,
  PT,
  RU,
  KR,
} from "country-flag-icons/react/3x2";
import Link from "next/link";

// 语言选项类型定义
export interface Language {
  code: string;
  name: string;
  flag: FC<{ className?: string }>;
  region?: string;
}

// 支持的语言列表
export const languages: Language[] = [
  { code: "zh", name: "简体中文", flag: CN },
  { code: "en", name: "English", flag: US },
  { code: "ja", name: "日本語", flag: JP },
  { code: "de", name: "Deutsch", flag: DE },
  { code: "fr", name: "Français", flag: FR },
  { code: "es", name: "Español", flag: ES },
  { code: "it", name: "Italiano", flag: IT },
  { code: "pt", name: "Português", flag: PT },
  { code: "ru", name: "Русский", flag: RU },
  { code: "ko", name: "한국어", flag: KR },
];

interface LanguageSelectorProps {
  className?: string;
  defaultLanguage?: string;
  onLanguageChange?: (language: Language) => void;
}

export const LanguageSelector: FC<LanguageSelectorProps> = ({
  className,
  defaultLanguage = "zh",
  onLanguageChange,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    languages.find((lang) => lang.code === defaultLanguage) || languages[0]
  );

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
    onLanguageChange?.(language);
  };

  const FlagIcon = selectedLanguage.flag;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("flex items-center gap-2 h-9 px-3", className)}
        >
          <FlagIcon className="h-4 w-6" />
          <span className="text-sm font-medium">{selectedLanguage.name}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {languages.map((language) => {
          const Flag = language.flag;
          return (
            <DropdownMenuItem
              key={language.code}
              // onClick={() => handleLanguageSelect(language)}
            >
              <Link
                className="flex items-center gap-2 py-2 px-3 cursor-pointer"
                href={`/${language.code}/explore`}
              >
                <Flag className="h-4 w-6" />
                <span className="flex-1 text-sm">{language.name}</span>
                {language.code === selectedLanguage.code && (
                  <Check className="h-4 w-4" />
                )}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
