"use client"

import { useState } from "react"
import { Search } from "lucide-react"

export function HeaderSearch() {
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const searchQuery = formData.get("s")
    window.location.href = `https://neowave.tech/?s=${encodeURIComponent(searchQuery as string)}`
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="ekit_navsearch-button ekit-modal-popup text-[#40C4FF]"
        aria-label="navsearch-button"
      >
        <i className="icon icon-search">
          <Search className="h-5 w-5" />
        </i>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[9999]">
          <div className="mfp-bg my-mfp-slide-bottom ekit-promo-popup" onClick={() => setIsOpen(false)} />
          <div className="mfp-wrap mfp-auto-cursor my-mfp-slide-bottom ekit-promo-popup">
            <div className="mfp-container">
              <div className="mfp-content">
                <div className="zoom-anim-dialog ekit_modal-searchPanel">
                  <div className="ekit-search-panel">
                    <form
                      role="search"
                      method="get"
                      className="ekit-search-group"
                      action="https://neowave.tech/"
                      onSubmit={handleSubmit}
                    >
                      <input
                        type="search"
                        className="ekit_search-field"
                        placeholder="Search For Neo Wave Product"
                        name="s"
                        aria-label="search-form"
                      />
                      <button type="submit" className="ekit_search-button" aria-label="search-button">
                        <Search className="h-5 w-5" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
              <button type="button" className="mfp-close ekit-popup-close" onClick={() => setIsOpen(false)}>
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

