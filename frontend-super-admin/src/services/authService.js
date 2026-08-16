import api from './api'

export async function login(credentials){
  // placeholder
  return api.post('/auth/login', credentials)
}

export async function logout(){
  return api.post('/auth/logout')
}

export default { login, logout }
