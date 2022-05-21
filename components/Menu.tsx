import Link from "next/link";

export default function Menu() {
    return <nav className="text-lg">
        <Link href="/">
            <a className="p-2 neum interactive text-gray-500">Home</a>
        </Link>
        <Link href="#">
            <a data-tip="WIP" title="coming soon" className="p-2 neum text-gray-300"><del>Works</del></a>
        </Link>
        <Link href="/profile">
            <a className="p-2 neum interactive text-gray-500">About</a>
        </Link>
    </nav>
}