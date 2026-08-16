import api from './api'

export async function fetchAdmins(){
  return api.get('/admins')
}

export async function updateAdmin(id, data){
  return api.put(`/admins/${id}`, data)
}

export default { fetchAdmins, updateAdmin }
