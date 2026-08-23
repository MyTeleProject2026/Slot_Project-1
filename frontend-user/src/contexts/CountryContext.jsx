import React,{createContext,useContext,useEffect,useState}from'react';
import axios from'axios';
import {DEFAULT_COUNTRY,setCurrentCountry,getCurrentCountry}from'../utils/constants';

const C=createContext(null);
const apiBase=()=>{const url=import.meta.env.VITE_API_URL||(import.meta.env.DEV?'http://localhost:5000/api':'');return url.replace(/\/$/,'');};

export function CountryProvider({children}){
 const [country,setCountry]=useState(getCurrentCountry());
 const apply=(value)=>{if(value?.code&&value?.currency){const next={...DEFAULT_COUNTRY,...value};setCurrentCountry(next);setCountry(next);return next;}return getCurrentCountry();};
 useEffect(()=>{
  const url=apiBase();
  if(!url)return;
  axios.get(`${url}/settings/country`,{timeout:10000}).then(r=>{if(r.data?.country)apply(r.data.country);}).catch(()=>{apply(DEFAULT_COUNTRY);});
 },[]);
 const refresh=async()=>{
  const url=apiBase();
  if(!url)return country;
  const r=await axios.get(`${url}/settings/country`,{timeout:10000});
  return apply(r.data?.country);
 };
 return <C.Provider value={{country,refresh,currency:country?.currency||DEFAULT_COUNTRY.currency,symbol:country?.currencySymbol||DEFAULT_COUNTRY.currencySymbol,locale:country?.locale||DEFAULT_COUNTRY.locale}}>{children}</C.Provider>;
}
export const useCountry=()=>useContext(C);
