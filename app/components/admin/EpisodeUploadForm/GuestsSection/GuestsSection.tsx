'use client'

import { useState } from 'react'

export interface Guest {
  name: string
  organization: string
}

interface GuestsSectionProps {
  guests: Guest[]
  onChange: (guests: Guest[]) => void
}

export default function GuestsSection({
  guests,
  onChange
}: GuestsSectionProps) {
  const [currentGuest, setCurrentGuest] = useState<Guest>({ name: '', organization: '' })

  const handleAddGuest = () => {
    if (currentGuest.name.trim()) {
      onChange([...guests, currentGuest])
      setCurrentGuest({ name: '', organization: '' })
    }
  }

  const handleRemoveGuest = (index: number) => {
    onChange(guests.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Guests</h2>
      
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="guest_name" className="block mb-2">
              Guest Name
            </label>
            <input
              type="text"
              id="guest_name"
              value={currentGuest.name}
              onChange={(e) => setCurrentGuest(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 border border-grey5"
              placeholder="Enter guest name"
            />
          </div>

          <div>
            <label htmlFor="guest_org" className="block mb-2">
              Organization
            </label>
            <input
              type="text"
              id="guest_org"
              value={currentGuest.organization}
              onChange={(e) => setCurrentGuest(prev => ({ ...prev, organization: e.target.value }))}
              className="w-full p-2 border border-grey5"
              placeholder="Optional"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddGuest}
          className="px-4 py-2 dpr-button"
        >
          Add Guest to List
        </button>
      </div>

      {/* Guest List */}
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-grey6">
          Guest List {guests.length > 0 && `(${guests.length})`}
        </h3>
        {guests.length === 0 ? (
          <p className="text-grey5 italic">No guests added yet</p>
        ) : (
          <div className="space-y-2">
            {guests.map((guest, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-grey5 bg-grey1"
              >
                <div>
                  <span className="font-bold">{guest.name}</span>
                  {guest.organization && (
                    <span className="text-grey5 ml-2">
                      ({guest.organization})
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveGuest(index)}
                  className="px-3 py-1 text-brand-dpr-orange hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

