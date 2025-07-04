/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Medal } from "lucide-react";
import { Button } from "./_components/ui/Button";
import { LoginIcon } from "./_icons/LoginIcon";
import { BrainIcon } from "./_icons/BrainIcon";

export default function Home() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            router.push("/dashboard");
        } else {
            setLoading(false);
        }
    }, []);

    if (loading) return null;

    return (
        <div className="h-screen pt-40 pb-20 bg-slate-100 select-none">
            <div className="fixed top-0 w-full h-14 px-4 border-b shadow-sm bg-white flex items-center">
                <div className="md:max-w-screen-2xl mx-auto flex items-center w-full justify-between">
                    <div className="flex justify-center items-center gap-2 cursor-pointer">
                        <BrainIcon className="w-5" />
                        <span className="text-black font-bold">duobrain</span>
                    </div>
                    <Button
                        onClick={() => router.push("/auth/login")}
                        startIcon={<LoginIcon size="sm" />}
                        variant="black"
                        size="sm"
                        text="Login"
                    />
                </div>
            </div>
            <div className="flex flex-col items-center justify-center">
                <div className="flex items-center justify-center flex-col">
                    <div className="mb-4 flex items-center border shadow-sm p-4 bg-secondaryBtn-hover text-primaryBtn-hover rounded-full">
                        <Medal className="h-6 w-6 mr-2" />
                        <h1>Welcome to&nbsp;<span className="font-bold">duobrain</span></h1>
                    </div>
                    <h1 className="text-3xl md:text-6xl text-center text-neutral-800 mb-6">
                        <span className="font-bold text-primaryBtn-hover">duobrain</span>
                        &nbsp;helps you be organised
                    </h1>
                    <div className="text-3xl md:text-6xl bg-gradient-to-r from-fuchsia-600 to-blue-600 text-white px-4 py-2 rounded-md pb-4 w-fit">
                        Store and Forget.
                    </div>
                </div>
                <div className="text-sm md:text-xl text-neutral-400 mt-4 max-w-xs md:max-w-2xl text-center mx-auto mb-6">
                    Store your contents, memories, links, videos and other stuff. Manage and Find your stuff efficiently and fast with advanced AI integrations.
                </div>
                <Button
                    onClick={() => router.push("/auth/login")}
                    startIcon={<LoginIcon size="md" />}
                    variant="black"
                    size="crumb"
                    text="Get duobrain for free"
                />
            </div>
        </div>
    );
}
