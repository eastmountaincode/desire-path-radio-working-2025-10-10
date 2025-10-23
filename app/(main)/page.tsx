"use client"

import React from "react"
import { useDevMode } from "../components/DevModeProvider"
import HomeHero from "../components/home/HomeHero/HomeHero"
import HomeLiveRadio from "../components/home/HomeLiveRadio/HomeLiveRadio"
import HomeComingUp from "../components/home/HomeComingUp/HomeComingUp"
import HomeHighlights from "../components/home/HomeHighlights/HomeHighlights"

export default function Home() {
    const devMode = useDevMode()

    return (
        <div className={`min-h-screen gap-8 flex flex-col ${devMode ? 'border border-red-500' : ''}`}>
            <HomeHero />
            <HomeLiveRadio />
            <HomeComingUp />
            <HomeHighlights />
        </div>
    );
}

