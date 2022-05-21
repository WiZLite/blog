import { useAtom } from "jotai"
import Image from "next/image"
import { useEffect } from "react"
import { themeAtom } from "../pages/_app"

const skills: [name: string, icon?: string][] = [
["C#", "/brandIcons/csharp.png"], ["Blazor(ASP.NET Core)", "/brandIcons/blazor.png"], ["Unity", "/brandIcons/unity.webp"], 
["React", "/brandIcons/react-icon.png"], ["Typescript", "/brandIcons/typescript.png"], ["GraphQL", "/brandIcons/graphql.png"], 
["Hasura", "/brandIcons/hasura.webp"], ["NodeJS", "/brandIcons/nodejs.png"], ["HTML", "/brandIcons/html.png"], 
["CSS", "/brandIcons/css.webp"], ["Clojure", "/brandIcons/clojure.png"]]

const interests = ["Graphic", "WebGPU", "Shader", "WASM", "Parsing", "LLVM", "SFX", "VFX", "Sound", "Synth", "3DMotion", "3DModel", "Library"]

export default function ProfileCard() {
    const [theme] = useAtom(themeAtom);
    const light = theme === "light";
    return (
        <div className='m-20 p-8 neum'>
            <h1 className='mb-3'>
                {light ? "松尾 弥玖人 (Mikuto Matsuo)" : "WiZLite"}
            </h1>
            <h3 className="mb-2">
                {light ? "Software Engineer" : "A Programmer / Creator"}</h3>
            <h3 className='mb-2'>
                <div className='align-middle break-normal'>
                    {light ? "Skills:" : "Interested in"}
                </div>
                {light ? <ul className='inline'>
                    {skills.map(([name, url]) => (
                        <li key={name} className='group relative neum-sm inline-block align-middle w-10 h-10 p-1 m-1'>
                            <Image alt={name} src={url} width="100%" height="100%" className="align-middle" />
                            <span className="hidden group-hover:inline absolute -bottom-full -left-1 text-sm p-1 bg-white dark:bg-black dark:text-white shadow">
                                {name}
                            </span>
                        </li>
                    ))}
                </ul> : <ul className="inline">
                    {interests.map((interest, index) => (
                        <li className="neum-sm inline text-sm p-2 m-1"
                            key={index}>{interest}</li>
                    ))}
                </ul>}
            </h3>
        </div>)
}