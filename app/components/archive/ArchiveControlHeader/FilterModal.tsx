'use client'

import { useDevMode } from "../../DevModeProvider"
import "./filter-modal-styles.css"

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function FilterModal({ isOpen, onClose }: FilterModalProps) {
  if (!isOpen) return null

  const devMode = useDevMode()

  return (
    <div className={`filter-modal rounded-md absolute top-full right-0 z-50 mt-2 ${devMode ? 'border border-red-500' : ''}`}>
      <div className={`p-4 min-w-72`}>
        <div className={`filter-modal-header mb-4 ${devMode ? 'border border-red-500' : ''}`}>
          <h3 className={`text-sm mb-1 pb-2 ${devMode ? 'border border-red-500' : ''}`}>
            filter tags
          </h3>
        </div>
        
        <div className={`mb-4 space-y-3 ${devMode ? 'border border-red-500' : ''}`}>
          {/* Channel Section */}
          <div>
            <div className="flex items-center justify-between py-2 cursor-pointer">
              <span className="">channel</span>
              <i className="fi fi-tr-chevron-down"></i>
            </div>
            <div className="pl-3 mt-2 space-y-1">
              <label className="flex items-center gap-2 py-1 cursor-pointer">
                <input type="checkbox" className="cursor-pointer" />
                <span>channel 1</span>
              </label>
              <label className="flex items-center gap-2 py-1 cursor-pointer">
                <input type="checkbox" className="cursor-pointer" />
                <span>channel 2</span>
              </label>
            </div>
          </div>

          {/* Genre Section */}
          <div>
            <div className="flex items-center justify-between py-2 cursor-pointer">
              <span className="font-medium">genre</span>
              <i className="fi fi-tr-chevron-down"></i>
            </div>
          </div>

          {/* Topics Section */}
          <div>
            <div className="flex items-center justify-between py-2 cursor-pointer">
              <span className="font-medium">topics</span>
              <i className="fi fi-tr-chevron-down"></i>
            </div>
            <div className="pl-3 mt-2 space-y-1">
              <label className="flex items-center gap-2 py-1 cursor-pointer">
                <input type="checkbox" defaultChecked className="cursor-pointer" />
                <span>Music</span>
              </label>
              <label className="flex items-center gap-2 py-1 cursor-pointer">
                <input type="checkbox" defaultChecked className="cursor-pointer" />
                <span>environment</span>
              </label>
              <label className="flex items-center gap-2 py-1 cursor-pointer">
                <input type="checkbox" className="cursor-pointer" />
                <span>Gear</span>
              </label>
              <label className="flex items-center gap-2 py-1 cursor-pointer">
                <input type="checkbox" className="cursor-pointer" />
                <span>Culture</span>
              </label>
              <label className="flex items-center gap-2 py-1 cursor-pointer">
                <input type="checkbox" className="cursor-pointer" />
                <span>Art</span>
              </label>
            </div>
          </div>
        </div>

        <div className="border-t border-dotted border-grey4 dark:border-grey3 pt-3">
          <button className="w-full bg-grey6 dark:bg-grey1 border-none py-2 px-4 rounded cursor-pointer hover:bg-grey5 dark:hover:bg-grey2">
            apply
          </button>
        </div>
      </div>
    </div>
  )
}

