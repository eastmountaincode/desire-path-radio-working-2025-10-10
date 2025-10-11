"use client"

import React from "react"

import { useDevMode } from "../components/DevModeProvider"

export default function Home() {
    const devMode = useDevMode()

    return (
        <div className={devMode ? 'border border-red-500' : ''}>
            <h1>Hello World</h1>
        </div>
    );
}

