import { memo } from "react"

function FacebookIconInternal(props) {
    return <svg className="fill-gray" viewBox="0 0 27 27" width="28" height="28" {...props}>
        <path
            d="M13.5 1.7C7 1.7 1.7 7.1 1.7 13.6c0 5.9 4.4 10.7 10 11.7v-8.2h-3V13.7h2.9v-2.6c0-2.9 1.9-4.6 4.5-4.6 1.4 0 2.6.2 2.6.2v.1h.1v2.9h-1.5c-1.5 0-2 1-2 1.9v2.1h3.2l-.5 3.2h-2.6v8.2c5.7-.9 10-5.7 10-11.6C25.3 7.1 20 1.7 13.5 1.7z">
        </path>
    </svg>
}

const FacebookIcon = memo(FacebookIconInternal);
FacebookIcon.displayName = "TwitterIcon"
export default FacebookIcon as typeof FacebookIconInternal