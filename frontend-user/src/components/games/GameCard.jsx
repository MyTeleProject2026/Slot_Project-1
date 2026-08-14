import React from 'react'

export default function GameCard({ title = 'Game', image, onPlay = () => {} }) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden w-64">
      {image ? (
        <img src={image} alt={title} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <span className="text-gray-500">No Image</span>
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={onPlay}
            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-500"
          >
            Play
          </button>
          <span className="text-sm text-gray-500">Free</span>
        </div>
      </div>
    </div>
  )
}
