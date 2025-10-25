'use client'

import DesirePathAnimation from '@/app/components/home/HomeHero/DesirePathAnimation'
import { useDevMode } from '@/app/components/DevModeProvider'

export default function About() {
  const devMode = useDevMode()

  return (
    <div className={`min-h-screen mb-4 ${devMode ? 'border-2 border-green-500' : ''}`}>
      {/* Compact Desire Path Animation */}
      <div className={`mb-8 ${devMode ? 'border border-blue-500' : ''}`}>
        <DesirePathAnimation size="compact" />
      </div>

      {/* About Content */}
      <div className={`max-w-4xl mx-auto space-y-12 ${devMode ? 'border border-purple-500' : ''}`}>
        {/* Format Section */}
        <section className={devMode ? 'border border-yellow-500 p-2' : ''}>
          <h2 className="text-2xl font-bold mb-4">[format]</h2>
          <div className="space-y-4">
            <p>Two-channel streaming:</p>
            <p>Channel 1 - music, where anything goes</p>
            <p>Channel 2 - research-forward talk, education, audio documentary, experimental, and archival</p>
          </div>
        </section>

        {/* Why Now Section */}
        <section className={devMode ? 'border border-yellow-500 p-2' : ''}>
          <h2 className="text-2xl font-bold mb-4">[why now]</h2>
          <div className="space-y-4">
            <p>
              Our connection to the earth is central. Now is a critical time to return to (our) nature and get curious about the intersection of nature with different mediums and practices.
            </p>
            <p>
              DPR is a platform for information exchange and creative expression. We need forums beyond social media and the workplace where people are encouraged to learn, experiment, and share ideas.
            </p>
          </div>
        </section>

        {/* Why Radio Section */}
        <section className={devMode ? 'border border-yellow-500 p-2' : ''}>
          <h2 className="text-2xl font-bold mb-4">[why radio]</h2>
          <div className="space-y-4">
            <p>
              The contemporary definition of &ldquo;radio&rdquo; has evolved, expanding beyond the technology and practice of transmitting sound via electromagnetic waves. Especially in independent spaces, &ldquo;radio&rdquo; encompasses a shared culture and community.
            </p>
            <p>
              Desire Path Radio celebrates radio broadcast as an accessible tool for discourse, entertainment, and world-building.
            </p>
            <p>Radio is, and always has been, radical.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

