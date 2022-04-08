import { useAtom } from "jotai"
import { themeAtom } from "../pages/_app"
import GithubIcon from "./icons/GithubIcon";
import TwitterIcon from "./icons/TwitterIcon";
import Menu from "./Menu";

export default function Footer() {
    const [theme] = useAtom(themeAtom);
    return (
        <>
            <hr className="border-none mt-4" />
            <footer className="p-4">
                {/* <div className="flex justify-center my-4"></div> */}
                <div className="mx-auto flex justify-center">
                    <span className="m-2">
                        <Menu/>
                    </span>
                    <a
                        href="https://twitter.com/wizlightyear"
                        className="neum-sm interactive w-12 h-12 rounded-full p-3 mx-2">
                        <TwitterIcon className="fill-gray-400" />
                    </a>
                    <a
                        href="https://github.com/WiZLite"
                        className="neum-sm interactive w-12 h-12 rounded-full p-3 mx-2">
                        <GithubIcon className="fill-gray-400" />
                    </a>
                </div>
                <p className="text-sm text-gray-500 text-center mt-2 leading-7">
                    Neuromancy by WiZLite<a className="text-blue-500" href="mailto:black_rais0n.detre@icloud.com">{"<black_rais0n.detre@icloud.com>"}</a><br/>
                    © 2022-Present
                </p>
            </footer>
        </>
    )
}