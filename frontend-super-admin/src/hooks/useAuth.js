import { useState } from 'react'

export default function useAuth(){
  const [token, setToken] = useState(null)
  return { token, setToken }
}
