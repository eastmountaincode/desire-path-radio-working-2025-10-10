'use client'

import { useState } from 'react'
import { useDevMode } from '../DevModeProvider'
import './submit-show-proposal-form-styles.css'

export default function SubmitShowProposalForm() {
  const devMode = useDevMode()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    showName: '',
    location: '',
    category: '',
    frequency: '',
    oneLiner: '',
    fullDescription: '',
    relevantExperience: '',
    howDidYouHear: '',
    anythingElse: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/submit-show-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      setSubmitStatus('success')
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        showName: '',
        location: '',
        category: '',
        frequency: '',
        oneLiner: '',
        fullDescription: '',
        relevantExperience: '',
        howDidYouHear: '',
        anythingElse: ''
      })
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={devMode ? 'border border-purple-500' : ''}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Fields */}
        <div className={`form-field-group ${devMode ? 'border border-yellow-500' : ''}`}>
          <label htmlFor="name" className="form-label">Name</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First name"
              required
              className="form-input"
            />
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last name"
              required
              className="form-input"
            />
          </div>
        </div>

        {/* Email */}
        <div className="form-field-group">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@email.com"
            required
            className="form-input"
          />
        </div>

        {/* Phone */}
        <div className="form-field-group">
          <label htmlFor="phone" className="form-label">Phone number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="000-000-0000"
            className="form-input"
          />
        </div>

        {/* Show Name */}
        <div className="form-field-group">
          <label htmlFor="showName" className="form-label">Show name</label>
          <input
            type="text"
            id="showName"
            name="showName"
            value={formData.showName}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        {/* Location */}
        <div className="form-field-group">
          <label htmlFor="location" className="form-label">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        {/* Category */}
        <div className="form-field-group">
          <label htmlFor="category" className="form-label">
            Category
            <span className="form-label-subtitle">Music, talk, educational, experimental, etc. feel free to create your own "category."</span>
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        {/* Frequency */}
        <div className="form-field-group">
          <label htmlFor="frequency" className="form-label">
            Frequency
            <span className="form-label-subtitle">One-off, weekly, biweekly, monthly, bimonthly, other.</span>
          </label>
          <input
            type="text"
            id="frequency"
            name="frequency"
            value={formData.frequency}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        {/* One-liner */}
        <div className="form-field-group">
          <label htmlFor="oneLiner" className="form-label">
            One-liner
            <span className="form-label-subtitle">The show is about...</span>
          </label>
          <input
            type="text"
            id="oneLiner"
            name="oneLiner"
            value={formData.oneLiner}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        {/* Full Description */}
        <div className="form-field-group">
          <label htmlFor="fullDescription" className="form-label">
            Full show description
            <span className="form-label-subtitle">Please include both concept and format. (What will we hear when we tune into your show?)</span>
          </label>
          <textarea
            id="fullDescription"
            name="fullDescription"
            value={formData.fullDescription}
            onChange={handleChange}
            required
            rows={6}
            className="form-textarea"
          />
        </div>

        {/* Relevant Experience */}
        <div className="form-field-group">
          <label htmlFor="relevantExperience" className="form-label">
            Relevant experience
            <span className="form-label-subtitle">Any relevant experience, studies, or work to your proposed show topic? To radio? If you wish to include a link to your Instagram, website, or other work, please do so here.</span>
          </label>
          <textarea
            id="relevantExperience"
            name="relevantExperience"
            value={formData.relevantExperience}
            onChange={handleChange}
            rows={4}
            className="form-textarea"
          />
        </div>

        {/* How did you hear */}
        <div className="form-field-group">
          <label htmlFor="howDidYouHear" className="form-label">How did you hear about Desire Path Radio?</label>
          <input
            type="text"
            id="howDidYouHear"
            name="howDidYouHear"
            value={formData.howDidYouHear}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        {/* Anything else */}
        <div className="form-field-group">
          <label htmlFor="anythingElse" className="form-label">Anything else?</label>
          <textarea
            id="anythingElse"
            name="anythingElse"
            value={formData.anythingElse}
            onChange={handleChange}
            rows={4}
            className="form-textarea"
          />
        </div>

        {/* Submit Status Messages */}
        {submitStatus === 'success' && (
          <div className="submit-success-message">
            Thank you for your submission! We'll be in touch soon.
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="submit-error-message">
            {errorMessage || 'Something went wrong. Please try again.'}
          </div>
        )}

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="form-submit-button"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
          </button>
        </div>
      </form>
    </div>
  )
}
