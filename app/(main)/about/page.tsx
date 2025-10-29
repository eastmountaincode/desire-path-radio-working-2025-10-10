'use client'

import DesirePathAnimation from '@/app/components/home/HomeHero/DesirePathAnimation'
import { useDevMode } from '@/app/components/DevModeProvider'

export default function About() {
  const devMode = useDevMode()

  return (
    <div className={`min-h-screen mb-8 ${devMode ? 'border-2 border-green-500' : ''}`}>
      {/* Compact Desire Path Animation */}
      <div className={`mb-8 ${devMode ? 'border border-blue-500' : ''}`}>
        <DesirePathAnimation size="compact" />
      </div>

      {/* About Content */}
      <div className={`max-w-4xl mx-auto space-y-12 ${devMode ? 'border border-purple-500' : ''}`}>
        {/* Format Section */}
        <section className={devMode ? 'border border-yellow-500 p-2' : ''}>
          <h2 className={`text-2xl font-bold mb-4 font-[family-name:var(--font-monument-wide)] ${devMode ? 'border border-orange-500' : ''}`}>[format]</h2>
          <div className="space-y-4">
            <p className={devMode ? 'border border-cyan-500' : ''}>Two-channel streaming:</p>
            <p className={devMode ? 'border border-cyan-500' : ''}>Channel 1 - music, where anything goes</p>
            <p className={devMode ? 'border border-cyan-500' : ''}>Channel 2 - research-forward talk, education, audio documentary, experimental, and archival</p>
          </div>
        </section>

        {/* Why Now Section */}
        <section className={devMode ? 'border border-yellow-500 p-2' : ''}>
          <h2 className={`text-2xl font-bold mb-4 font-[family-name:var(--font-monument-wide)] ${devMode ? 'border border-orange-500' : ''}`}>[why now]</h2>
          <div className="space-y-4">
            <p className={devMode ? 'border border-cyan-500' : ''}>
              Our connection to the earth is central. Now is a critical time to return to (our) nature and get curious about the intersection of nature with different mediums and practices.
            </p>
            <p className={devMode ? 'border border-cyan-500' : ''}>
              DPR is a platform for information exchange and creative expression. We need forums beyond social media and the workplace where people are encouraged to learn, experiment, and share ideas.
            </p>
          </div>
        </section>

        {/* Why Radio Section */}
        <section className={devMode ? 'border border-yellow-500 p-2' : ''}>
          <h2 className={`text-2xl font-bold mb-4 font-[family-name:var(--font-monument-wide)] ${devMode ? 'border border-orange-500' : ''}`}>[why radio]</h2>
          <div className="space-y-4">
            <p className={devMode ? 'border border-cyan-500' : ''}>
              The contemporary definition of &ldquo;radio&rdquo; has evolved, expanding beyond the technology and practice of transmitting sound via electromagnetic waves. Especially in independent spaces, &ldquo;radio&rdquo; encompasses a shared culture and community.
            </p>
            <p className={devMode ? 'border border-cyan-500' : ''}>
              Desire Path Radio celebrates radio broadcast as an accessible tool for discourse, entertainment, and world-building.
            </p>
            <p className={devMode ? 'border border-cyan-500' : ''}>Radio is, and always has been, radical.</p>
          </div>
        </section>

        {/* What is a desire path section*/}
        <section className={devMode ? 'border border-yellow-500 p-2' : ''}>
          <h2 className={`text-2xl font-bold mb-4 font-[family-name:var(--font-monument-wide)] ${devMode ? 'border border-orange-500' : ''}`}>[what is a desire path]</h2>
          <div className="space-y-4">
            <p className={devMode ? 'border border-cyan-500' : ''}>
            Desire paths are unofficial routes created by repeated traffic. Reflecting the patterns of human nature and both individual and collective will, these routes reveal an alternate, if not improved, way to move through space and interact with the world around us.            </p>
            <p className={devMode ? 'border border-cyan-500' : ''}>
            DIY forever.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

