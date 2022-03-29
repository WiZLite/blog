import Script from "next/script"

export default function TwitterWidget() {
    return (
        <div>
            <Script src="https://platform.twitter.com/widgets.js" />
            <div className="neum h-80 overflow-y-scroll rounded-lg mt-4">
                <a className="twitter-timeline" href="https://twitter.com/wizlightyear?ref_src=twsrc%5Etfw">Tweets by wizlightyear</a>
            </div>
            <div className="p-4 flex justify-center">
                <a href="https://twitter.com/wizlightyear?ref_src=twsrc%5Etfw" className="twitter-follow-button" data-size="large" data-lang="en" data-show-count="false">Follow @wizlightyear</a>
            </div>
        </div>
    )
}