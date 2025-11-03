'use client'

import DesirePathAnimation from '@/app/components/home/HomeHero/DesirePathAnimation'
import SubmitShowProposalForm from '@/app/components/SubmitShowProposalForm/SubmitShowProposalForm'
import { useDevMode } from '@/app/components/DevModeProvider'

export default function SubmitShowProposal() {
  const devMode = useDevMode()

  return (
    <div className={`min-h-screen mb-8 ${devMode ? 'border-2 border-green-500' : ''}`}>
      {/* Compact Desire Path Animation */}
      <div className={`mb-8 ${devMode ? 'border border-blue-500' : ''}`}>
        <DesirePathAnimation size="compact" />
      </div>

      {/* Submit Show Proposal Content */}
      <div className={`max-w-4xl mx-auto space-y-8 ${devMode ? 'border border-purple-500' : ''}`}>
        {/* Intro Text */}
        <section className={devMode ? 'border border-yellow-500 p-2' : ''}>
          <h2 className={`text-2xl font-bold mb-6 font-[family-name:var(--font-monument-wide)] ${devMode ? 'border border-orange-500' : ''}`}>[submit a show proposal]</h2>
          <div className="space-y-4">
            <p className={devMode ? 'border border-cyan-500' : ''}>
              Desire Path Radio is currently accepting show proposals for Channels 1 and 2.
            </p>
            <p className={devMode ? 'border border-cyan-500' : ''}>
              DPR is looking for one-offs, series, and recurring shows. We are looking for hosts from all over the world with different backgrounds and interests. All potential shows must submit a show proposal.
            </p>
            <p className={devMode ? 'border border-cyan-500' : ''}>
              DPR is a platform for information exchange and creative expression. No prior radio experience required. If you have an idea you&apos;re excited about, we want to hear it.
            </p>
            <p className={devMode ? 'border border-cyan-500' : ''}>
              DPR supports LGBTQIA+ and POCI folx, a free Palestine, the abolition of ICE, and the dismantling of facism. DPR does not stand for hate speech, racism, sexism, plagiarism, or -phobias of any kind. We are looking for collaborators who align with these core values.
            </p>
            <p className={devMode ? 'border border-cyan-500' : ''}>
              At this moment in time, DPR is a fully remote, internet-hosted radio station. Don&apos;t sweat the tech - we&apos;ll get you the set up if you have a show. All programming will start off pre-recorded before transitioning to a live option.
            </p>
          </div>
        </section>

        {/* Form */}
        <section className={devMode ? 'border border-pink-500 p-2' : ''}>
          <SubmitShowProposalForm />
        </section>
      </div>
    </div>
  );
}
