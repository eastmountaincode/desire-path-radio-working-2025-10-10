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
    const [ch1State, setCh1State] = useState<ChannelState>('live')
    const [ch2State, setCh2State] = useState<ChannelState>('live')

    // Station slugs for Evenings.fm API
    const ch1StationSlug = 'desire-path-radio-test-ab'
    const ch2StationSlug = 'desire-path-radio-channel-2'

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
                {showToggles && (
                    <div className={`mb-4 flex gap-4 ${devMode ? 'border border-red-500' : ''}`}>
                        <LiveChannelToggle
                            state={ch1State}
                            onToggle={() => setCh1State(cycleState(ch1State))}
                        />
                        <LiveChannelToggle
                            state={ch2State}
                            onToggle={() => setCh2State(cycleState(ch2State))}
                        />
                    </div>
                )}

                {/* Two channel grid */}
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${devMode ? 'border border-red-500' : ''}`}>
                    <LiveChannel
                        channelNumber="ch1"
                        channelType="music"
                        devState={ch1State}
                        stationSlug={ch1StationSlug}
                    />
                    <LiveChannel
                        channelNumber="ch2"
                        channelType="talks"
                        devState={ch2State}
                        stationSlug={ch2StationSlug}
                    />
                </div>
            </div>
        </section>
    )
}

