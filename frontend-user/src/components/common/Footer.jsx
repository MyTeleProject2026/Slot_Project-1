import React from 'react'

export default function Footer() {
  return (
    <footer className="mt-12 py-6 text-center text-sm text-gray-600 dark:text-gray-400">
      <div>© {new Date().getFullYear()} Slot Project</div>
      <div className="mt-2">Built with ❤️ using React & Vite</div>
    </footer>
  )
}
