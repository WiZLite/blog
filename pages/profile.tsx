import Head from "next/head";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ProfileCard from "../components/ProfileCard";
import { ThemeSwitcherId } from "../components/ThemeSwitcher";

function ClickMe({duration}) {
    const [disappear, setDisappear] = useState(false);
    useEffect(() => {
        setTimeout(() => {
            setDisappear(true);
        }, duration * 2 / 3);
    }, []);
    return (
        <div className={`transition-opacity duration-1000 ${disappear ? "opacity-0" : ""} p-1 neum dark:text-gray-300 absolute left-0 top-12 w-52`}>
            👆 Click to switch theme
        </div>
    )
}

function useClickMe(duration) {
    useEffect(() => {
        let count =  parseInt(localStorage.getItem("clickme-showed-count"));
        if(Number.isNaN(count)) count = 0;
        if(count >= 3 && process.env.NODE_ENV !== "development") return;
        localStorage.setItem("clickme-showed-count", (count + 1).toString());

        let switcher = document.getElementById(ThemeSwitcherId);
        let clickMe = document.createElement("span");
        switcher?.appendChild(clickMe);
        ReactDOM.render(<ClickMe duration={duration}/>, clickMe);
        setTimeout(() => {
            ReactDOM.unmountComponentAtNode(clickMe);
            clickMe.remove();
        }, duration);
    },[]);
}

export default function Profile() {
    useClickMe(5000);
    return <>
        <Head>
            <title>Profile</title>
        </Head>
        <Header/>
        <div>
            <ProfileCard/>
        </div>
        <Footer/>
    </>
}