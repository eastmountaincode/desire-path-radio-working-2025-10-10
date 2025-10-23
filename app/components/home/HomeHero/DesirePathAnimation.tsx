'use client'

import { motion } from 'framer-motion'
import { useDevMode } from '../../DevModeProvider'
import './desire-path-animation-styles.css'

export default function DesirePathAnimation() {
    const devMode = useDevMode()

    return (
        <div className={`${devMode ? 'border border-blue-500' : ''}`}>
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
                        className="h-[216px] md:h-[284px] w-auto object-contain desire-path-image"
                        style={{ minWidth: '200px' }}
                    />
                </div>
                {/* Second copy for seamless loop */}
                <div className="flex-shrink-0">
                    <img
                        src="/images/header-animation-stuff/Vector 2.png"
                        alt="Desire Path"
                        className="h-[216px] md:h-[284px] w-auto object-contain desire-path-image"
                        style={{ minWidth: '200px' }}
                    />
                </div>
            </motion.div>
        </div>
    )
}
