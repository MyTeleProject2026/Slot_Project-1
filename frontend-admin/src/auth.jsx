import React,{createContext,useContext,useEffect,useState} from 'react';
import api from './api';
const C=createContext(null);
export function AuthProvider({children}){
 const [user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem('employee_user')||'null')}catch{return null}});
 const [loading,setLoading]=useState(Boolean(localStorage.getItem('employee_token')));
 useEffect(()=>{if(!localStorage.getItem('employee_token')){setLoading(false);return;} api.get('/auth/me').then(r=>{setUser(r.data.user);localStorage.setItem('employee_user',JSON.stringify(r.data.user));}).catch(()=>{localStorage.removeItem('employee_token');localStorage.removeItem('employee_user');setUser(null)}).finally(()=>setLoading(false))},[]);
 const login=async(username,password)=>{const r=await api.post('/auth/login',{username,password}); if(!['employee','admin','super_admin','main_admin'].includes(r.data.user?.role)) throw new Error('Employee access required'); localStorage.setItem('employee_token',r.data.token);localStorage.setItem('employee_user',JSON.stringify(r.data.user));setUser(r.data.user);return r.data;};
 const logout=()=>{localStorage.removeItem('employee_token');localStorage.removeItem('employee_user');setUser(null);location.href='/login';};
 return <C.Provider value={{user,loading,isAuthenticated:!!user,login,logout}}>{children}</C.Provider>
}
export const useAuth=()=>useContext(C);
