import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaGamepad, FaSearch } from 'react-icons/fa';
import { useAdmin } from '../../contexts/AdminContext';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const displayRtp = (value) => { const values = (Array.isArray(value) ? value : value == null || value === '' ? [] : String(value).split(',')).map(Number).filter(Number.isFinite); return values.length ? `${Math.max(...values).toFixed(2)}%` : '—'; };
const GameList = () => {
 const navigate=useNavigate(); const {getGames,deleteGame}=useAdmin(); const [games,setGames]=useState([]); const [loading,setLoading]=useState(true); const [search,setSearch]=useState('');
 const loadGames=async()=>{setLoading(true);try{const data=await getGames({search});setGames(data.games||[])}catch(error){console.error('Failed to load games:',error)}finally{setLoading(false)}};
 useEffect(()=>{loadGames()},[]);
 const handleDelete=async(id)=>{if(window.confirm('Are you sure you want to delete this game?'))try{await deleteGame(id);loadGames()}catch(_){}};
 const columns=[
  {key:'id',label:'ID'}, {key:'name',label:'Name'},
  {key:'provider',label:'Provider',render:(_,r)=>r.provider||r.provider_name||'—'},
  {key:'category',label:'Category',render:v=>v||'slots'},
  {key:'rtp',label:'RTP',render:displayRtp},
  {key:'maxMultiplier',label:'Max Multiplier',render:(_,r)=>{const v=r.maxMultiplier??r.max_multiplier??r.raw?.max_multiplier??r.raw?.multiplier;return Number.isFinite(Number(v))?`${v}x`:'—'}},
  {key:'status',label:'Status',render:(_,r)=>{const v=r.status||(r.isActive===false||r.enabled===false?'disabled':'active');return <span className={`px-2 py-1 rounded-full text-xs ${v==='active'?'bg-green-500/20 text-green-400':v==='maintenance'?'bg-yellow-500/20 text-yellow-400':'bg-red-500/20 text-red-400'}`}>{v}</span>}},
  {key:'actions',label:'Actions',render:(_,r)=><div className="flex items-center gap-2"><button onClick={()=>navigate(`/games/${r.id}/edit`)} className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400"><FaEdit className="text-xs"/></button><button onClick={()=>navigate(`/games/${r.id}/control`)} className="p-1.5 rounded-lg bg-primary-500/20 text-primary-400"><FaGamepad className="text-xs"/></button><button onClick={()=>handleDelete(r.id)} className="p-1.5 rounded-lg bg-red-500/20 text-red-400"><FaTrash className="text-xs"/></button></div>}
 ];
 if(loading)return <LoadingSpinner/>;
 return <div className="w-full"><motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.5}}><div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4"><div><h1 className="text-2xl md:text-3xl font-bold gradient-text">Games</h1><p className="text-gray-400">Manage all games</p></div><button onClick={()=>navigate('/games/add')} className="px-4 py-2 bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 rounded-xl font-semibold flex items-center gap-2"><FaPlus/> Add Game</button></div><div className="relative max-w-md mb-6"><input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&loadGames()} placeholder="Search games..." className="w-full bg-dark-800/80 text-white rounded-xl px-4 py-3 pl-11 border border-dark-700/50"/><FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"/></div><div className="bg-dark-800/80 backdrop-blur-sm rounded-2xl border border-dark-700/50 overflow-hidden"><DataTable columns={columns} data={games} loading={loading} onRowClick={r=>navigate(`/games/${r.id}/edit`)}/></div></motion.div></div>;
};
export default GameList;
