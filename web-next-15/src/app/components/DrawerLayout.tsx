'use client'

import { useState, useCallback } from 'react'
import Cookies from 'js-cookie'
import Header from './Header'

export default function DrawerLayout({
  children,
  defaultOpen = true,
  defaultTheme = 'light',
}: {
  children: React.ReactNode
  defaultOpen?: boolean
  defaultTheme?: string
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [theme, setTheme] = useState(defaultTheme)

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => {
      const newState = !prev
      Cookies.set('drawer-open', String(newState), { expires: 365 })
      return newState
    })
  }, [])

  const handleThemeToggle = useCallback(() => {
    setTheme((prev) => {
      const newTheme = prev === 'light' ? 'dark' : 'light'
      Cookies.set('theme', newTheme, { expires: 365 })
      return newTheme
    })
  }, [])

  return (
    <div className="drawer drawer-open" data-theme={theme}>
      <input
        id="my-drawer-4"
        type="checkbox"
        className="drawer-toggle"
        checked={isOpen}
        onChange={handleToggle}
      />
      <div className="drawer-content grid grid-rows-[max-content_auto]">
        <Header theme={theme} onThemeToggle={handleThemeToggle} />
        {children}
      </div>
      <div className="drawer-side is-drawer-close:overflow-visible">
        <label
          htmlFor="my-drawer-4"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="is-drawer-close:w-14 is-drawer-open:w-64 bg-base-200 text-base-content flex flex-col items-start min-h-full">
          {/* Sidebar content here */}
          <ul className="menu w-full grow text-base-content">
            {/* list item */}
            <li>
              <button
                className="is-drawer-close:tooltip is-drawer-close:tooltip-right flex"
                data-tip="Homepage"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="2"
                  fill="none"
                  stroke="currentColor"
                  className="inline-block size-4 my-1.5"
                >
                  <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
                  <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                </svg>
                <span className="drawer-text-transition">Homepage</span>
              </button>
            </li>

            {/* list item */}
            <li>
              <button
                className="is-drawer-close:tooltip is-drawer-close:tooltip-right flex"
                data-tip="Settings"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="2"
                  fill="none"
                  stroke="currentColor"
                  className="inline-block size-4 my-1.5"
                >
                  <path d="M20 7h-9"></path>
                  <path d="M14 17H5"></path>
                  <circle cx="17" cy="17" r="3"></circle>
                  <circle cx="7" cy="7" r="3"></circle>
                </svg>
                <span className="drawer-text-transition">Settings</span>
              </button>
            </li>
          </ul>

          {/* button to open/close drawer */}
          <div
            className="m-2 is-drawer-close:tooltip is-drawer-close:w-14"
            data-tip="Open"
          >
            <label
              htmlFor="my-drawer-4"
              className="btn btn-ghost btn-circle drawer-button is-drawer-open:rotate-y-180"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2"
                fill="none"
                stroke="currentColor"
                className="inline-block size-4 my-1.5"
              >
                <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
                <path d="M9 4v16"></path>
                <path d="M14 10l2 2l-2 2"></path>
              </svg>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
