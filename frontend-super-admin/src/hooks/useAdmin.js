import { useState } from 'react'

export default function useAdmin(){
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  return { selectedAdmin, setSelectedAdmin }
}
