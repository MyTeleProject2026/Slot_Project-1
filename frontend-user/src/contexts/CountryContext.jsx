import React,{createContext,useContext,useEffect,useState}from'react';
import axios from'axios';
import {setCurrentCountry,getCurrentCountry} from'../utils/constants';
const C=createContext(null);
export function CountryProvider({children}){
 const [country,setCountry]=useState(getCurrentCountry());
 useEffect(()=>{const url=import.meta.env.VITE_API_URL||(import.meta.env.DEV?'http://localhost:5000/api':''); if(!url)return;
  axios.get(`${url.replace(/\/$/,'')}/settings/country`).then(r=>{if(r.data?.country){setCurrentCountry(r.data.country);setCountry({...r.data.country});}}).catch(()=>{});
 },[]);
 const refresh=async()=>{const url=import.meta.env.VITE_API_URL||(import.meta.env.DEV?'http://localhost:5000/api':''); if(!url)return country; const r=await axios.get(`${url.replace(/\/$/,'')}/settings/country`); if(r.data?.country){setCurrentCountry(r.data.country);setCountry({...r.data.country});} return r.data.country;};
 return <C.Provider value={{country,refresh,currency:country.currency||'THB',symbol:country.currencySymbol||'฿',locale:country.locale||'en-US'}}>{children}</C.Provider>
}
export const useCountry=()=>useContext(C);
