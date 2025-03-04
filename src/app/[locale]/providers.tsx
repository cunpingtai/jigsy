"use client";

import { ThemeProvider } from "next-themes";
import { createContext, useContext } from "react";
import { StaticData } from "@/lib/data";

export function Providers({
  children,
  locale,
  data,
  langs,
}: {
  children: React.ReactNode;
  locale: string;
  data: StaticData;
  langs: { value: string; name: string }[];
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <I18nProvider locale={locale} data={data} langs={langs}>
        {children}
      </I18nProvider>
    </ThemeProvider>
  );
}

type I18nProviderProps = {
  children: React.ReactNode;
  locale: string;
  data: StaticData;
  langs: { value: string; name: string }[];
};

const i18nContext = createContext<{
  locale: string;
  data: StaticData;
  langs: { value: string; name: string }[];
}>({
  locale: "en",
  data: {} as StaticData,
  langs: [],
});

export function I18nProvider({
  children,
  locale,
  data,
  langs,
}: I18nProviderProps) {
  return (
    <i18nContext.Provider value={{ locale, data, langs }}>
      {children}
    </i18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(i18nContext);
}
