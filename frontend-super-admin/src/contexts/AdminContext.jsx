import { createContext, useState, useContext } from 'react'

const AdminContext = createContext(null)

export function AdminProvider({ children }){
  const [admin, setAdmin] = useState({})
  return (
    <AdminContext.Provider value={{ admin, setAdmin }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdminContext(){
  return useContext(AdminContext)
}

export default AdminContext
