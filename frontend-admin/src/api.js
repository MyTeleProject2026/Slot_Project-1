import axios from 'axios';
const API_URL=(import.meta.env.VITE_API_URL||'http://localhost:5000/api').replace(/\/$/,'');
export const api=axios.create({baseURL:API_URL,headers:{'Content-Type':'application/json'},timeout:30000});
api.interceptors.request.use(c=>{const t=localStorage.getItem('employee_token'); if(t)c.headers.Authorization=`Bearer ${t}`; return c;});
api.interceptors.response.use(r=>r,async e=>{if(e.response?.status===401){localStorage.removeItem('employee_token');localStorage.removeItem('employee_user'); if(location.pathname!=='/login') location.href='/login';} return Promise.reject(e);});
export default api;
