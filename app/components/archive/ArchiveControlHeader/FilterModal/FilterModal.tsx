'use client'

import { useState, useEffect } from 'react'
import { useDevMode } from '@/app/components/DevModeProvider'
import "./filter-modal-styles.css"

interface Tag {
    id: number
    name: string
    slug: string
    type: 'CHANNEL' | 'FORMAT' | 'GENRE' | 'TOPIC'
}

interface GroupedTags {
    CHANNEL: Tag[]
    FORMAT: Tag[]
    GENRE: Tag[]
    TOPIC: Tag[]
}

interface FilterModalProps {
    isOpen: boolean
    onClose: () => void
    onApply: (tagSlugs: string[]) => void
}

export default function FilterModal({ isOpen, onClose, onApply }: FilterModalProps) {
    const [openSections, setOpenSections] = useState({
        channel: true,
        format: false,
        genre: false,
        topic: true
    })

    const [tags, setTags] = useState<GroupedTags>({
        CHANNEL: [],
        FORMAT: [],
        GENRE: [],
        TOPIC: []
    })

    const [selectedTags, setSelectedTags] = useState<Set<number>>(new Set())
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await fetch('/api/tags')
                if (response.ok) {
                    const data = await response.json()
                    setTags(data)
                }
            } catch (error) {
                console.error('Error fetching tags:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchTags()
    }, [])

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }))
    }

    const toggleTag = (tagId: number) => {
        setSelectedTags(prev => {
            const newSet = new Set(prev)
            if (newSet.has(tagId)) {
                newSet.delete(tagId)
            } else {
                newSet.add(tagId)
            }
            return newSet
        })
    }

    const handleApply = () => {
        // Convert selected tag IDs to slugs
        const selectedSlugs: string[] = []
        Array.from(selectedTags).forEach(tagId => {
            const tag = Object.values(tags).flat().find(t => t.id === tagId)
            if (tag) {
                selectedSlugs.push(tag.slug)
            }
        })
        onApply(selectedSlugs)
        onClose()
    }

    const devMode = useDevMode()

    if (!isOpen) return null

    return (
        <div className={`filter-modal rounded-sm absolute top-full right-0 z-50 mt-2 ${devMode ? 'border border-red-500' : ''}`}>
            <div className={`p-4 min-w-72`}>
                <div className={`filter-modal-header mb-4 ${devMode ? 'border border-red-500' : ''}`}>
                    <h3 className={`mb-1 pb-2 ${devMode ? 'border border-red-500' : ''}`}>
                        filter tags
                    </h3>
                </div>

                <div className={`mb-4 space-y-3 ${devMode ? 'border border-red-500' : ''}`}>
                    {/* Channel Section */}
                    <div className={`mb-2 ${devMode ? 'border border-green-500' : ''}`}>
                        <div
                            className={`flex items-center gap-2 py-2 cursor-pointer ${devMode ? 'border border-blue-500' : ''}`}
                            onClick={() => toggleSection('channel')}
                        >
                            <span className={`select-none ${devMode ? 'border border-green-500' : ''}`}>channel</span>
                             <i className={`fi fi-tr-angle-${openSections.channel ? 'up' : 'down'} transform ${openSections.channel ? 'translate-y-0.25' : 'translate-y-0.75'} ${devMode ? 'border border-yellow-500' : ''}`}></i>
                        </div>
                        {openSections.channel && (
                            <div className="pl-3 mt-2 space-y-1">
                                {loading ? (
                                    <span className="text-sm">Loading...</span>
                                ) : tags.CHANNEL.length === 0 ? (
                                    <span className="text-sm">No channels</span>
                                ) : (
                                    tags.CHANNEL.map(tag => (
                                        <label key={tag.id} className="flex items-center gap-2 py-1 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="cursor-pointer"
                                                checked={selectedTags.has(tag.id)}
                                                onChange={() => toggleTag(tag.id)}
                                            />
                                            <span className="select-none">{tag.name}</span>
                                        </label>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Format Section */}
                    <div className={`mb-2 ${devMode ? 'border border-green-500' : ''}`}>
                        <div
                            className="flex items-center gap-2 py-2 cursor-pointer"
                            onClick={() => toggleSection('format')}
                        >
                            <span className="select-none">format</span>
                             <i className={`fi fi-tr-angle-${openSections.format ? 'up' : 'down'} transform ${openSections.format ? 'translate-y-0.25' : 'translate-y-0.75'}`}></i>
                        </div>
                        {openSections.format && (
                            <div className="pl-3 mt-2 space-y-1">
                                {loading ? (
                                    <span className="text-sm">Loading...</span>
                                ) : tags.FORMAT.length === 0 ? (
                                    <span className="text-sm">No formats</span>
                                ) : (
                                    tags.FORMAT.map(tag => (
                                        <label key={tag.id} className="flex items-center gap-2 py-1 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="cursor-pointer"
                                                checked={selectedTags.has(tag.id)}
                                                onChange={() => toggleTag(tag.id)}
                                            />
                                            <span className="select-none">{tag.name}</span>
                                        </label>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Genre Section */}
                    <div className={`mb-2 ${devMode ? 'border border-green-500' : ''}`}>
                        <div
                            className="flex items-center gap-2 py-2 cursor-pointer"
                            onClick={() => toggleSection('genre')}
                        >
                            <span className="select-none">genre</span>
                             <i className={`fi fi-tr-angle-${openSections.genre ? 'up' : 'down'} transform ${openSections.genre ? 'translate-y-0.25' : 'translate-y-0.75'}`}></i>
                        </div>
                        {openSections.genre && (
                            <div className="pl-3 mt-2 space-y-1">
                                {loading ? (
                                    <span className="text-sm">Loading...</span>
                                ) : tags.GENRE.length === 0 ? (
                                    <span className="text-sm">No genres</span>
                                ) : (
                                    tags.GENRE.map(tag => (
                                        <label key={tag.id} className="flex items-center gap-2 py-1 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="cursor-pointer"
                                                checked={selectedTags.has(tag.id)}
                                                onChange={() => toggleTag(tag.id)}
                                            />
                                            <span className="select-none">{tag.name}</span>
                                        </label>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Topic Section */}
                    <div className={`mb-2 ${devMode ? 'border border-green-500' : ''}`}>
                        <div
                            className="flex items-center gap-2 py-2 cursor-pointer"
                            onClick={() => toggleSection('topic')}
                        >
                            <span className="select-none">topic</span>
                             <i className={`fi fi-tr-angle-${openSections.topic ? 'up' : 'down'} transform ${openSections.topic ? 'translate-y-0.25' : 'translate-y-0.75'}`}></i>
                        </div>
                        {openSections.topic && (
                            <div className="pl-3 mt-2 space-y-1">
                                {loading ? (
                                    <span className="text-sm">Loading...</span>
                                ) : tags.TOPIC.length === 0 ? (
                                    <span className="text-sm">No topics</span>
                                ) : (
                                    tags.TOPIC.map(tag => (
                                        <label key={tag.id} className="flex items-center gap-2 py-1 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="cursor-pointer"
                                                checked={selectedTags.has(tag.id)}
                                                onChange={() => toggleTag(tag.id)}
                                            />
                                            <span className="select-none">{tag.name}</span>
                                        </label>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-3">
                    <button 
                        className="filter-modal-apply-button w-full py-2 px-4 rounded"
                        onClick={handleApply}
                    >
                        apply
                    </button>
                </div>
            </div>
        </div>
    )
}

