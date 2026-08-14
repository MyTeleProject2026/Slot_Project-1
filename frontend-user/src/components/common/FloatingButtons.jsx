import React from 'react'

export default function FloatingButtons({ onHelp = () => {}, onTop = () => {} }) {
  return (
    <div className="fixed right-4 bottom-6 flex flex-col gap-3 z-50">
      <button
        onClick={onHelp}
        className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center"
        title="Help"
      >
        ?
      </button>
      <button
        onClick={onTop}
        className="w-12 h-12 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center"
        title="Back to top"
      >
        ↑
      </button>
    </div>
  )
}
