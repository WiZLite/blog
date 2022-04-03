import Head from "next/head";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ProfileCard from "../components/ProfileCard";

export default function Profile() {
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