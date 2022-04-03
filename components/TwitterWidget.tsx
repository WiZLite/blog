import Script from "next/script"
import { useEffect } from "react";

export default function TwitterWidget() {
    useEffect(() => {
        // scriptを読み込み
        const script = document.createElement('script');
        script.src = "https://platform.twitter.com/widgets.js";
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        }
    }, [])

    return (
        <div>
            {/* <Script src="https://platform.twitter.com/widgets.js" strategy="lazyOnload" /> */}
            <div className="neum h-72 overflow-y-scroll rounded-lg mt-4">
                <a className="twitter-timeline" href="https://twitter.com/wizlightyear?ref_src=twsrc%5Etfw">Tweets by wizlightyear</a>
            </div>
            <div className="p-4 flex justify-center">
                <a href="https://twitter.com/wizlightyear?ref_src=twsrc%5Etfw" className="twitter-follow-button" data-size="large" data-lang="en" data-show-count="false">Follow @wizlightyear</a>
            </div>
        </div>
    )
}