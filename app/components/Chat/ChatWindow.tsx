'use client'

import { useState } from 'react'
import { useChat } from './ChatProvider'
import { useDevMode } from '../DevModeProvider'
import { MAX_SCREEN_NAME_LENGTH } from '@/lib/constants'
import MessageList from './MessageList'
import ScreenNamePrompt from './ScreenNamePrompt'
import './chat-styles.css'

export default function ChatWindow() {
    const { screenName, setScreenName, activeChannel, switchChannel, closeChat } = useChat()
    const devMode = useDevMode()
    const [showSettings, setShowSettings] = useState(false)
    const [newScreenName, setNewScreenName] = useState('')
    const [error, setError] = useState('')

    return (
        <div className={`chat-window fixed bottom-[44px] right-0 w-[440px] h-[65vh] border-t border-l z-40 flex flex-col max-md:w-full max-md:left-0 max-md:h-[65vh] max-md:border-r ${devMode ? 'border border-red-500' : ''}`}>
            {screenName ? (
                <>
                    <div className={`chat-header flex border-b ${devMode ? 'border border-orange-500' : ''}`}>
                        <button
                            className={`channel-toggle-button group flex-1 py-3 px-4 cursor-pointer ${activeChannel === 'channel1' && !showSettings ? 'active' : ''
                                } ${devMode ? 'border border-purple-500' : ''}`}
                            onClick={() => {
                                switchChannel('channel1')
                                setShowSettings(false)
                            }}
                        >
                            <span className={activeChannel === 'channel1' && !showSettings ? '' : 'invisible group-hover:visible'}>[</span>channel 1<span className={activeChannel === 'channel1' && !showSettings ? '' : 'invisible group-hover:visible'}>]</span>
                        </button>
                        <button
                            className={`channel-toggle-button group flex-1 py-3 px-4 cursor-pointer ${activeChannel === 'channel2' && !showSettings ? 'active' : ''
                                } ${devMode ? 'border border-pink-500' : ''}`}
                            onClick={() => {
                                switchChannel('channel2')
                                setShowSettings(false)
                            }}
                        >
                            <span className={activeChannel === 'channel2' && !showSettings ? '' : 'invisible group-hover:visible'}>[</span>channel 2<span className={activeChannel === 'channel2' && !showSettings ? '' : 'invisible group-hover:visible'}>]</span>
                        </button>
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className={`chat-settings-button cursor-pointer flex items-center justify-center aspect-square h-full ${showSettings ? 'active' : ''} ${devMode ? 'border border-yellow-500' : ''}`}
                            aria-label="Chat settings"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className={`w-5 h-5 ${devMode ? 'border border-green-500' : ''}`}
                            >
                                <path d="M21.234,14.174l-.445-.274c.14-.64,.211-1.277,.211-1.899s-.071-1.26-.211-1.899l.445-.274c.682-.421,1.16-1.082,1.344-1.862,.185-.779,.054-1.585-.367-2.267-.869-1.407-2.72-1.845-4.128-.978l-.445,.275c-.801-.647-1.685-1.145-2.638-1.481v-.514c0-1.654-1.346-3-3-3s-3,1.346-3,3v.514c-.953,.337-1.837,.834-2.638,1.481l-.445-.275c-1.409-.867-3.26-.43-4.128,.978-.421,.682-.551,1.487-.367,2.267,.185,.78,.662,1.441,1.344,1.862l.445,.274c-.14,.64-.211,1.277-.211,1.899s.071,1.26,.211,1.899l-.445,.274c-.682,.421-1.16,1.082-1.344,1.862-.185,.779-.054,1.585,.367,2.267,.868,1.407,2.721,1.845,4.128,.978l.445-.275c.801,.647,1.685,1.145,2.638,1.481v.514c0,1.654,1.346,3,3,3s3-1.346,3-3v-.514c.953-.337,1.837-.834,2.638-1.481l.445,.275c1.41,.867,3.26,.43,4.128-.978,.421-.682,.551-1.487,.367-2.267-.185-.78-.662-1.441-1.344-1.862Zm.126,3.604c-.58,.938-1.815,1.232-2.752,.651l-.753-.465c-.187-.114-.427-.095-.592,.05-.862,.756-1.841,1.305-2.91,1.634-.21,.064-.353,.258-.353,.478v.875c0,1.103-.897,2-2,2s-2-.897-2-2v-.875c0-.22-.143-.413-.353-.478-1.069-.329-2.048-.878-2.91-1.634-.094-.082-.211-.124-.33-.124-.091,0-.182,.024-.263,.074l-.753,.465c-.938,.581-2.173,.287-2.752-.651-.28-.454-.367-.991-.244-1.511,.123-.521,.441-.961,.896-1.241l.753-.465c.187-.115,.276-.339,.221-.552-.176-.679-.265-1.354-.265-2.009s.089-1.33,.265-2.009c.055-.213-.035-.437-.221-.552l-.753-.465c-.455-.28-.772-.721-.896-1.241-.123-.52-.036-1.057,.244-1.511,.58-.939,1.814-1.232,2.752-.651l.753,.465c.187,.114,.426,.095,.592-.05,.862-.756,1.841-1.305,2.91-1.634,.21-.064,.353-.258,.353-.478v-.875c0-1.103,.897-2,2-2s2,.897,2,2v.875c0,.22,.143,.413,.353,.478,1.069,.329,2.048,.878,2.91,1.634,.166,.145,.406,.164,.592,.05l.753-.465c.938-.581,2.172-.288,2.752,.651,.28,.454,.367,.991,.244,1.511-.123,.521-.441,.961-.896,1.241l-.753,.465c-.187,.115-.276,.339-.221,.552,.176,.679,.265,1.354,.265,2.009s-.089,1.33-.265,2.009c-.055,.213,.035,.437,.221,.552l.753,.465c.455,.28,.772,.721,.896,1.241,.123,.52,.036,1.057-.244,1.511ZM12,8c-2.206,0-4,1.794-4,4s1.794,4,4,4,4-1.794,4-4-1.794-4-4-4Zm0,7c-1.654,0-3-1.346-3-3s1.346-3,3-3,3,1.346,3,3-1.346,3-3,3Z" />
                            </svg>
                        </button>
                        <button
                            onClick={closeChat}
                            className={`cursor-pointer flex items-center justify-center aspect-square h-full border-l hover:opacity-70 ${devMode ? 'border border-cyan-500' : ''}`}
                            aria-label="Close chat"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                                <path d="M17.854,17.146c.195,.195,.195,.512,0,.707-.098,.098-.226,.146-.354,.146s-.256-.049-.354-.146l-5.146-5.146-5.146,5.146c-.098,.098-.226,.146-.354,.146s-.256-.049-.354-.146c-.195-.195-.195-.512,0-.707l5.146-5.146L6.146,6.854c-.195-.195-.195-.512,0-.707s.512-.195,.707,0l5.146,5.146,5.146-5.146c.195-.195,.512-.195,.707,0s.195,.512,0,.707l-5.146,5.146,5.146,5.146Z"/>
                            </svg>
                        </button>
                    </div>
                    {showSettings ? (
                        <div className={`chat-settings-content flex-1 p-6 flex flex-col gap-2 justify-center ${devMode ? 'border border-indigo-500' : ''}`}>
                            <h3 className={`chat-settings-title m-0 flex items-center gap-2 ${devMode ? 'border border-violet-500' : ''}`}>
                                <i className="fi fi-tr-circle-user text-sm translate-y-[2px]"></i>
                                <span>change screen name</span>
                            </h3>
                            <div className={`chat-settings-current mb-4 ${devMode ? 'border border-fuchsia-500' : ''}`}>
                                <span className="font-bold">current:</span> {screenName}
                            </div>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    const trimmed = newScreenName.trim()

                                    if (!trimmed) {
                                        setError('Please enter a screen name')
                                        return
                                    }

                                    if (trimmed.length > MAX_SCREEN_NAME_LENGTH) {
                                        setError(`Screen name must be ${MAX_SCREEN_NAME_LENGTH} characters or less`)
                                        return
                                    }

                                    setScreenName(trimmed)
                                    setNewScreenName('')
                                    setError('')
                                    setShowSettings(false)
                                }}
                                className={`flex flex-col gap-4 ${devMode ? 'border border-sky-500' : ''}`}
                            >
                                <input
                                    type="text"
                                    value={newScreenName}
                                    onChange={(e) => {
                                        setNewScreenName(e.target.value)
                                        if (error) setError('')
                                    }}
                                    placeholder="enter new name..."
                                    maxLength={MAX_SCREEN_NAME_LENGTH}
                                    className={`screen-name-input p-3 border outline-none ${devMode ? 'border border-emerald-500' : ''}`}
                                />
                                {error && (
                                    <div className="text-xs text-red-600 text-center">
                                        {error}
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className={`screen-name-submit flex-1 text-sm py-2 px-4 border cursor-pointer hover:opacity-90 disabled:cursor-not-allowed ${devMode ? 'border border-teal-500' : ''}`}
                                        disabled={!newScreenName.trim()}
                                    >
                                        save
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowSettings(false)
                                            setNewScreenName('')
                                            setError('')
                                        }}
                                        className={`flex-1 text-sm py-2 px-4 border cursor-pointer hover:opacity-90 ${devMode ? 'border border-amber-500' : ''}`}
                                    >
                                        cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <MessageList />
                    )}
                </>
            ) : (
                <ScreenNamePrompt />
            )}
        </div>
    )
}
