"use client";

import { ThemeProvider } from "next-themes";
import { createContext, useContext } from "react";

export function Providers({
  children,
  locale,
  data,
}: {
  children: React.ReactNode;
  locale: string;
  data: Record<string, any>;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <I18nProvider locale={locale} data={data}>
        {children}
      </I18nProvider>
    </ThemeProvider>
  );
}

type I18nProviderProps = {
  children: React.ReactNode;
  locale: string;
  data: Record<string, string>;
};

const i18nContext = createContext<{
  locale: string;
  data: Record<string, string>;
}>({
  locale: "en",
  data: {},
});

export function I18nProvider({ children, locale, data }: I18nProviderProps) {
  return (
    <i18nContext.Provider value={{ locale, data }}>
      {children}
    </i18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(i18nContext);
}
