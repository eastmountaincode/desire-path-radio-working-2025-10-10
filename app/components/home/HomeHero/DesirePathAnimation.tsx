'use client'

import { motion } from 'framer-motion'
import { useDevMode } from '../../DevModeProvider'
import { useLiveChannelToggle } from '../../LiveChannelToggleProvider'
import { useState, useEffect, useMemo } from 'react'
import './desire-path-animation-styles.css'

// Generate a long continuous path with random Y values
function generatePathPoints(numPoints: number, width: number, height: number) {
    const rawPoints: number[] = []

    // First generate raw random Y values
    for (let i = 0; i < numPoints; i++) {
        rawPoints.push(Math.random())
    }

    // Smooth the Y values using a moving average for gentler curves
    // Smaller window = more variation, larger window = smoother but flatter
    const smoothedPoints: number[] = []
    const windowSize = 1 // Reduced from 3 to allow more variation
    for (let i = 0; i < rawPoints.length; i++) {
        let sum = 0
        let count = 0
        for (let j = -windowSize; j <= windowSize; j++) {
            const idx = i + j
            if (idx >= 0 && idx < rawPoints.length) {
                sum += rawPoints[idx]
                count++
            }
        }
        smoothedPoints.push(sum / count)
    }

    // Convert to points
    const points: { x: number; y: number }[] = []
    const spacing = width / (numPoints - 1)

    for (let i = 0; i < numPoints; i++) {
        const x = i * spacing
        const y = height * smoothedPoints[i]
        points.push({ x, y })
    }

    return points
}

// Convert points to SVG path with smooth cubic bezier curves
function pointsToSVGPath(points: { x: number; y: number }[]) {
    if (points.length < 2) return ''

    let path = `M ${points[0].x} ${points[0].y}`

    // Use cubic bezier curves for very smooth, flowing connections
    for (let i = 0; i < points.length - 1; i++) {
        const current = points[i]
        const next = points[i + 1]

        // Control points for smooth cubic bezier
        const cp1x = current.x + (next.x - current.x) / 3
        const cp1y = current.y
        const cp2x = current.x + 2 * (next.x - current.x) / 3
        const cp2y = next.y

        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`
    }

    return path
}

interface DynamicDesirePathProps {
    size?: 'default' | 'compact'
}

function DynamicDesirePath({ size = 'default' }: DynamicDesirePathProps) {
    const [offset, setOffset] = useState(0)
    const [mounted, setMounted] = useState(false)
    const [height, setHeight] = useState(284)
    const pathWidth = 12000 // Very long path - 10x longer than typical viewport

    // Only generate points on client side to avoid hydration mismatch
    const [pathPoints, setPathPoints] = useState<{ x: number; y: number }[]>([])

    useEffect(() => {
        // Determine height based on viewport width and size variant
        const updateHeight = () => {
            const isMobile = window.innerWidth < 768 // md breakpoint
            if (size === 'compact') {
                setHeight(isMobile ? 120 : 160)
            } else {
                setHeight(isMobile ? 216 : 284)
            }
        }

        updateHeight()
        window.addEventListener('resize', updateHeight)

        return () => window.removeEventListener('resize', updateHeight)
    }, [size])

    useEffect(() => {
        if (!height) return

        // Generate a very long continuous path with fewer points for gentler, meandering curves
        setPathPoints(generatePathPoints(100, pathWidth, height)) // Fewer points = smoother, less spiky
        setMounted(true)
    }, [height])

    useEffect(() => {
        if (!mounted) return

        let animationFrame: number
        let startTime = Date.now()

        const animate = () => {
            const elapsed = Date.now() - startTime
            const speed = 40 // pixels per second
            const newOffset = (elapsed * speed) / 1000

            // Reset offset when we've scrolled through most of the path
            // This reset is imperceptible since we have such a long path
            if (newOffset > pathWidth - 2000) {
                startTime = Date.now()
                setOffset(0)
            } else {
                setOffset(newOffset)
            }

            animationFrame = requestAnimationFrame(animate)
        }

        animationFrame = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(animationFrame)
    }, [mounted, pathWidth])

    const pathData = useMemo(() => pointsToSVGPath(pathPoints), [pathPoints])

    const containerClass = size === 'compact'
        ? 'relative overflow-hidden h-[120px] md:h-[160px]'
        : 'relative overflow-hidden h-[216px] md:h-[284px]'

    // Don't render until mounted to avoid hydration mismatch
    if (!mounted) {
        return <div className={containerClass} />
    }

    return (
        <div className={containerClass}>
            <svg
                className="absolute top-0 left-0 w-full h-full"
                style={{ minHeight: height }}
                preserveAspectRatio="none"
            >
                {/* Single long continuous path - no duplication needed */}
                <g transform={`translate(${-offset}, 0)`}>
                    <path
                        d={pathData}
                        className="desire-path-svg-line"
                    />
                </g>
            </svg>
        </div>
    )
}

interface StaticDesirePathProps {
    size?: 'default' | 'compact'
}

function StaticDesirePath({ size = 'default' }: StaticDesirePathProps) {
    const heightClass = size === 'compact'
        ? 'h-[120px] md:h-[160px]'
        : 'h-[216px] md:h-[284px]'

    return (
        <motion.div
            className="flex"
            animate={{
                x: ['0%', '-50%']
            }}
            transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear'
            }}
        >
            {/* First copy of the path */}
            <div className="flex-shrink-0 mr-4 md:mr-8">
                <img
                    src="/images/header-animation-stuff/Vector 2.png"
                    alt="Desire Path"
                    className={`${heightClass} w-auto object-contain desire-path-image`}
                    style={{ minWidth: '200px' }}
                />
            </div>
            {/* Second copy for seamless loop */}
            <div className="flex-shrink-0">
                <img
                    src="/images/header-animation-stuff/Vector 2.png"
                    alt="Desire Path"
                    className={`${heightClass} w-auto object-contain desire-path-image`}
                    style={{ minWidth: '200px' }}
                />
            </div>
        </motion.div>
    )
}

interface DesirePathAnimationProps {
    size?: 'default' | 'compact'
}

export default function DesirePathAnimation({ size = 'default' }: DesirePathAnimationProps) {
    const devMode = useDevMode()
    const { showToggles } = useLiveChannelToggle()
    const [useDynamic, setUseDynamic] = useState(true)

    return (
        <div className={`relative ${devMode ? 'border border-blue-500' : ''}`}>
            {/* Toggle button - visibility controlled by Hide/Show button in header */}
            {showToggles && (
                <button
                    onClick={() => setUseDynamic(!useDynamic)}
                    className="absolute top-2 right-2 z-10 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                >
                    {useDynamic ? 'Dynamic' : 'Static'}
                </button>
            )}

            {useDynamic ? <DynamicDesirePath size={size} /> : <StaticDesirePath size={size} />}
        </div>
    )
}
