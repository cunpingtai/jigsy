"use client";

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
import { useI18n } from "@/app/[locale]/providers";

// 语言选项类型定义
export interface Language {
  value: string;
  name: string;
}

// 支持的语言列表
// export const languages: Language[] = [
//   { code: "zh", name: "简体中文", flag: CN },
//   { code: "en", name: "English", flag: US },
//   { code: "ja", name: "日本語", flag: JP },
//   { code: "de", name: "Deutsch", flag: DE },
//   { code: "fr", name: "Français", flag: FR },
//   { code: "es", name: "Español", flag: ES },
//   { code: "it", name: "Italiano", flag: IT },
//   { code: "pt", name: "Português", flag: PT },
//   { code: "ru", name: "Русский", flag: RU },
//   { code: "ko", name: "한국어", flag: KR },
// ];

const getLangIcon = (code: string) => {
  const flag = {
    zh: CN,
    "zh-CN": CN,
    "zh-TW": CN,
    "zh-HK": CN,
    en: US,
    "en-US": US,
    "en-GB": US,
    ja: JP,
    "ja-JP": JP,
    de: DE,
    "de-DE": DE,
    fr: FR,
    "fr-FR": FR,
    es: ES,
    "es-ES": ES,
    it: IT,
    "it-IT": IT,
    pt: PT,
    "pt-PT": PT,
    ru: RU,
    "ru-RU": RU,
    ko: KR,
    "ko-KR": KR,
  }[code];

  return flag || US;
};

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
  const { langs } = useI18n();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    langs.find((lang) => lang.value === defaultLanguage) || langs[0]
  );

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
    onLanguageChange?.(language);
  };

  const FlagIcon = getLangIcon(selectedLanguage.value);

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
      <DropdownMenuContent align="end" className="w-[160px]">
        {langs.map((language) => {
          const Flag = getLangIcon(language.value);
          return (
            <DropdownMenuItem
              className="w-full"
              key={language.value}
              // onClick={() => handleLanguageSelect(language)}
            >
              <Link
                className="w-full flex items-center gap-2 cursor-pointer"
                href={`/${language.value}/explore`}
              >
                <Flag className="h-4 w-6" />
                <span className="flex-1 text-sm">{language.name}</span>
                {language.value === selectedLanguage.value && (
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
