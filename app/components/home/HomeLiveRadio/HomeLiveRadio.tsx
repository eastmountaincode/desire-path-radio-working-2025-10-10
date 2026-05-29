'use client'

import { useState } from 'react'
import { useDevMode } from '../../DevModeProvider'
import { useLiveChannelToggle } from '../../LiveChannelToggleProvider'
import LiveChannel from './LiveChannel'
import LiveChannelToggle, { type ChannelState } from './LiveChannelToggle'
import './home-live-radio-styles.css'

export default function HomeLiveRadio() {
    const devMode = useDevMode()
    const { showToggles } = useLiveChannelToggle()
    const [liveState, setLiveState] = useState<ChannelState>('live')

    // Station slug for Evenings.fm API
    const stationSlug = 'desire-path-radio'

    // Cycle through states: offline -> live -> mock -> offline
    const cycleState = (currentState: ChannelState): ChannelState => {
        switch (currentState) {
            case 'offline':
                return 'live'
            case 'live':
                return 'mock'
            case 'mock':
                return 'offline'
        }
    }

    return (
        <section className={`${devMode ? 'border border-yellow-500' : ''}`}>
            <div className={`${devMode ? 'border border-blue-500' : ''}`}>
                <h2 className="mb-6 text-3xl font-[family-name:var(--font-monument-wide)]">On-Air</h2>

                {showToggles && (
                    <div className={`mb-4 flex gap-4 ${devMode ? 'border border-red-500' : ''}`}>
                        <LiveChannelToggle
                            state={liveState}
                            onToggle={() => setLiveState(cycleState(liveState))}
                        />
                    </div>
                )}

                <div className={`${devMode ? 'border border-red-500' : ''}`}>
                    <LiveChannel
                        devState={liveState}
                        stationSlug={stationSlug}
                    />
                </div>
            </div>
        </section>
    )
}
