import React from 'react'

export default function Marquee({ children, speed = 50 }) {
  return (
    <div className="overflow-hidden whitespace-nowrap bg-gray-100 dark:bg-gray-800 py-2">
      <div
        className="inline-block animate-marquee"
        style={{ animationDuration: `${Math.max(10, speed)}s` }}
      >
        {children}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee { animation-name: marquee; animation-timing-function: linear; animation-iteration-count: infinite; }
      `}</style>
    </div>
  )
}
