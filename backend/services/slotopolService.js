const axios=require('axios');require('dotenv').config();
const SLOTOPOL_URL=(process.env.SLOTOPOL_URL||'http://localhost:8080').replace(/\/+$/,'');let token=null,tokenExpiry=0;
const unwrap=r=>Array.isArray(r)?r:(r?.list||r?.games||r?.clubs||r?.data?.list||r?.data?.games||r?.data||[]);
const normalizeGameId=v=>String(v||'').toLowerCase().replace(/[^a-z0-9_\/]/g,'');
function accounts(){try{const v=JSON.parse(process.env.SLOTOPOL_CLUB_ACCOUNTS||'{}');return v&&typeof v==='object'?v:{}}catch{throw new Error('SLOTOPOL_CLUB_ACCOUNTS must be valid JSON')}}
class SlotopolService{
 static async getToken(){if(token&&tokenExpiry>Date.now()+30000)return token;const body={email:process.env.SLOTOPOL_ADMIN_EMAIL,secret:process.env.SLOTOPOL_ADMIN_PASSWORD};try{let r=await axios.post(`${SLOTOPOL_URL}/signin`,body,{timeout:30000});token=r.data?.access||r.data?.token||r.data?.data?.access;if(!token)throw new Error('No token returned by Slotopol signin');tokenExpiry=Date.now()+55*60*1000;return token}catch(e){token=null;tokenExpiry=0;throw new Error(e.response?.data?.what||'Slotopol authentication failed')}}
 static async request(method,endpoint,data){try{const access=await this.getToken();const r=await axios({method,url:`${SLOTOPOL_URL}${endpoint}`,headers:{Authorization:`Bearer ${access}`,'Content-Type':'application/json',Accept:'application/json'},data,timeout:30000});return r.data}catch(e){const err=new Error(e.response?.data?.what||e.response?.data?.error||e.message||'Slotopol service error');err.status=e.response?.status||502;throw err}}
 static account(clubId=1){const a=accounts(),x=a[String(clubId)]||a[clubId]||{};const cid=Number(x.cid??process.env.SLOTOPOL_DEFAULT_CID);const uid=Number(x.uid??process.env.SLOTOPOL_DEFAULT_UID);if(!Number.isInteger(cid)||cid<=0)throw new Error(`No Slotopol CID configured for club ${clubId}`);return{cid,uid}}
 static async getClubGames(cid){const r=await this.request('GET',`/club/games?cid=${encodeURIComponent(cid)}&inc=all`);return unwrap(r)}
 static async getCatalog(){return unwrap(await this.request('GET','/game/algs'))}
 static async getGameList(clubId=process.env.N999BET_DEFAULT_CLUB_ID||1){const{cid}=this.account(clubId);const [catalog,enabled]=await Promise.all([this.getCatalog(),this.getClubGames(cid)]);const allowed=new Set(enabled.filter(x=>x.enabled!==false&&x.active!==false&&x.status!=='disabled').map(x=>normalizeGameId(x.game_id||x.id||(x.prov&&x.name?`${x.prov}/${x.name}`:''))).filter(Boolean));if(!allowed.size)return [];return catalog.filter(g=>Array.isArray(g.aliases)&&g.aliases.some(a=>allowed.has(normalizeGameId(`${a.prov}/${a.name}`))))}
 static async assertGameEnabledForClub(cid,provider,game){const id=normalizeGameId(`${provider}/${game}`);const list=await this.getClubGames(cid);if(!list.some(x=>x.enabled!==false&&x.active!==false&&normalizeGameId(x.game_id||x.id||(x.prov&&x.name?`${x.prov}/${x.name}`:''))===id)){const e=new Error(`Game ${provider}/${game} is not enabled for Slotopol club ${cid}`);e.status=403;e.code='SLOTOPOL_GAME_DISABLED_FOR_CLUB';throw e}}
 static async startGame(clubId,provider,game){const{cid,uid}=this.account(clubId);if(!Number.isInteger(uid)||uid<=0)throw new Error(`No Slotopol UID configured for club ${clubId}`);await this.assertGameEnabledForClub(cid,provider,game);return this.request('POST','/game/new',{cid,uid,alias:`${provider}/${game}`})}
 static async spin(gid,bet,lines){const d={gid:Number(gid)};if(bet!=null)d.bet=Number(bet);if(lines!=null)d.sel=Number(lines);return this.request('POST','/slot/spin',d)}
 static async collect(gid){return this.request('POST','/slot/collect',{gid:Number(gid)})}
 static async getGameInfo(gid){return this.request('POST','/game/info',{gid:Number(gid)})}
 static async getGameImages(){return{images:[]}}
}
module.exports=SlotopolService;
