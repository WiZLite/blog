import { useEffect, useMemo, useState } from "react"
import { getUrlHash } from "../helpers";

export default function TableOfContents() {
    const [hs, setHs] = useState([]);
    const [top, setTop] = useState(null);
    useEffect(() => {
        setHs([...document.querySelector(".markdown")
            .querySelectorAll<HTMLHeadingElement>("h1, h2, h3")])
    }, []);
    useEffect(() => {
        window.addEventListener("scroll", e => {
            setTop(hs.find(x => x.getBoundingClientRect().top > 0))
        });
    }, [hs])

    const getListClass = (h: HTMLHeadingElement) => {
        let ret = "block font-medium py-2 border last:rounded-b-lg border-gray-200 dark:border-gray-800";
        switch (h.tagName) {
            case "H1": ret += " text-lg pl-1"; break;
            case "H2": ret += " text-md pl-2"; break;
            case "H3": ret += " text-sm pl-4"; break;
        }
        if (h === top) {
            ret += " border-0 pl-1 neum-inset";
        } else {
            ret += " neum interactive flat";
        }

        return ret;
    }

    return <div className="rounded-lg neum p-4 text-gray-500 dark:text-gray-300">
        <p className="text-lg text-center mb-1 text-gray-500">Table of Contents</p>
        <div>
            {hs.map((h, index) => (
                <a key={index}
                    href={getUrlHash(h.textContent)}
                    className={getListClass(h)}>
                    {h.textContent}
                </a>
            ))}
        </div>
    </div>
}