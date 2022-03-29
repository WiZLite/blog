import { atom, useAtom } from 'jotai'
import { AppProps } from 'next/app'
import { useEffect } from 'react';
import '../styles/globals.scss'
import "core-js/features/string/replace-all"

function getTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const theme = localStorage.getItem("theme");
  if (theme === "light" || theme === "dark") {
    return theme;
  }
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return "dark";
}

export const themeAtom = atom("light");

function MyApp({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useAtom(themeAtom);

  useEffect(() => {
    setTheme(getTheme())
  }, [setTheme]);

  useEffect(() => {
    if (theme) {
      if (document.documentElement.classList.contains("light")) document.documentElement.classList.remove("light");
      if (document.documentElement.classList.contains("dark")) document.documentElement.classList.remove("dark");
      document.documentElement.classList.add(theme);
      localStorage.setItem("theme", theme);
    }
  }, [theme])
  return <Component {...pageProps} />
}

export default MyApp
