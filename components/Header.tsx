import { useAtom } from "jotai"
import Link from "next/link";
import { themeAtom } from "../pages/_app"
import Menu from "./Menu";
import ThemeSwitcher from "./ThemeSwitcher";

export default function Header() {
    return <header className="text-center">
        <div className="mx-auto flex justify-center">
            <Link href="/">
                <a className="cursor-pointer">
                    <h1 className="text-5xl xs:text-4xl font-bold m-8 text-gray-400 dark:text-gray-500 mx-auto">Neuromancy</h1>
                </a>
            </Link>
        </div>
        <div className="xs:hidden absolute right-7 top-7">
            <Menu />
        </div>
        <span className="absolute xs:left-3 xs:top-3 left-7 top-7">
            <ThemeSwitcher />
        </span>
    </header>
}