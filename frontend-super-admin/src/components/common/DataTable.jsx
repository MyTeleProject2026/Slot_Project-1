import React from 'react'

export default function DataTable({ data = [] }){
  return (
    <table className="min-w-full">
      <tbody>
        {data.map((row, i) => (
          <tr key={i}><td>{JSON.stringify(row)}</td></tr>
        ))}
      </tbody>
    </table>
  )
}
