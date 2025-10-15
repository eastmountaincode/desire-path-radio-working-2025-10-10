'use client'

import { useState } from 'react'

export interface Host {
  name: string
  organization: string
}

interface HostsSectionProps {
  hosts: Host[]
  onChange: (hosts: Host[]) => void
}

export default function HostsSection({
  hosts,
  onChange
}: HostsSectionProps) {
  const [currentHost, setCurrentHost] = useState<Host>({ name: '', organization: '' })

  const handleAddHost = () => {
    if (currentHost.name.trim()) {
      onChange([...hosts, currentHost])
      setCurrentHost({ name: '', organization: '' })
    }
  }

  const handleRemoveHost = (index: number) => {
    onChange(hosts.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Hosts</h2>

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="host_name" className="block mb-2">
              Host Name
            </label>
            <input
              type="text"
              id="host_name"
              value={currentHost.name}
              onChange={(e) => setCurrentHost(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 border border-grey5"
              placeholder="Enter host name"
            />
          </div>

          <div>
            <label htmlFor="host_org" className="block mb-2">
              Organization
            </label>
            <input
              type="text"
              id="host_org"
              value={currentHost.organization}
              onChange={(e) => setCurrentHost(prev => ({ ...prev, organization: e.target.value }))}
              className="w-full p-2 border border-grey5"
              placeholder="Optional"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddHost}
          className="px-4 py-2 dpr-button"
        >
          Add Host to List
        </button>
      </div>

      {/* Host List */}
      <div className="space-y-2">
        <h3 className="text-lg font-bold">
          Host List {hosts.length > 0 && `(${hosts.length})`}
        </h3>
        {hosts.length === 0 ? (
          <p className="text-grey5 italic">No hosts added yet</p>
        ) : (
          <div className="space-y-2">
            {hosts.map((host, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-grey5"
              >
                <div>
                  <span className="font-bold">{host.name}</span>
                  {host.organization && (
                    <span className="ml-2">
                      ({host.organization})
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveHost(index)}
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
