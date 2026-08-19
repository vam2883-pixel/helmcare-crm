// @ts-nocheck
import React, { useState, useEffect, createContext, useContext, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  LayoutDashboard, Cpu, Megaphone, Tv, Award, Scale, Code2, Wrench,
  Bell, Search, Plus, LogOut, Eye, EyeOff, AlertCircle, Loader,
  ChevronRight, ChevronLeft, ArrowUpRight, ArrowDownRight,
  MapPin, FileText, Target, AlertTriangle, Star, CheckCircle,
  Wifi, WifiOff, Clock, Droplets, DollarSign, TrendingUp, Activity,
  Users, Lock, Unlock, Send, Upload, Video, Camera, Truck, Navigation,
  TrendingDown, Building2, Phone, Mail, CreditCard, Package, Zap,
  BarChart2, Gift, Percent, Radio, Monitor, Database, AlertOctagon,
  UserPlus, RefreshCw, Filter, Download, Sliders, Image, Volume2
} from "lucide-react";

import { C, CS } from "./lib/theme.js";
import { CrmProvider, useCrm } from "./lib/CrmProvider.jsx";
import {
  MACHINES_DB, TECHNICIANS, MARKETING_TEAM, ALL_MKT_MEMBERS,
  initCampaigns, initContractors, FR_LEADS, LEGAL_DB, DEV_DB,
  CLIENTS_DB, NOTIF_HISTORY, CONTENT_DB, PRICING_DB, LOGS_DB,
  REPORTS_PERIODS, WASHES_TREND, REV_CHART,
} from "./data/fallback.js";

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const USERS = [
  { id:1, email:"ceo@co.ru",       password:"ceo123",  name:"Рудаков Д.",   role:"ceo",        avatar:"РД", color:C.red    },
  { id:2, email:"director@co.ru",  password:"dir123",  name:"Волков А.",    role:"director",   avatar:"ВА", color:C.blue   },
  { id:3, email:"finance@co.ru",   password:"fin123",  name:"Карпов И.",    role:"financier",  avatar:"КИ", color:C.green  },
  { id:4, email:"rop@co.ru",       password:"rop123",  name:"Смирнова К.",  role:"rop",        avatar:"СК", color:C.cyan   },
  { id:5, email:"franchise@co.ru", password:"fr123",   name:"Иванов С.",    role:"franchisee", avatar:"ИС", color:C.amber  },
  { id:6, email:"tech@co.ru",      password:"tech123", name:"Козлов В.",    role:"tech",       avatar:"КВ", color:C.green  },
];

const ROLE_INFO = {
  ceo:        { label:"CEO",           color:C.red,    bg:"rgba(239,68,68,.12)"   },
  director:   { label:"Ком. директор", color:C.blue,   bg:"rgba(59,130,246,.12)"  },
  financier:  { label:"Финансист",     color:C.green,  bg:"rgba(16,185,129,.12)"  },
  rop:        { label:"РОП",           color:C.cyan,   bg:"rgba(0,212,255,.10)"   },
  franchisee: { label:"Франчайзи",     color:C.amber,  bg:"rgba(245,158,11,.12)"  },
  tech:       { label:"Технический",   color:C.green,  bg:"rgba(16,185,129,.12)"  },
};

const ROLE_SECTIONS = {
  ceo:        ["overview","machines","marketing","adslots","franchise","legal","devlab","technical"],
  director:   ["overview","machines","marketing","adslots","franchise","legal"],
  financier:  ["overview","machines","marketing","adslots","franchise","legal"],
  rop:        ["franchise","marketing"],
  franchisee: ["my_franchise"],
  tech:       ["technical","machines"],
};

const CAN_EDIT_BUDGET = ["ceo","financier"];

const AuthCtx = createContext(null);
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const login = useCallback(async (email, pw) => {
    await new Promise(r => setTimeout(r, 600));
    const u = USERS.find(x => x.email === email && x.password === pw);
    if (!u) throw new Error("Неверный email или пароль");
    setUser(u);
  }, []);
  const logout = useCallback(() => setUser(null), []);
  return <AuthCtx.Provider value={{ user, login, logout, isAuth: !!user }}>{children}</AuthCtx.Provider>;
}
const useAuth = () => useContext(AuthCtx);

// ─── UI ATOMS ─────────────────────────────────────────────────────────────────
function MPill({ status }) {
  const m={online:{c:C.green,l:"Online"},offline:{c:C.red,l:"Offline"},repair:{c:C.amber,l:"Ремонт"}};
  const s=m[status]||m.offline;
  return <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:600,background:`${s.c}18`,border:`1px solid ${s.c}33`,color:s.c}}><span style={{width:6,height:6,borderRadius:"50%",background:s.c,display:"inline-block",boxShadow:status==="online"?`0 0 5px ${s.c}`:"none"}}/>{s.l}</span>;
}

function Badge({ children, color }) {
  return <span style={{padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:600,color,background:`${color}1a`,border:`1px solid ${color}33`}}>{children}</span>;
}

function Av({ initials, color, size=32 }) {
  return <div style={{width:size,height:size,borderRadius:"50%",flexShrink:0,background:`linear-gradient(135deg,${color}44,${color}22)`,border:`1px solid ${color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.32,fontWeight:700,color}}>{initials}</div>;
}

function PBar({ value, color=C.cyan, h=5 }) {
  return <div style={{height:h,borderRadius:99,background:"rgba(255,255,255,0.06)"}}><div style={{width:`${Math.min(Math.max(value,0),100)}%`,height:"100%",borderRadius:99,background:color,transition:"width .5s"}}/></div>;
}

function Stat({ label, value, color=C.cyan }) {
  return <div style={{background:"rgba(255,255,255,0.03)",borderRadius:9,padding:"9px 12px"}}><div style={{fontSize:10,color:C.muted,textTransform:"uppercase",marginBottom:4}}>{label}</div><div style={{fontSize:16,fontWeight:700,color}}>{value}</div></div>;
}

function Btn({ children, variant="ghost", onClick, style:ex={}, type="button", disabled=false }) {
  const v={ghost:{background:"rgba(255,255,255,0.05)",border:`1px solid ${C.border}`,color:"#94a3b8"},primary:{background:"linear-gradient(135deg,#00d4ff,#0090cc)",border:"none",color:"#001824"},success:{background:"rgba(16,185,129,.1)",border:"1px solid rgba(16,185,129,.25)",color:C.green},danger:{background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.2)",color:C.red},amber:{background:"rgba(245,158,11,.1)",border:"1px solid rgba(245,158,11,.25)",color:C.amber},purple:{background:"rgba(129,140,248,.1)",border:"1px solid rgba(129,140,248,.25)",color:C.purple}};
  return <button type={type} onClick={onClick} disabled={disabled} style={{borderRadius:9,padding:"8px 14px",fontSize:12,fontWeight:600,cursor:disabled?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:6,transition:"all .2s",opacity:disabled?.5:1,...v[variant],...ex}}>{children}</button>;
}

function Inp({ label, placeholder, value, onChange, type="text", required=false, disabled=false, hint }) {
  const [focus,setFocus]=useState(false);
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
        <label style={{fontSize:11,fontWeight:600,color:disabled?C.dim:C.muted,letterSpacing:"0.05em",textTransform:"uppercase"}}>{label}{required&&<span style={{color:C.red,marginLeft:3}}>*</span>}</label>
        {disabled&&<span style={{fontSize:10,color:C.dim,display:"flex",alignItems:"center",gap:3}}><Lock size={9}/>Только финансист</span>}
      </div>
      <input type={type} value={value} onChange={e=>!disabled&&onChange(e.target.value)} placeholder={placeholder} disabled={disabled} onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)} style={{width:"100%",background:disabled?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.04)",border:`1px solid ${focus&&!disabled?C.borderFocus:C.border}`,borderRadius:10,padding:"10px 13px",color:disabled?C.dim:C.text,fontSize:13,outline:"none",transition:"border-color .2s",cursor:disabled?"not-allowed":"text"}}/>
      {hint&&<div style={{fontSize:10,color:C.dim,marginTop:4}}>{hint}</div>}
    </div>
  );
}

function Sel({ label, value, onChange, options, required=false, disabled=false }) {
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
        <label style={{fontSize:11,fontWeight:600,color:disabled?C.dim:C.muted,letterSpacing:"0.05em",textTransform:"uppercase"}}>{label}{required&&<span style={{color:C.red,marginLeft:3}}>*</span>}</label>
        {disabled&&<span style={{fontSize:10,color:C.dim,display:"flex",alignItems:"center",gap:3}}><Lock size={9}/>Только финансист</span>}
      </div>
      <select value={value} onChange={e=>!disabled&&onChange(e.target.value)} disabled={disabled} style={{width:"100%",background:disabled?"rgba(255,255,255,0.02)":C.surface2,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 13px",color:value?C.text:C.muted,fontSize:13,outline:"none",appearance:"none",cursor:disabled?"not-allowed":"pointer"}}>
        {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Tabs({ tabs, active, onChange }) {
  return <div style={{display:"flex",gap:0,marginBottom:16,borderBottom:`1px solid ${C.border}`}}>{tabs.map(([v,l])=><button key={v} onClick={()=>onChange(v)} style={{padding:"9px 16px",fontSize:12,fontWeight:600,cursor:"pointer",border:"none",background:"transparent",color:active===v?C.cyan:C.muted,borderBottom:`2px solid ${active===v?C.cyan:"transparent"}`,marginBottom:-1,transition:"all .15s"}}>{l}</button>)}</div>;
}

function DrillCard({ label, value, sub, trend, trendUp, accent=C.cyan, mono=false, onClick, icon:Icon }) {
  const [hov,setHov]=useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{...CS,position:"relative",overflow:"hidden",cursor:"pointer",transition:"all .2s",borderColor:hov?`${accent}55`:C.border,background:hov?`${accent}0a`:C.surface,transform:hov?"translateY(-2px)":"none"}}>
      <div style={{position:"absolute",top:0,right:0,width:70,height:70,background:`radial-gradient(circle at 80% 20%,${accent}22 0%,transparent 70%)`}}/>
      <div style={{position:"absolute",top:10,right:10,display:"flex",alignItems:"center",gap:3,fontSize:10,color:hov?accent:C.dim,transition:"color .2s"}}>подробнее <ChevronRight size={10}/></div>
      {Icon&&<div style={{width:30,height:30,borderRadius:8,background:`${accent}18`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:8}}><Icon size={15} color={accent}/></div>}
      <div style={{fontSize:10,fontWeight:600,letterSpacing:"0.08em",color:C.muted,textTransform:"uppercase",marginBottom:6}}>{label}</div>
      <div style={{fontSize:22,fontWeight:700,color:"#f0f4ff",marginBottom:5,fontFamily:mono?"monospace":"inherit",letterSpacing:"-0.02em"}}>{value}</div>
      <div style={{display:"flex",alignItems:"center",gap:5}}>
        {trend&&<span style={{display:"flex",alignItems:"center",gap:2,fontSize:11,fontWeight:600,color:trendUp?C.green:C.red}}>{trendUp?<ArrowUpRight size={12}/>:<ArrowDownRight size={12}/>}{trend}</span>}
        {sub&&<span style={{fontSize:11,color:C.muted}}>{sub}</span>}
      </div>
    </div>
  );
}

function BreadBar({ trail, onBack, onJump }) {
  if (trail.length <= 1) return null;
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20,padding:"10px 16px",borderRadius:10,background:C.surface2,border:`1px solid ${C.border}`}}>
      <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:5,background:"none",border:"none",cursor:"pointer",color:C.cyan,fontSize:12,fontWeight:600}}><ChevronLeft size={14}/>Назад</button>
      <div style={{width:1,height:16,background:C.border}}/>
      {trail.map((item,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:6}}>
          {i>0&&<ChevronRight size={12} color={C.dim}/>}
          <button onClick={()=>onJump(i)} style={{background:"none",border:"none",cursor:i<trail.length-1?"pointer":"default",fontSize:12,fontWeight:i===trail.length-1?600:400,color:i===trail.length-1?"#f0f4ff":C.cyan,padding:0,textDecoration:i<trail.length-1?"underline":"none",textUnderlineOffset:3}}>{item}</button>
        </div>
      ))}
    </div>
  );
}

function Section({ title, subtitle, render }) {
  const [trail,setTrail]=useState([{label:title,id:"root"}]);
  const [ds,setDs]=useState({});
  const drill=useCallback((id,label,state={})=>{setTrail(t=>[...t,{label,id}]);setDs(s=>({...s,[id]:state}));},[]);
  const back=useCallback(()=>setTrail(t=>t.length>1?t.slice(0,-1):t),[]);
  const jump=useCallback((i)=>setTrail(t=>t.slice(0,i+1)),[]);
  const cur=trail[trail.length-1];
  return (
    <div>
      <BreadBar trail={trail.map(t=>t.label)} onBack={back} onJump={jump}/>
      {trail.length===1&&<div style={{marginBottom:22}}><h2 style={{margin:0,fontSize:20,fontWeight:700,color:"#f0f4ff",letterSpacing:"-0.02em"}}>{title}</h2>{subtitle&&<p style={{margin:"3px 0 0",fontSize:12,color:C.muted}}>{subtitle}</p>}</div>}
      {render({current:cur.id,ds:ds[cur.id]||{},drill})}
    </div>
  );
}

// ─── UPLOAD ZONE ──────────────────────────────────────────────────────────────
function UploadZone({ label, hint, icon:Icon=Upload, onUpload, value }) {
  return (
    <div>
      <label style={{fontSize:11,fontWeight:600,color:C.muted,display:"block",marginBottom:7,letterSpacing:"0.05em",textTransform:"uppercase"}}>{label}</label>
      <div onClick={onUpload} style={{border:`2px dashed ${value?C.green:C.border}`,borderRadius:12,padding:"16px",textAlign:"center",cursor:"pointer",transition:"all .2s",background:value?"rgba(16,185,129,0.05)":"rgba(255,255,255,0.02)"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=value?C.green:C.cyan;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=value?C.green:C.border;}}>
        {value?<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><CheckCircle size={16} color={C.green}/><span style={{fontSize:12,color:C.green,fontWeight:600}}>Файл прикреплён</span></div>:<><Icon size={18} color={C.muted} style={{margin:"0 auto 6px",display:"block"}}/><div style={{fontSize:12,color:C.muted}}>{hint||"Нажми для загрузки"}</div></>}
      </div>
    </div>
  );
}

function PhotoUpload({ photos, onAdd, onRemove }) {
  const colors=[C.cyan,C.purple,C.amber];
  return (
    <div>
      <label style={{fontSize:11,fontWeight:600,color:C.muted,display:"block",marginBottom:8,letterSpacing:"0.05em",textTransform:"uppercase"}}>Фото <span style={{color:C.red}}>*</span> <span style={{color:C.dim,fontWeight:400,textTransform:"none"}}>(мин. 3)</span></label>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
        {photos.map((p,i)=>(
          <div key={i} style={{aspectRatio:"1",borderRadius:10,overflow:"hidden",position:"relative",background:colors[i%3]+"22",border:`1px solid ${colors[i%3]}44`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{textAlign:"center"}}><Camera size={20} color={colors[i%3]} style={{marginBottom:4}}/><div style={{fontSize:10,color:colors[i%3],fontWeight:600}}>Фото {i+1}</div></div>
            <button onClick={()=>onRemove(i)} style={{position:"absolute",top:5,right:5,width:20,height:20,borderRadius:"50%",background:"rgba(239,68,68,.8)",border:"none",cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:12}}>✕</span></button>
          </div>
        ))}
        {photos.length<6&&<div onClick={onAdd} style={{aspectRatio:"1",borderRadius:10,border:`2px dashed ${C.border}`,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,color:C.muted,transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.cyan;e.currentTarget.style.color=C.cyan;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;}}><Upload size={18}/><span style={{fontSize:11,fontWeight:600}}>Добавить</span></div>}
      </div>
      {photos.length<3&&<div style={{marginTop:8,fontSize:11,color:C.amber,display:"flex",alignItems:"center",gap:5}}><AlertTriangle size={11}/>Необходимо минимум 3 фото</div>}
    </div>
  );
}

// ─── MODALS ───────────────────────────────────────────────────────────────────

function StepHeader({ steps, current, accent=C.cyan, onJump }) {
  return (
    <div style={{display:"flex",gap:4,marginTop:8}}>
      {steps.map((s,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:4}}>
          {i>0&&<div style={{width:14,height:1,background:C.border}}/>}
          <div style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer"}} onClick={()=>i<current-1&&onJump(i+1)}>
            <div style={{width:18,height:18,borderRadius:"50%",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",background:current===i+1?accent:current>i+1?C.green:"rgba(255,255,255,0.08)",color:current===i+1||current>i+1?"#001824":C.muted}}>
              {current>i+1?<CheckCircle size={10}/>:i+1}
            </div>
            <span style={{fontSize:10,color:current===i+1?accent:current>i+1?C.green:C.muted,fontWeight:current===i+1?600:400}}>{s}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ModalShell({ title, subtitle, steps, step, accent=C.cyan, onStep, onClose, onSave, saveLabel="Сохранить", children, saved, savedMsg }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{width:"100%",maxWidth:620,background:C.surface,borderRadius:20,border:`1px solid ${C.border}`,boxShadow:"0 24px 60px rgba(0,0,0,.65)",overflow:"hidden",maxHeight:"92vh",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"20px 24px 16px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div><div style={{fontSize:17,fontWeight:700,color:"#f0f4ff"}}>{title}</div>{subtitle&&<div style={{fontSize:12,color:C.muted,marginTop:3}}>{subtitle}</div>}<StepHeader steps={steps} current={step} accent={accent} onJump={onStep}/></div>
            <button onClick={onClose} style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${C.border}`,borderRadius:8,padding:"5px 9px",cursor:"pointer",color:C.muted}}>✕</button>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
          {saved?(
            <div style={{textAlign:"center",padding:"40px 20px"}}>
              <div style={{width:60,height:60,borderRadius:"50%",background:`${accent}20`,border:`1px solid ${accent}44`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><CheckCircle size={28} color={accent}/></div>
              <div style={{fontSize:18,fontWeight:700,color:"#f0f4ff",marginBottom:8}}>{saveLabel}!</div>
              {savedMsg&&<div style={{fontSize:13,color:C.muted}}>{savedMsg}</div>}
            </div>
          ):children}
        </div>
        {!saved&&<div style={{padding:"14px 24px",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",flexShrink:0}}>
          <div>{step>1&&<Btn onClick={()=>onStep(step-1)}><ChevronRight size={12} style={{transform:"rotate(180deg)"}}/>Назад</Btn>}</div>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={onClose}>Отмена</Btn>
            {step<steps.length?<Btn variant={accent===C.amber?"amber":"primary"} onClick={()=>onStep(step+1)}>Далее <ChevronRight size={12}/></Btn>:<Btn variant={accent===C.amber?"amber":"primary"} onClick={onSave}><CheckCircle size={12}/>{saveLabel}</Btn>}
          </div>
        </div>}
      </div>
    </div>
  );
}

// Add Machine Modal
function AddMachineModal({ onClose, onSave }) {
  const [step,setStep]=useState(1);
  const [saved,setSaved]=useState(false);
  const [f,setF]=useState({number:"",country:"",city:"",district:"",address:"",mapsUrl:"",installDate:"",techId:"",photos:[],notes:"",relocation:false,relocationTarget:""});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const tech=TECHNICIANS.find(t=>t.id===parseInt(f.techId));
  const handleSave=()=>{setSaved(true);setTimeout(()=>{onSave(f);onClose();},1500);};
  return (
    <ModalShell title="+ Добавить автомат" steps={["Расположение","Установка","Фото","Проверка"]} step={step} onStep={setStep} onClose={onClose} onSave={handleSave} saveLabel="Сохранить автомат" saved={saved} savedMsg={tech?`Уведомление отправлено → ${tech.telegram}`:""}>
      {step===1&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><Inp label="Номер автомата" placeholder="AW-007" value={f.number} onChange={v=>set("number",v)} required/><Sel label="Страна" value={f.country} onChange={v=>set("country",v)} required options={[{value:"",label:"Страна"},{value:"ru",label:"🇷🇺 Россия"},{value:"kz",label:"🇰🇿 Казахстан"},{value:"by",label:"🇧🇾 Беларусь"},{value:"ae",label:"🇦🇪 ОАЭ"}]}/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><Inp label="Город" placeholder="Москва" value={f.city} onChange={v=>set("city",v)} required/><Inp label="Район" placeholder="Хорошёвский" value={f.district} onChange={v=>set("district",v)}/></div>
        <Inp label="Адрес" placeholder="ул. Ленина, 12" value={f.address} onChange={v=>set("address",v)} required/>
        <Inp label="Ссылка Google Maps" placeholder="https://maps.google.com/?q=..." value={f.mapsUrl} onChange={v=>set("mapsUrl",v)}/>
        <div style={{...CS,background:C.surface2,padding:"14px 16px",borderColor:f.relocation?`${C.amber}33`:C.border}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:f.relocation?12:0}}>
            <div><div style={{fontSize:13,fontWeight:600,color:"#f0f4ff"}}>Релокация</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>Автомат перемещён с другого места</div></div>
            <div onClick={()=>set("relocation",!f.relocation)} style={{width:42,height:23,borderRadius:99,cursor:"pointer",background:f.relocation?C.amber:"rgba(255,255,255,0.08)",border:`1px solid ${f.relocation?C.amber:C.border}`,position:"relative",transition:"all .25s",flexShrink:0}}><div style={{position:"absolute",top:3,left:f.relocation?21:3,width:15,height:15,borderRadius:"50%",background:f.relocation?"#001824":C.muted,transition:"left .25s"}}/></div>
          </div>
          {f.relocation&&<Inp label="Откуда переехал" placeholder="Старый адрес" value={f.relocationTarget} onChange={v=>set("relocationTarget",v)}/>}
        </div>
      </div>}
      {step===2&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><Inp label="Дата установки" type="date" value={f.installDate} onChange={v=>set("installDate",v)} required/><Sel label="Ответственный техник" value={f.techId} onChange={v=>set("techId",v)} required options={[{value:"",label:"Выбери техника"},...TECHNICIANS.map(t=>({value:t.id,label:`${t.name} ${!t.active?"(неактивен)":""}`}))]}/></div>
        {tech&&<div style={{background:"rgba(16,185,129,0.06)",borderRadius:9,padding:"12px 14px",border:"1px solid rgba(16,185,129,0.15)"}}><div style={{fontSize:11,color:C.green,fontWeight:600,marginBottom:6,display:"flex",alignItems:"center",gap:5}}><Send size={11}/>Telegram → {tech.telegram}</div><div style={{fontSize:12,color:"#e2e8f0",fontFamily:"monospace",lineHeight:1.7}}>🔧 Новый автомат назначен<br/>📍 {f.city||"Город"}, {f.address||"Адрес"}<br/>🆔 {f.number||"AW-XXX"}<br/>📅 Установка: {f.installDate||"..."}<br/>✅ Вы назначены ответственным</div></div>}
        <div><label style={{fontSize:11,fontWeight:600,color:C.muted,display:"block",marginBottom:6,letterSpacing:"0.05em",textTransform:"uppercase"}}>Заметки</label><textarea value={f.notes} onChange={e=>set("notes",e.target.value)} placeholder="Особенности места, доступ, контакт владельца..." rows={3} style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 13px",color:C.text,fontSize:13,outline:"none",resize:"vertical",fontFamily:"inherit"}}/></div>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:9,background:"rgba(0,212,255,0.05)",border:"1px solid rgba(0,212,255,0.15)"}}><Zap size={14} color={C.cyan}/><span style={{fontSize:12,color:"#e2e8f0"}}>Статистика моек подтянется из API аппарата после подключения телеметрии</span></div>
      </div>}
      {step===3&&<div style={{display:"flex",flexDirection:"column",gap:16}}>
        <PhotoUpload photos={f.photos} onAdd={()=>set("photos",[...f.photos,Date.now()])} onRemove={i=>set("photos",f.photos.filter((_,j)=>j!==i))}/>
        <div style={{...CS,background:C.surface2,padding:"14px 16px"}}><div style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:10,textTransform:"uppercase"}}>Что снять</div>{["Общий вид — фасад здания + автомат","Крупно автомат с панелью управления","Окружение — вход, парковка, поток людей"].map((t,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><div style={{width:20,height:20,borderRadius:"50%",background:`${C.cyan}18`,border:`1px solid ${C.cyan}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:C.cyan,flexShrink:0}}>{i+1}</div><span style={{fontSize:12,color:"#e2e8f0"}}>{t}</span></div>)}</div>
      </div>}
      {step===4&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={{fontSize:13,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>Проверь данные</div>
        {[{l:"Номер",v:f.number||"—"},{l:"Адрес",v:[f.city,f.district,f.address].filter(Boolean).join(", ")||"—"},{l:"Дата установки",v:f.installDate||"—"},{l:"Техник",v:tech?.name||"Не назначен"},{l:"Фото",v:`${f.photos.length} из мин. 3`},{l:"Релокация",v:f.relocation?`Да (${f.relocationTarget||"?"})` :"Нет"}].map(r=><div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"9px 13px",borderRadius:9,background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`}}><span style={{fontSize:12,color:C.muted}}>{r.l}</span><span style={{fontSize:12,fontWeight:600,color:"#e2e8f0"}}>{r.v}</span></div>)}
      </div>}
    </ModalShell>
  );
}

// Schedule TO Modal
function ScheduleToModal({ machine, onClose }) {
  const [date,setDate]=useState(""); const [techId,setTechId]=useState(""); const [notes,setNotes]=useState(""); const [saved,setSaved]=useState(false);
  const tech=TECHNICIANS.find(t=>t.id===parseInt(techId));
  return (
    <ModalShell title="Назначить ТО" subtitle={`${machine.id} · ${machine.place}`} steps={["Дата и техник","Отправка"]} step={1} onStep={()=>{}} onClose={onClose} onSave={()=>{setSaved(true);setTimeout(onClose,2000);}} saveLabel="Назначить и уведомить" saved={saved} savedMsg="Уведомление отправлено в Telegram">
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><Inp label="Дата ТО" type="date" value={date} onChange={setDate} required/><Sel label="Техник" value={techId} onChange={setTechId} required options={[{value:"",label:"Выбери техника"},...TECHNICIANS.map(t=>({value:t.id,label:t.name}))]}/></div>
        {tech&&<div style={{background:"rgba(16,185,129,0.06)",borderRadius:9,padding:"12px 14px",border:"1px solid rgba(16,185,129,0.15)"}}><div style={{fontSize:11,color:C.green,fontWeight:600,marginBottom:6,display:"flex",alignItems:"center",gap:5}}><Send size={11}/>Telegram → {tech.telegram}</div><div style={{fontSize:12,color:"#e2e8f0",fontFamily:"monospace",lineHeight:1.7}}>🔧 Назначено ТО<br/>🆔 {machine.id} — {machine.place}<br/>📍 {machine.addr}<br/>📅 Дата: {date||"..."}<br/>⏰ Посл. ТО: {machine.ls}</div></div>}
        <div><label style={{fontSize:11,fontWeight:600,color:C.muted,display:"block",marginBottom:6,letterSpacing:"0.05em",textTransform:"uppercase"}}>Задание</label><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Что проверить, заменить, привезти..." rows={3} style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 13px",color:C.text,fontSize:13,outline:"none",resize:"vertical",fontFamily:"inherit"}}/></div>
      </div>
    </ModalShell>
  );
}

// Send Tech Modal
function SendTechModal({ machine, onClose }) {
  const [techId,setTechId]=useState(""); const [urgency,setUrgency]=useState("normal"); const [problem,setProblem]=useState(""); const [saved,setSaved]=useState(false);
  const tech=TECHNICIANS.find(t=>t.id===parseInt(techId));
  const urgLabel={urgent:"🚨 СРОЧНО",normal:"⚡ Обычный",planned:"📅 Плановый"}[urgency];
  return (
    <ModalShell title="Выезд техника" subtitle={`${machine.id} · ${machine.place} · ${machine.status==="offline"?"Оффлайн":"Ремонт"} ${machine.dt}ч`} steps={["Детали","Отправка"]} step={1} onStep={()=>{}} onClose={onClose} onSave={()=>{setSaved(true);setTimeout(onClose,2000);}} saveLabel="Отправить выезд" saved={saved} savedMsg="Задача создана · Telegram отправлен" accent={C.amber}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div><label style={{fontSize:11,fontWeight:600,color:C.muted,display:"block",marginBottom:8,letterSpacing:"0.05em",textTransform:"uppercase"}}>Срочность</label><div style={{display:"flex",gap:8}}>{[{v:"urgent",l:"🚨 Срочно",c:C.red},{v:"normal",l:"⚡ Обычный",c:C.amber},{v:"planned",l:"📅 Плановый",c:C.muted}].map(u=><button key={u.v} onClick={()=>setUrgency(u.v)} style={{flex:1,padding:"8px",borderRadius:9,cursor:"pointer",fontSize:12,fontWeight:600,background:urgency===u.v?`${u.c}18`:"rgba(255,255,255,0.03)",border:`1px solid ${urgency===u.v?u.c:C.border}`,color:urgency===u.v?u.c:C.muted,transition:"all .15s"}}>{u.l}</button>)}</div></div>
        <Sel label="Назначить технику" value={techId} onChange={setTechId} required options={[{value:"",label:"Выбери техника"},...TECHNICIANS.map(t=>({value:t.id,label:`${t.name} · ${t.phone}`}))]}/>
        <div><label style={{fontSize:11,fontWeight:600,color:C.muted,display:"block",marginBottom:6,letterSpacing:"0.05em",textTransform:"uppercase"}}>Описание проблемы</label><textarea value={problem} onChange={e=>setProblem(e.target.value)} placeholder="Что случилось, симптомы, что нужно проверить..." rows={3} style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 13px",color:C.text,fontSize:13,outline:"none",resize:"vertical",fontFamily:"inherit"}}/></div>
        {tech&&<div style={{background:urgency==="urgent"?"rgba(239,68,68,0.06)":"rgba(0,212,255,0.05)",borderRadius:9,padding:"12px 14px",border:`1px solid ${urgency==="urgent"?"rgba(239,68,68,0.2)":"rgba(0,212,255,0.15)"}`}}><div style={{fontSize:11,color:urgency==="urgent"?C.red:C.cyan,fontWeight:600,marginBottom:6,display:"flex",alignItems:"center",gap:5}}><Send size={11}/>Telegram → {tech.telegram}</div><div style={{fontSize:12,color:"#e2e8f0",fontFamily:"monospace",lineHeight:1.7}}>{urgLabel} Требуется выезд<br/>🆔 {machine.id} — {machine.place}<br/>📍 {machine.addr}<br/>⏱ Простой: {machine.dt} часов<br/>{problem&&`📝 ${problem}`}</div></div>}
      </div>
    </ModalShell>
  );
}

// Add Campaign Modal
function AddCampaignModal({ onClose, onSave, canBudget }) {
  const [step,setStep]=useState(1);
  const [saved,setSaved]=useState(false);
  const [f,setF]=useState({name:"",goal:"",channel:"",start:"",end:"",responsible:"",expLeads:"",expResult:"",budget:"",notes:""});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const selMember=ALL_MKT_MEMBERS.find(m=>m.name===f.responsible);
  const handleSave=()=>{setSaved(true);setTimeout(()=>{onSave(f);onClose();},1500);};
  return (
    <ModalShell title="+ Добавить кампанию" steps={["Цель и сроки","Ответственный","Бюджет","Итог"]} step={step} onStep={setStep} onClose={onClose} onSave={handleSave} saveLabel="Создать кампанию" saved={saved} savedMsg={canBudget?"Кампания активирована":"Ожидает бюджета от финансиста"}>
      {step===1&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
        <Inp label="Название кампании" placeholder="Meta — лиды май 2026" value={f.name} onChange={v=>set("name",v)} required/>
        <div><label style={{fontSize:11,fontWeight:600,color:C.muted,display:"block",marginBottom:6,letterSpacing:"0.05em",textTransform:"uppercase"}}>Цель <span style={{color:C.red}}>*</span></label><textarea value={f.goal} onChange={e=>set("goal",e.target.value)} placeholder="Лиды на франшизу, рост моек, узнаваемость..." rows={3} style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 13px",color:C.text,fontSize:13,outline:"none",resize:"vertical",fontFamily:"inherit"}}/></div>
        <Sel label="Канал" value={f.channel} onChange={v=>set("channel",v)} required options={[{value:"",label:"Выбери канал"},{value:"Meta",label:"Meta (Facebook/Instagram)"},{value:"Яндекс",label:"Яндекс Директ"},{value:"VK",label:"ВКонтакте"},{value:"Google",label:"Google Ads"},{value:"Офлайн",label:"Офлайн / Выставка"},{value:"Мульти",label:"Мультиканальная"}]}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><Inp label="Дата начала" type="date" value={f.start} onChange={v=>set("start",v)} required/><Inp label="Дата окончания" type="date" value={f.end} onChange={v=>set("end",v)} required/></div>
        <Inp label="Ожидаемый результат" placeholder="100 лидов, рост моек +20%..." value={f.expResult} onChange={v=>set("expResult",v)} required/>
        <Inp label="Ожидаемых лидов" type="number" placeholder="100" value={f.expLeads} onChange={v=>set("expLeads",v)}/>
      </div>}
      {step===2&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
        <Sel label="Ответственный" value={f.responsible} onChange={v=>set("responsible",v)} required options={[{value:"",label:"Выбери ответственного"},...ALL_MKT_MEMBERS.map(m=>({value:m.name,label:`${m.name} — ${m.title}`}))]}/>
        {selMember&&<div style={{...CS,background:C.surface2,padding:"14px 16px",borderColor:`${selMember.color}33`}}><div style={{display:"flex",alignItems:"center",gap:12}}><Av initials={selMember.avatar} color={selMember.color} size={40}/><div><div style={{fontSize:14,fontWeight:700,color:"#f0f4ff"}}>{selMember.name}</div><div style={{fontSize:12,color:C.muted}}>{selMember.title}</div>{selMember.email&&<div style={{fontSize:11,color:C.cyan,marginTop:3}}>{selMember.email}</div>}</div></div></div>}
        <div style={{...CS,background:C.surface2,padding:"14px 16px"}}>
          <div style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",marginBottom:12}}>Команда маркетинга</div>
          {[{label:"Руководитель",items:[MARKETING_TEAM.head]},{label:"Менеджеры",items:MARKETING_TEAM.managers},{label:"Персонал",items:MARKETING_TEAM.staff}].map(g=>(
            <div key={g.label} style={{marginBottom:12}}>
              <div style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:7}}>{g.label}</div>
              {g.items.map(m=><div key={m.id} onClick={()=>set("responsible",m.name)} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:8,background:"rgba(255,255,255,0.02)",marginBottom:5,cursor:"pointer",border:`1px solid ${f.responsible===m.name?m.color+"55":C.border}`,transition:"all .15s"}}><Av initials={m.avatar} color={m.color} size={28}/><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:"#e2e8f0"}}>{m.name}</div><div style={{fontSize:10,color:C.muted}}>{m.title}</div></div>{f.responsible===m.name&&<CheckCircle size={14} color={m.color}/>}</div>)}
            </div>
          ))}
        </div>
      </div>}
      {step===3&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
        {!canBudget&&<div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",borderRadius:10,background:"rgba(100,116,139,0.08)",border:"1px solid rgba(100,116,139,0.2)"}}><Lock size={15} color={C.muted}/><div><div style={{fontSize:13,fontWeight:600,color:"#e2e8f0"}}>Бюджет устанавливает финансист</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>Кампания создастся со статусом «Ожидает бюджета»</div></div></div>}
        <Inp label="Бюджет (₽)" type="number" placeholder="50 000" value={f.budget} onChange={v=>set("budget",v)} disabled={!canBudget} required={canBudget} hint={canBudget?"Общий бюджет на кампанию":"Поле доступно только финансисту"}/>
        <div style={{...CS,background:canBudget?"rgba(0,212,255,0.04)":"rgba(245,158,11,0.04)",borderColor:canBudget?"rgba(0,212,255,0.2)":"rgba(245,158,11,0.2)",padding:"14px 16px"}}>
          <div style={{fontSize:11,fontWeight:600,color:canBudget?C.cyan:C.amber,marginBottom:8}}>После сохранения</div>
          <div style={{fontSize:12,color:"#e2e8f0",lineHeight:1.7}}>{canBudget&&f.budget?"✅ Кампания активируется\n📊 Бюджет в финансовом отчёте":"📋 Кампания — статус «Ожидает бюджета»\n💰 Финансист получит уведомление"}<br/>🔔 Уведомление ответственному — {f.responsible||"менеджеру"}</div>
        </div>
      </div>}
      {step===4&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
        {[{l:"Название",v:f.name||"—"},{l:"Цель",v:f.goal||"—"},{l:"Канал",v:f.channel||"—"},{l:"Период",v:f.start&&f.end?`${f.start} → ${f.end}`:"—"},{l:"Ответственный",v:f.responsible||"—"},{l:"Бюджет",v:canBudget&&f.budget?`₽ ${parseInt(f.budget).toLocaleString("ru")}`:"Ожидает финансиста"}].map(r=><div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"9px 13px",borderRadius:9,background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`}}><span style={{fontSize:12,color:C.muted}}>{r.l}</span><span style={{fontSize:12,fontWeight:600,color:"#e2e8f0"}}>{r.v}</span></div>)}
      </div>}
    </ModalShell>
  );
}

// Add Contractor Modal
function AddContractorModal({ onClose, onSave }) {
  const [step,setStep]=useState(1);
  const [saved,setSaved]=useState(false);
  const [f,setF]=useState({company:"",brand:"",inn:"",contactName:"",contactPhone:"",contactEmail:"",machine:"",adType:"",payForm:"",price:"",deferDays:"",deferDate:"",start:"",end:"",responsible:"",contractFile:false,videoFile:false,moderated:false,notes:""});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const isDeferred=f.payForm==="deferred";
  const handleSave=()=>{setSaved(true);setTimeout(()=>{onSave(f);onClose();},1500);};
  return (
    <ModalShell title="+ Добавить контрактора" steps={["Компания","Реклама","Оплата","Финал"]} step={step} onStep={setStep} onClose={onClose} onSave={handleSave} saveLabel="Сохранить контрактора" saved={saved} savedMsg={isDeferred?"Контроль просрочки активирован → юридический отдел":"Договор зафиксирован"} accent={C.amber}>
      {step===1&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><Inp label="Наименование" placeholder="ООО Авторынок" value={f.company} onChange={v=>set("company",v)} required/><Inp label="Бренд" placeholder="АвтоДетали+" value={f.brand} onChange={v=>set("brand",v)} required/></div>
        <Inp label="ИНН" placeholder="7701234567" value={f.inn} onChange={v=>set("inn",v)}/>
        <div style={{...CS,background:C.surface2,padding:"14px 16px"}}><div style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",marginBottom:12}}>Контакт со стороны контрактора</div><div style={{display:"flex",flexDirection:"column",gap:12}}><Inp label="ФИО ответственного" placeholder="Иванов Павел Андреевич" value={f.contactName} onChange={v=>set("contactName",v)} required/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><Inp label="Телефон" type="tel" placeholder="+7 916 111-22-33" value={f.contactPhone} onChange={v=>set("contactPhone",v)}/><Inp label="Email" type="email" placeholder="ivanov@company.ru" value={f.contactEmail} onChange={v=>set("contactEmail",v)}/></div></div></div>
        <UploadZone label="Скан договора" hint="PDF, JPG, PNG · до 10 МБ" icon={FileText} value={f.contractFile} onUpload={()=>set("contractFile",true)}/>
        <Sel label="Ответственный с нашей стороны" value={f.responsible} onChange={v=>set("responsible",v)} required options={[{value:"",label:"Выбери менеджера"},...ALL_MKT_MEMBERS.map(m=>({value:m.name,label:`${m.name} — ${m.title}`}))]}/>
      </div>}
      {step===2&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Sel label="Автомат" value={f.machine} onChange={v=>set("machine",v)} required options={[{value:"",label:"Выбери автомат"},...MACHINES_DB.map(m=>({value:m.id,label:`${m.id} · ${m.place}`}))]}/>
          <Sel label="Вид рекламы" value={f.adType} onChange={v=>set("adType",v)} required options={[{value:"",label:"Выбери формат"},{value:"Экран",label:"🖥 Экран (видео)"},{value:"Баннер",label:"📋 Баннер"},{value:"Листовка",label:"📄 Листовки"},{value:"Аудио",label:"🔊 Аудио"},{value:"Брендинг",label:"✨ Полное брендирование"}]}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><Inp label="Начало" type="date" value={f.start} onChange={v=>set("start",v)} required/><Inp label="Окончание" type="date" value={f.end} onChange={v=>set("end",v)} required/></div>
        <UploadZone label="Рекламный ролик / макет" hint="MP4, GIF, JPG, PNG · до 50 МБ" icon={Video} value={f.videoFile} onUpload={()=>set("videoFile",true)}/>
        <div style={{...CS,background:C.surface2,padding:"14px 16px",borderColor:f.moderated?`${C.green}33`:C.border}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:13,fontWeight:600,color:"#f0f4ff"}}>Прошло модерацию</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>Контент проверен и соответствует требованиям</div></div>
            <div onClick={()=>set("moderated",!f.moderated)} style={{width:42,height:23,borderRadius:99,cursor:"pointer",background:f.moderated?C.green:"rgba(255,255,255,0.08)",border:`1px solid ${f.moderated?C.green:C.border}`,position:"relative",transition:"all .25s",flexShrink:0}}><div style={{position:"absolute",top:3,left:f.moderated?21:3,width:15,height:15,borderRadius:"50%",background:f.moderated?"#001824":C.muted,transition:"left .25s"}}/></div>
          </div>
          {!f.moderated&&<div style={{marginTop:10,fontSize:11,color:C.amber,display:"flex",alignItems:"center",gap:5}}><AlertTriangle size={11}/>Реклама не активируется до модерации</div>}
        </div>
      </div>}
      {step===3&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
        <Inp label="Стоимость (₽/мес)" type="number" placeholder="8 000" value={f.price} onChange={v=>set("price",v)} required/>
        <Sel label="Форма оплаты" value={f.payForm} onChange={v=>set("payForm",v)} required options={[{value:"",label:"Выбери форму"},{value:"prepay",label:"💳 Предоплата 100%"},{value:"postpay",label:"📅 Постоплата"},{value:"deferred",label:"⏰ Оплата с отсрочкой"},{value:"monthly",label:"🔄 Ежемесячно"}]}/>
        {isDeferred&&<div style={{...CS,background:"rgba(245,158,11,0.06)",borderColor:"rgba(245,158,11,0.25)",padding:"14px 16px"}}>
          <div style={{fontSize:11,fontWeight:600,color:C.amber,marginBottom:10}}>Параметры отсрочки</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><Inp label="Дней отсрочки" type="number" placeholder="14" value={f.deferDays} onChange={v=>set("deferDays",v)}/><Inp label="Крайний срок" type="date" value={f.deferDate} onChange={v=>set("deferDate",v)}/></div>
          <div style={{marginTop:12,padding:"10px 14px",borderRadius:9,background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.2)"}}><div style={{fontSize:11,fontWeight:600,color:C.red,marginBottom:5,display:"flex",alignItems:"center",gap:5}}><AlertTriangle size={11}/>При просрочке оплаты</div><div style={{fontSize:11,color:"#e2e8f0",lineHeight:1.6}}>🚨 Сигнал в юридический отдел<br/>📋 Задача для юриста создаётся автоматически<br/>🔔 Уведомление руководителю</div></div>
        </div>}
      </div>}
      {step===4&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
        {[{l:"Компания",v:f.company||"—"},{l:"Бренд",v:f.brand||"—"},{l:"Контакт",v:f.contactName?`${f.contactName} · ${f.contactPhone}`:"—"},{l:"Автомат",v:f.machine||"—"},{l:"Вид рекламы",v:f.adType||"—"},{l:"Период",v:f.start&&f.end?`${f.start} → ${f.end}`:"—"},{l:"Стоимость",v:f.price?`₽ ${parseInt(f.price).toLocaleString("ru")}/мес`:"—"},{l:"Оплата",v:f.payForm||"—"},{l:"Модерация",v:f.moderated?"✅ Прошло":"⏳ Не прошло"},{l:"Договор",v:f.contractFile?"📎 Прикреплён":"Не загружен"}].map(r=><div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",borderRadius:8,background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`}}><span style={{fontSize:12,color:C.muted}}>{r.l}</span><span style={{fontSize:12,fontWeight:600,color:"#e2e8f0"}}>{r.v}</span></div>)}
        {isDeferred&&<div style={{padding:"10px 14px",borderRadius:9,background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.2)"}}><div style={{fontSize:11,color:C.red,fontWeight:600,display:"flex",alignItems:"center",gap:5}}><AlertTriangle size={11}/>Контроль просрочки активирован → юридический отдел</div></div>}
      </div>}
    </ModalShell>
  );
}

// ─── SECTIONS ─────────────────────────────────────────────────────────────────

function OverviewSection() {
  const online=MACHINES_DB.filter(m=>m.status==="online").length;
  const totalW=MACHINES_DB.reduce((s,m)=>s+m.wd,0);
  const totalR=MACHINES_DB.reduce((s,m)=>s+m.rd,0);
  const totalDt=MACHINES_DB.reduce((s,m)=>s+m.dt,0);
  return (
    <Section title="Обзор · CEO" subtitle="Нажми на карточку — провалишься в детали" render={({current,drill})=>{
      if(current==="root") return <div>
        <div style={{padding:"10px 16px",borderRadius:10,marginBottom:22,border:"1px solid rgba(239,68,68,.25)",background:"rgba(239,68,68,.07)",display:"flex",alignItems:"center",gap:10}}><AlertTriangle size={13} color={C.red}/><span style={{fontSize:12,color:"#fca5a5"}}>AW-003 оффлайн 14ч · AW-004 в ремонте 48ч</span></div>
        <p style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>Автоматы</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:22}}>
          <DrillCard label="Online / Offline" value={`${online} / ${MACHINES_DB.length-online}`} accent={C.green} icon={Wifi} onClick={()=>drill("status","Статус автоматов")}/>
          <DrillCard label="Часов простоя" value={`${totalDt} ч`} trend="+18%" trendUp={false} accent={C.red} icon={Clock} onClick={()=>drill("downtime","Простой")}/>
          <DrillCard label="Uptime средний" value="88.9%" accent={C.purple} icon={Activity} onClick={()=>drill("uptime","Uptime")}/>
        </div>
        <p style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>Выручка и мойки</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:22}}>
          <DrillCard label="Моек сегодня" value={totalW} trend="+12%" trendUp accent={C.cyan} icon={Droplets} onClick={()=>drill("washes","Мойки · аналитика")}/>
          <DrillCard label="Выручка сегодня" value={`₽ ${totalR.toLocaleString("ru")}`} trend="+9%" trendUp accent={C.green} icon={DollarSign} mono onClick={()=>drill("revenue","Выручка · детали")}/>
          <DrillCard label="Выручка (месяц)" value="₽ 1 001 000" trend="+8%" trendUp accent={C.green} icon={TrendingUp} mono onClick={()=>drill("revenue-month","Выручка месяц")}/>
        </div>
        <div style={{...CS}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em"}}>Выручка по направлениям · 4 месяца</div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={REV_CHART} margin={{left:-10}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
              <XAxis dataKey="m" tick={{fill:"#475569",fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#475569",fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}к`}/>
              <Tooltip contentStyle={{background:"#1a2235",border:`1px solid ${C.border}`,borderRadius:8,color:"#f0f4ff",fontSize:11}} formatter={v=>[`₽ ${v.toLocaleString("ru")}`,""]}/>
              <Bar dataKey="a" name="Автоматы" fill={C.cyan}   radius={[4,4,0,0]}/>
              <Bar dataKey="ad" name="Реклама"  fill={C.amber}  radius={[4,4,0,0]}/>
              <Bar dataKey="f"  name="Франшиза" fill={C.purple} radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>;

      if(current==="status") return <div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
          {[{label:"Online",val:MACHINES_DB.filter(m=>m.status==="online").length,color:C.green},{label:"Offline",val:MACHINES_DB.filter(m=>m.status==="offline").length,color:C.red},{label:"Ремонт",val:MACHINES_DB.filter(m=>m.status==="repair").length,color:C.amber}].map(s=><div key={s.label} style={{...CS,textAlign:"center",borderColor:`${s.color}33`}}><div style={{fontSize:32,fontWeight:700,color:s.color}}>{s.val}</div><div style={{fontSize:12,color:C.muted,marginTop:4}}>{s.label}</div></div>)}
        </div>
        <div style={{...CS}}><div style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:14,textTransform:"uppercase",letterSpacing:"0.06em"}}>Все автоматы</div>
          {MACHINES_DB.map(m=><div key={m.id} onClick={()=>drill(`machine-${m.id}`,`${m.id} · ${m.place}`)} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:9,background:"rgba(255,255,255,0.02)",marginBottom:7,cursor:"pointer",border:`1px solid ${C.border}`,transition:"all .15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=`${C.cyan}44`} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
            <MPill status={m.status}/><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"#f0f4ff"}}>{m.id} · {m.place}</div><div style={{fontSize:11,color:C.muted,marginTop:1}}>{m.addr}</div></div>
            <div style={{textAlign:"right",flexShrink:0}}><div style={{fontSize:12,color:C.cyan,fontWeight:700}}>{m.wd} моек</div>{m.dt>0&&<div style={{fontSize:11,color:C.red}}>простой {m.dt}ч</div>}</div>
            <ChevronRight size={13} color={C.dim}/>
          </div>)}
        </div>
      </div>;

      if(current==="washes") return <div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
          <Stat label="Моек сегодня" value={totalW} color={C.cyan}/><Stat label="Лучший" value="AW-005 · 112" color={C.green}/><Stat label="Не работают" value="AW-003, 004" color={C.red}/>
        </div>
        <div style={{...CS,marginBottom:14}}><div style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:14,textTransform:"uppercase",letterSpacing:"0.06em"}}>Рейтинг моек · сегодня</div>
          {[...MACHINES_DB].sort((a,b)=>b.wd-a.wd).map((m,i)=><div key={m.id} onClick={()=>drill(`machine-${m.id}`,`${m.id} · ${m.place}`)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:9,background:"rgba(255,255,255,0.02)",marginBottom:7,cursor:"pointer",border:`1px solid ${C.border}`,transition:"all .15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=`${C.cyan}44`} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
            <div style={{width:22,height:22,borderRadius:"50%",background:`${C.cyan}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:C.cyan,flexShrink:0}}>{i+1}</div>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"#f0f4ff"}}>{m.id} · {m.place}</div><div style={{marginTop:4}}><PBar value={m.wd/120*100} color={m.wd>0?C.cyan:C.dim}/></div></div>
            <MPill status={m.status}/>
            <div style={{fontSize:18,fontWeight:700,color:m.wd>0?C.cyan:C.dim,minWidth:40,textAlign:"right"}}>{m.wd}</div>
            <ChevronRight size={13} color={C.dim}/>
          </div>)}
        </div>
        <div style={{...CS}}><div style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:14,textTransform:"uppercase",letterSpacing:"0.06em"}}>Тренд · 7 дней</div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={WASHES_TREND} margin={{left:-20,right:5,top:5}}>
              <defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.cyan} stopOpacity={0.2}/><stop offset="95%" stopColor={C.cyan} stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
              <XAxis dataKey="d" tick={{fill:"#475569",fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#475569",fontSize:9}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:"#1a2235",border:`1px solid ${C.border}`,borderRadius:8,color:"#f0f4ff",fontSize:11}}/>
              <Area type="monotone" dataKey="w" stroke={C.cyan} strokeWidth={2} fill="url(#wg)" name="Мойки"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>;

      if(current==="revenue"||current==="revenue-month") {
        const key=current==="revenue"?"rd":"rm";
        const sum=MACHINES_DB.reduce((s,m)=>s+m[key],0);
        return <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
            <Stat label="Итого" value={`₽ ${sum.toLocaleString("ru")}`} color={C.green}/><Stat label="Лучший" value="AW-005" color={C.cyan}/><Stat label="₽/мойка" value="₽ 100" color={C.purple}/>
          </div>
          <div style={{...CS}}><div style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:14,textTransform:"uppercase",letterSpacing:"0.06em"}}>Рейтинг по выручке</div>
            {[...MACHINES_DB].sort((a,b)=>b[key]-a[key]).map((m,i)=><div key={m.id} onClick={()=>drill(`machine-${m.id}`,`${m.id} · ${m.place}`)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:9,background:"rgba(255,255,255,0.02)",marginBottom:7,cursor:"pointer",border:`1px solid ${C.border}`,transition:"all .15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=`${C.green}44`} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
              <div style={{width:22,height:22,borderRadius:"50%",background:`${C.green}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:C.green,flexShrink:0}}>{i+1}</div>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"#f0f4ff"}}>{m.id} · {m.place}</div><div style={{marginTop:4}}><PBar value={m[key]/(key==="rd"?11200:289000)*100} color={m[key]>0?C.green:C.dim}/></div></div>
              <div style={{fontSize:15,fontWeight:700,color:m[key]>0?C.green:C.dim,fontFamily:"monospace",flexShrink:0}}>₽{(m[key]/1000).toFixed(1)}к</div>
              <ChevronRight size={13} color={C.dim}/>
            </div>)}
          </div>
        </div>;
      }

      if(current==="downtime") return <div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
          <Stat label="Простой сегодня" value={`${totalDt} ч`} color={C.red}/><Stat label="Упущено выручки" value="₽ 6 200" color={C.red}/><Stat label="Упущено моек" value="62" color={C.amber}/>
        </div>
        <div style={{...CS}}><div style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:14,textTransform:"uppercase",letterSpacing:"0.06em"}}>Простой по автоматам</div>
          {MACHINES_DB.map(m=><div key={m.id} onClick={()=>drill(`machine-${m.id}`,`${m.id} · ${m.place}`)} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:9,background:"rgba(255,255,255,0.02)",marginBottom:7,cursor:"pointer",border:`1px solid ${C.border}`,transition:"all .15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=`${m.dt>0?C.red:C.green}44`} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
            <MPill status={m.status}/><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"#f0f4ff"}}>{m.id} · {m.place}</div>{m.dt>0&&<div style={{marginTop:4}}><PBar value={m.dt/48*100} color={C.red}/></div>}</div>
            <div style={{fontSize:16,fontWeight:700,color:m.dt>0?C.red:C.green,minWidth:55,textAlign:"right"}}>{m.dt>0?`${m.dt} ч`:"OK"}</div>
            <ChevronRight size={13} color={C.dim}/>
          </div>)}
        </div>
      </div>;

      if(current==="uptime") return <div style={{...CS}}><div style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:14,textTransform:"uppercase",letterSpacing:"0.06em"}}>Uptime по автоматам</div>
        {[...MACHINES_DB].sort((a,b)=>b.up-a.up).map((m,i)=><div key={m.id} onClick={()=>drill(`machine-${m.id}`,`${m.id} · ${m.place}`)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:9,background:"rgba(255,255,255,0.02)",marginBottom:7,cursor:"pointer",border:`1px solid ${C.border}`,transition:"all .15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=`${C.purple}44`} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"#f0f4ff"}}>{m.id} · {m.place}</div><div style={{marginTop:5}}><PBar value={m.up} color={m.up>90?C.green:m.up>70?C.amber:C.red}/></div></div>
          <MPill status={m.status}/><div style={{fontSize:16,fontWeight:700,color:m.up>90?C.green:m.up>70?C.amber:C.red,minWidth:55,textAlign:"right"}}>{m.up}%</div>
          <ChevronRight size={13} color={C.dim}/>
        </div>)}
      </div>;

      if(current.startsWith("machine-")) {
        const mid=current.replace("machine-","");
        const m=MACHINES_DB.find(x=>x.id===mid)||MACHINES_DB[0];
        const sc={online:C.green,offline:C.red,repair:C.amber}[m.status];
        return <div>
          <div style={{...CS,marginBottom:14,borderColor:`${sc}33`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}><div><div style={{fontSize:18,fontWeight:700,color:"#f0f4ff"}}>{m.id} · {m.place}</div><div style={{display:"flex",alignItems:"center",gap:8,marginTop:5}}><MPill status={m.status}/><span style={{fontSize:12,color:C.muted}}>{m.addr}</span></div></div></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              <Stat label="Моек сегодня" value={m.wd} color={C.cyan}/><Stat label="Моек за месяц" value={m.wm.toLocaleString("ru")} color={C.cyan}/><Stat label="Простой" value={`${m.dt} ч`} color={m.dt>0?C.red:C.green}/>
              <Stat label="Выр./день" value={`₽ ${m.rd.toLocaleString("ru")}`} color={C.green}/><Stat label="Выр./месяц" value={`₽ ${(m.rm/1000).toFixed(0)}к`} color={C.green}/><Stat label="Uptime" value={`${m.up}%`} color={m.up>90?C.green:C.amber}/>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div style={{...CS}}><div style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",marginBottom:12}}>Аренда</div>{[{l:"Место",v:m.place},{l:"Адрес",v:m.addr},{l:"Аренда/мес.",v:`₽ ${m.rent.toLocaleString("ru")}`}].map(f=><div key={f.l} style={{marginBottom:8}}><div style={{fontSize:10,color:C.dim}}>{f.l}</div><div style={{fontSize:13,color:"#e2e8f0",marginTop:1}}>{f.v}</div></div>)}</div>
            <div style={{...CS}}><div style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",marginBottom:12}}>ТО</div>{[{l:"Последнее ТО",v:m.ls},{l:"Плановое ТО",v:m.ns}].map(f=><div key={f.l} style={{marginBottom:8}}><div style={{fontSize:10,color:C.dim}}>{f.l}</div><div style={{fontSize:13,color:"#e2e8f0",marginTop:1}}>{f.v}</div></div>)}{m.status!=="online"&&<div style={{padding:"8px 12px",borderRadius:8,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)"}}><div style={{fontSize:12,color:C.red,fontWeight:600}}>{m.status==="offline"?`⚠ Оффлайн ${m.dt}ч`:`🔧 Ремонт ${m.dt}ч`}</div></div>}</div>
          </div>
        </div>;
      }
      return <div style={{color:C.muted,padding:40,textAlign:"center"}}>Раздел в разработке</div>;
    }}/>
  );
}

function MachinesSection({ user }) {
  // ── финансы аппаратов─
  // Zoho removed — using local data

  // ── mock machine list (телеметрия будет позже) ────────────────────────────
  const [machines, setMachines] = useState(MACHINES_DB);
  const [showAdd, setShowAdd]   = useState(false);
  const [toMachine, setToMachine]   = useState(null);
  const [techMachine, setTechMachine] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid | table | revenue

  // ── финансы из сделок
  const contractDeals = [].filter(d =>
    d.Stage && (d.Stage.includes('Contract') || d.Stage.includes('Won') || d.Stage.includes('Closed'))
  );
  const totalZohoRevenue = 0;
  const totalZohoDeals   = 0;
  const wonZohoDeals     = contractDeals.length;

  // выручка по месяцам
  const revenueByMonth = {};
  [].forEach(d => {
    if(!d.Closing_Date) return;
    const m = d.Closing_Date.slice(0,7);
    revenueByMonth[m] = (revenueByMonth[m]||0) + (parseFloat(d.Amount)||0);
  });
  const monthChartData = Object.entries(revenueByMonth)
    .sort(([a],[b]) => a.localeCompare(b))
    .slice(-6)
    .map(([m,v]) => ({
      name: m.slice(5), // MM
      rev: Math.round(v/1000000), // млн Rp
    }));

  // топ менеджеры по сделкам
  const managerDeals = {};
  [].forEach(d => {
    const name = d.Owner?.name || 'Unknown';
    managerDeals[name] = (managerDeals[name]||0) + 1;
  });

  // ── локации
  const zohoLocations = MACHINES_DB.map(a => ({
    id: a.id,
    name: a.place || a.id,
    type: a.status === 'online' ? 'Online' : a.status === 'repair' ? 'Ремонт' : 'Offline',
    status: a.status,
    city: a.city || a.addr || '—',
    wm: a.wm || 0,
    rm: a.rm || 0,
    up: a.up || 0,
    notes: a.notes || '',
  }));

  // ── mock агрегация (до появления телеметрии) ───────────────────────────────
  const total      = machines.length;
  const online     = machines.filter(m => m.status === 'online');
  const offline    = machines.filter(m => m.status === 'offline');
  const repair     = machines.filter(m => m.status === 'repair');

  const totalRevMonth = machines.reduce((s, m) => s + m.rm,  0);
  const totalRent     = machines.reduce((s, m) => s + (m.rent || 0), 0);
  const avgUptime     = machines.length
    ? (machines.reduce((s, m) => s + m.up, 0) / machines.length).toFixed(1) : 0;

  const revenueChartData = machines.map(m => ({
    name: m.id,
    revenue: Math.round(m.rm / 1000),
    rent: Math.round((m.rent || 0) / 1000),
    net: Math.round((m.rm - (m.rent || 0)) / 1000),
    washes: m.wm,
  }));

  const fmtRp = n => n >= 1000000000
    ? `${(n/1000000000).toFixed(2)} млрд Rp`
    : n >= 1000000 ? `${(n/1000000).toFixed(1)} млн Rp`
    : `${(n/1000).toFixed(0)}к Rp`;

  const fmt = n => n >= 1000000
    ? `${(n/1000000).toFixed(2)} млн ₽`
    : n >= 1000 ? `${(n/1000).toFixed(0)}к ₽` : `${n} ₽`;

  return (
    <Section title="Автоматы" subtitle="Количество · Выручка · Аналитика" render={({ current, drill }) => {
      // ── DRILL: конкретный аппарат ────────────────────────────────────────
      if (current?.startsWith('m-')) {
        const mid = current.replace('m-', '');
        const m   = machines.find(x => x.id === mid);
        if (!m) return null;
        const shareRev = totalRevMonth > 0 ? ((m.rm / totalRevMonth) * 100).toFixed(1) : 0;
        return (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
              <div>
                <div style={{ fontSize:22, fontWeight:800, color:'#f0f4ff' }}>{m.id} — {m.place}</div>
                <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>{m.addr}</div>
              </div>
              <MPill status={m.status}/>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
              {[
                { l:'Моек/день', v:m.wd, c:C.cyan, sub:`${m.wm} за месяц` },
                { l:'Выручка/день', v:`₽${(m.rd/1000).toFixed(1)}к`, c:C.green, sub:`₽${(m.rm/1000).toFixed(0)}к/мес` },
                { l:'Uptime', v:`${m.up}%`, c:m.up>95?C.green:m.up>80?C.amber:C.red, sub:`Простой ${m.dt}ч` },
                { l:'Доля выручки', v:`${shareRev}%`, c:C.purple, sub:'от всего парка' },
              ].map(s=>(
                <div key={s.l} style={{...CS, textAlign:'center'}}>
                  <div style={{fontSize:10,color:C.muted,marginBottom:6,textTransform:'uppercase'}}>{s.l}</div>
                  <div style={{fontSize:22,fontWeight:800,color:s.c}}>{s.v}</div>
                  <div style={{fontSize:11,color:C.dim,marginTop:4}}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
              <div style={CS}>
                <div style={{fontSize:11,color:C.muted,marginBottom:12,textTransform:'uppercase',fontWeight:600}}>Данные аппарата</div>
                {[
                  ['Адрес', m.addr],
                  ['Техник', m.tech],
                  ['Аренда/мес', `₽${(m.rent/1000).toFixed(0)}к`],
                  ['Последнее ТО', m.ls],
                  ['Следующее ТО', m.ns],
                ].map(([k,v])=>(
                  <div key={k} style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                    <span style={{color:C.muted,fontSize:12}}>{k}</span>
                    <span style={{color:C.text,fontSize:12,fontWeight:600}}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={CS}>
                <div style={{fontSize:11,color:C.muted,marginBottom:12,textTransform:'uppercase',fontWeight:600}}>P&L за месяц</div>
                {[
                  ['Выручка', `₽${(m.rm/1000).toFixed(0)}к`, C.green],
                  ['Аренда', `-₽${(m.rent/1000).toFixed(0)}к`, C.red],
                  ['Чистыми', `₽${((m.rm-m.rent)/1000).toFixed(0)}к`, C.cyan],
                ].map(([k,v,c])=>(
                  <div key={k} style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                    <span style={{color:C.muted,fontSize:12}}>{k}</span>
                    <span style={{color:c,fontSize:13,fontWeight:700}}>{v}</span>
                  </div>
                ))}
                <div style={{marginTop:8, padding:'8px 0', borderTop:`1px solid ${C.border}`}}>
                  <PBar value={((m.rm-m.rent)/m.rm*100)} color={C.cyan}/>
                </div>
              </div>
            </div>
            <div style={{display:'flex',gap:10}}>
              <Btn variant="primary" onClick={()=>setToMachine(m)}><Truck size={14}/>Назначить ТО</Btn>
              <Btn variant="ghost" onClick={()=>setTechMachine(m)}><Wrench size={14}/>Вызов техника</Btn>
              <a href={m.mapsUrl} target="_blank" rel="noreferrer" style={{textDecoration:'none'}}>
                <Btn variant="ghost"><MapPin size={14}/>На карте</Btn>
              </a>
            </div>
          </div>
        );
      }

      // ── DRILL: локация
      if (current?.startsWith('loc-')) {
        const locId = current.replace('loc-','');
        const loc = zohoLocations.find(l=>l.id===locId);
        if(!loc) return null;
        const locDeals = [].filter(d=>d.Account_Name?.id===locId || d.Account_Name?.name===loc.name);
        return (
          <div>
            <div style={{fontSize:22,fontWeight:800,color:'#f0f4ff',marginBottom:4}}>{loc.name}</div>
            <div style={{fontSize:12,color:C.muted,marginBottom:20}}>{loc.type} · {loc.city}</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
              <div style={CS}>
                {[['Статус',loc.type],['Город',loc.city],['Выручка за 30 дней',`${loc.rm.toLocaleString('ru')} Rp`],['Дней с мойками (30 дн)',`${Math.round(loc.up*30/100)} / 30`]].map(([k,v])=>(
                  <div key={k} style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                    <span style={{color:C.muted,fontSize:12}}>{k}</span>
                    <span style={{color:C.text,fontSize:12,fontWeight:600}}>{v}</span>
                  </div>
                ))}
                {loc.notes && <div style={{fontSize:11,color:C.dim,marginTop:8,paddingTop:8,borderTop:`1px solid ${C.border}`}}>{loc.notes}</div>}
              </div>
              <div style={CS}>
                <div style={{fontSize:11,color:C.muted,marginBottom:12,textTransform:'uppercase'}}>Мойки за 30 дней</div>
                <div style={{fontSize:28,fontWeight:800,color:C.cyan}}>{loc.wm}</div>
                <div style={{fontSize:12,color:C.muted}}>~{(loc.wm/30).toFixed(1)} в день</div>
              </div>
            </div>
          </div>
        );
      }

      // ── MAIN LIST ─────────────────────────────────────────────────────────
      return (
        <div>
          {/* ── финансы ─────────────────────────────────────────────────── */}
          <div style={{...CS, marginBottom:16, border:`1px solid ${C.cyan}22`, background:`${C.cyan}06`}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:C.cyan,boxShadow:`0 0 6px ${C.cyan}`}}/>
              <span style={{fontSize:11,color:C.cyan,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>
                Финансы
              </span>
              {false && <Loader size={12} style={{color:C.cyan}}/>}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
              {[
                { l:'Автоматов',           v:total,                                        c:C.cyan,  sub:'всего в сети' },
                { l:'Online / Offline',    v:`${online.length} / ${offline.length+repair.length}`, c:C.green, sub:'по последней мойке' },
                { l:'Моек за 30 дней',     v:machines.reduce((s,m)=>s+(m.wm||0),0),        c:C.blue,  sub:'платные + промо' },
                { l:'Выручка за 30 дней',  v:fmtRp(totalRevMonth),                         c:C.amber, sub:'Rp · продажи' },
              ].map(s=>(
                <div key={s.l} style={{textAlign:'center'}}>
                  <div style={{fontSize:10,color:C.muted,marginBottom:4,textTransform:'uppercase'}}>{s.l}</div>
                  <div style={{fontSize:20,fontWeight:800,color:s.c}}>{s.v}</div>
                  <div style={{fontSize:10,color:C.dim}}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── выручка по месяцам ────────────────────────────────────── */}
          {monthChartData.length > 0 && (
            <div style={{...CS, marginBottom:16}}>
              <div style={{fontSize:12,color:C.muted,marginBottom:12,fontWeight:600}}>Выручка по месяцам (млн Rp)</div>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={monthChartData} barSize={28}>
                  <XAxis dataKey="name" tick={{fontSize:10,fill:C.muted}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:10,fill:C.muted}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,fontSize:11}}
                    formatter={v=>[`${v} млн Rp`,'Выручка']}/>
                  <Bar dataKey="rev" fill={C.green} radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── локации ────────────────────────────────────────────────── */}
          <div style={{...CS, marginBottom:16}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:600,color:C.text}}>Локации ({zohoLocations.length})</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:8}}>
              {zohoLocations.map(loc=>(
                <div key={loc.id} onClick={()=>drill('loc-'+loc.id)}
                  style={{padding:'10px 12px',background:`${C.cyan}08`,border:`1px solid ${C.cyan}22`,
                    borderRadius:10,cursor:'pointer',transition:'all .15s'}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=`${C.cyan}55`}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=`${C.cyan}22`}>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}>
                    <div style={{width:7,height:7,borderRadius:'50%',flexShrink:0,background:loc.status==='online'?C.green:loc.status==='repair'?C.amber:C.red}}/>
                    <div style={{fontSize:12,fontWeight:700,color:C.text}}>{loc.name}</div>
                  </div>
                  <div style={{fontSize:11,color:C.muted}}>{loc.city}</div>
                  <div style={{fontSize:10,color:C.dim,marginTop:2}}>{loc.wm} моек · {Math.round(loc.rm/1000)}к Rp за 30 дн</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── топ менеджеры ──────────────────────────────────────────── */}
          <div style={{...CS, marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:600,color:C.text,marginBottom:12}}>Менеджеры по сделкам</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {Object.entries(managerDeals).sort(([,a],[,b])=>b-a).map(([name,cnt])=>(
                <div key={name} style={{display:'flex',alignItems:'center',gap:10}}>
                  <Av initials={name.split(' ').map(p=>p[0]).join('').slice(0,2)} color={C.blue} size={28}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:600,color:C.text}}>{name}</div>
                    <PBar value={cnt/totalZohoDeals*100} color={C.blue} h={4}/>
                  </div>
                  <div style={{fontSize:12,fontWeight:700,color:C.cyan}}>{cnt}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── разделитель: mock телеметрия ───────────────────────────── */}
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
            <div style={{flex:1,height:1,background:C.border}}/>
            <div style={{display:'flex',alignItems:'center',gap:6,padding:'4px 12px',
              border:`1px solid ${C.amber}44`,borderRadius:99,background:`${C.amber}0a`}}>
              <AlertTriangle size={12} style={{color:C.amber}}/>
              <span style={{fontSize:11,color:C.amber,fontWeight:600}}>
                Телеметрия — demo данные (API аппаратов не подключён)
              </span>
            </div>
            <div style={{flex:1,height:1,background:C.border}}/>
          </div>

          {/* ── KPI mock ────────────────────────────────────────────────── */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:16}}>
            {[
              { l:'Аппаратов',    v:total,                         c:C.cyan,   ic:<Cpu size={14}/> },
              { l:'Онлайн',       v:online.length,                 c:C.green,  ic:<CheckCircle size={14}/> },
              { l:'Оффлайн',      v:offline.length,                c:C.red,    ic:<WifiOff size={14}/> },
              { l:'Ремонт',       v:repair.length,                 c:C.amber,  ic:<Wrench size={14}/> },
              { l:'Avg uptime',   v:`${avgUptime}%`,               c:C.purple, ic:<Activity size={14}/> },
            ].map(s=>(
              <div key={s.l} style={{...CS, textAlign:'center'}}>
                <div style={{color:s.c,display:'flex',justifyContent:'center',marginBottom:6}}>{s.ic}</div>
                <div style={{fontSize:24,fontWeight:800,color:s.c}}>{s.v}</div>
                <div style={{fontSize:10,color:C.muted,textTransform:'uppercase'}}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* ── view toggle ─────────────────────────────────────────────── */}
          <div style={{display:'flex',gap:8,marginBottom:16}}>
            {[['grid','Сетка'],['table','Таблица'],['revenue','Выручка']].map(([m,l])=>(
              <Btn key={m} variant={viewMode===m?'primary':'ghost'} onClick={()=>setViewMode(m)}>{l}</Btn>
            ))}
            <div style={{flex:1}}/>
            {(user?.role==='ceo'||user?.role==='tech') &&
              <Btn variant="success" onClick={()=>setShowAdd(true)}><Plus size={14}/>Добавить аппарат</Btn>}
          </div>

          {/* ── grid view ───────────────────────────────────────────────── */}
          {viewMode==='grid' && (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14}}>
              {machines.map(m=>{
                const net = m.rm - (m.rent||0);
                return (
                  <div key={m.id} onClick={()=>drill('m-'+m.id)}
                    style={{...CS, cursor:'pointer', transition:'all .2s',
                      borderColor: m.status==='online'?`${C.green}33`:m.status==='repair'?`${C.amber}44`:`${C.red}33`}}
                    onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
                    onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                      <div>
                        <div style={{fontWeight:700,fontSize:15,color:'#e2e8f0'}}>{m.id}</div>
                        <div style={{fontSize:11,color:C.muted,marginTop:2}}>{m.place}</div>
                      </div>
                      <MPill status={m.status}/>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:10}}>
                      <Stat label="Моек/мес" value={m.wm} color={C.cyan}/>
                      <Stat label="Чистыми" value={`₽${(net/1000).toFixed(0)}к`} color={net>0?C.green:C.red}/>
                    </div>
                    <div style={{marginBottom:6}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                        <span style={{fontSize:10,color:C.muted}}>Uptime</span>
                        <span style={{fontSize:10,color:C.muted}}>{m.up}%</span>
                      </div>
                      <PBar value={m.up} color={m.up>95?C.green:m.up>80?C.amber:C.red}/>
                    </div>
                    <div style={{fontSize:10,color:C.dim}}>ТО: {m.ns} · {m.tech}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── table view ──────────────────────────────────────────────── */}
          {viewMode==='table' && (
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                <thead>
                  <tr style={{borderBottom:`1px solid ${C.border}`}}>
                    {['ID','Место','Статус','Моек/мес','Выручка/мес','Аренда','Чистыми','Uptime','Техник'].map(h=>(
                      <th key={h} style={{textAlign:'left',padding:'8px 10px',color:C.muted,fontWeight:600,whiteSpace:'nowrap'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {machines.map(m=>{
                    const net = m.rm-(m.rent||0);
                    return (
                      <tr key={m.id} onClick={()=>drill('m-'+m.id)}
                        style={{borderBottom:`1px solid ${C.border}`,cursor:'pointer'}}
                        onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.03)'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <td style={{padding:'10px',fontWeight:700,color:C.cyan}}>{m.id}</td>
                        <td style={{padding:'10px',color:C.text}}>{m.place}</td>
                        <td style={{padding:'10px'}}><MPill status={m.status}/></td>
                        <td style={{padding:'10px',color:C.cyan}}>{m.wm}</td>
                        <td style={{padding:'10px',color:C.green}}>₽{(m.rm/1000).toFixed(0)}к</td>
                        <td style={{padding:'10px',color:C.red}}>₽{((m.rent||0)/1000).toFixed(0)}к</td>
                        <td style={{padding:'10px',color:net>0?C.green:C.red,fontWeight:700}}>₽{(net/1000).toFixed(0)}к</td>
                        <td style={{padding:'10px'}}>
                          <div style={{display:'flex',alignItems:'center',gap:6}}>
                            <PBar value={m.up} color={m.up>95?C.green:m.up>80?C.amber:C.red} h={4}/>
                            <span style={{fontSize:10,color:C.muted,whiteSpace:'nowrap'}}>{m.up}%</span>
                          </div>
                        </td>
                        <td style={{padding:'10px',color:C.muted}}>{m.tech}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── revenue chart ────────────────────────────────────────────── */}
          {viewMode==='revenue' && (
            <div style={CS}>
              <div style={{fontSize:12,fontWeight:600,color:C.muted,marginBottom:12}}>Выручка / Аренда / Чистыми (тыс ₽ · mock)</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={revenueChartData} barSize={14}>
                  <XAxis dataKey="name" tick={{fontSize:10,fill:C.muted}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:10,fill:C.muted}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,fontSize:11}}
                    formatter={(v,n)=>[`${v}к ₽`, n==='revenue'?'Выручка':n==='rent'?'Аренда':'Чистыми']}/>
                  <Bar dataKey="revenue" fill={C.green}  radius={[3,3,0,0]} name="revenue"/>
                  <Bar dataKey="rent"    fill={C.red}    radius={[3,3,0,0]} name="rent"/>
                  <Bar dataKey="net"     fill={C.cyan}   radius={[3,3,0,0]} name="net"/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {showAdd && <AddMachineModal onClose={()=>setShowAdd(false)}/>}
          {toMachine && <TOModal machine={toMachine} onClose={()=>setToMachine(null)}/>}
          {techMachine && <TechDispatchModal machine={techMachine} onClose={()=>setTechMachine(null)}/>}
        </div>
      );
    }}/>
  );
}

function MarketingSection({ user }) {
  const crm=useCrm();
  const canBudget=CAN_EDIT_BUDGET.includes(user?.role);
  const [campaigns,setCampaigns]=useState(initCampaigns);
  const [showAddCamp,setShowAddCamp]=useState(false);
  const [tab,setTab]=useState("campaigns");
  const stC={active:{c:C.green,l:"Активна"},planned:{c:C.cyan,l:"Запланирована"},completed:{c:C.muted,l:"Завершена"}};
  const totalBudget=campaigns.reduce((s,c)=>s+c.budget,0);
  const totalSpent=campaigns.reduce((s,c)=>s+c.spent,0);
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
        <div><h2 style={{margin:0,fontSize:20,fontWeight:700,color:"#f0f4ff",letterSpacing:"-0.02em"}}>Маркетинг</h2><p style={{margin:"3px 0 0",fontSize:12,color:C.muted}}>Кампании, команда, бюджеты</p></div>
        {tab==="campaigns"&&<Btn variant="primary" onClick={()=>setShowAddCamp(true)}><Plus size={13}/>Добавить кампанию</Btn>}
      </div>

      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:9,marginBottom:18,background:canBudget?"rgba(16,185,129,0.07)":"rgba(100,116,139,0.07)",border:`1px solid ${canBudget?"rgba(16,185,129,0.2)":"rgba(100,116,139,0.15)"}`}}>
        {canBudget?<Unlock size={13} color={C.green}/>:<Lock size={13} color={C.muted}/>}
        <span style={{fontSize:12,color:canBudget?C.green:C.muted}}>{canBudget?"Вы финансист — можете устанавливать и редактировать бюджеты":"Бюджеты устанавливает финансист. Вы можете управлять кампаниями"}</span>
        <span style={{marginLeft:"auto",fontSize:10,padding:"2px 8px",borderRadius:99,background:"rgba(255,255,255,0.06)",color:C.muted}}>{ROLE_INFO[user?.role]?.label}</span>
      </div>

      <Tabs tabs={[["campaigns","Кампании"],["team","Команда"]]} active={tab} onChange={setTab}/>

      {tab==="campaigns"&&<div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
          {[{l:"Бюджет",v:`₽ ${totalBudget.toLocaleString("ru")}`,c:C.purple,lock:!canBudget},{l:"Потрачено",v:`₽ ${totalSpent.toLocaleString("ru")}`,c:C.amber},{l:"Остаток",v:`₽ ${(totalBudget-totalSpent).toLocaleString("ru")}`,c:C.green},{l:"Кампаний",v:campaigns.length,c:C.cyan}].map(s=><div key={s.l} style={{...CS,textAlign:"center",padding:"14px 16px",position:"relative",overflow:"hidden"}}>{s.lock&&<div style={{position:"absolute",top:8,right:8}}><Lock size={10} color={C.dim}/></div>}<div style={{fontSize:24,fontWeight:700,color:s.c}}>{s.v}</div><div style={{fontSize:11,color:C.muted,marginTop:3}}>{s.l}</div></div>)}
        </div>
        {campaigns.map((c,i)=>{
          const pct=c.budget>0?Math.round(c.spent/c.budget*100):0;
          const resPct=c.exp_leads>0?Math.round(c.leads/c.exp_leads*100):0;
          const s=stC[c.status]||stC.planned;
          return <div key={i} style={{...CS,padding:"16px 18px",marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}><div><div style={{fontSize:14,fontWeight:700,color:"#f0f4ff"}}>{c.name}</div><div style={{fontSize:12,color:C.muted,marginTop:3}}>{c.goal}</div></div><div style={{display:"flex",gap:7,alignItems:"center"}}><Badge color={s.c}>{s.l}</Badge><span style={{fontSize:11,color:C.dim}}>{c.start} → {c.end}</span></div></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:14}}>
              <div><div style={{fontSize:10,color:C.muted,textTransform:"uppercase",marginBottom:4,display:"flex",alignItems:"center",gap:4}}>Бюджет{!canBudget&&<Lock size={8} color={C.dim}/>}</div><div style={{fontSize:16,fontWeight:700,color:canBudget?C.purple:C.dim}}>{c.approved?`₽${(c.budget/1000).toFixed(0)}к`:"Ожидает"}</div></div>
              <div><div style={{fontSize:10,color:C.muted,textTransform:"uppercase",marginBottom:4}}>Потрачено</div><div style={{fontSize:16,fontWeight:700,color:C.amber}}>₽{(c.spent/1000).toFixed(0)}к</div></div>
              <div><div style={{fontSize:10,color:C.muted,textTransform:"uppercase",marginBottom:4}}>Лидов ф/п</div><div style={{fontSize:16,fontWeight:700,color:resPct>=100?C.green:C.cyan}}>{c.leads}/{c.exp_leads}</div></div>
              <div><div style={{fontSize:10,color:C.muted,textTransform:"uppercase",marginBottom:4}}>Ответственный</div><div style={{fontSize:12,fontWeight:600,color:"#e2e8f0"}}>{c.responsible}</div></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.muted,marginBottom:5}}><span>Бюджет</span><span style={{color:pct>=100?C.red:pct>=80?C.amber:C.cyan}}>{pct}%</span></div><PBar value={pct} color={pct>=100?C.red:pct>=80?C.amber:C.cyan}/></div>
              <div><div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.muted,marginBottom:5}}><span>Результат</span><span style={{color:resPct>=100?C.green:C.cyan}}>{resPct}%</span></div><PBar value={resPct} color={resPct>=100?C.green:C.cyan}/></div>
            </div>
            {!c.approved&&<div style={{marginTop:10,padding:"8px 12px",borderRadius:8,background:"rgba(245,158,11,0.07)",border:"1px solid rgba(245,158,11,0.2)"}}><div style={{fontSize:11,color:C.amber,display:"flex",alignItems:"center",gap:5}}><Clock size={10}/>Ожидает бюджета финансиста{canBudget&&<button style={{marginLeft:"auto",fontSize:10,color:"#001824",background:C.amber,border:"none",borderRadius:5,padding:"2px 8px",cursor:"pointer",fontWeight:700}} onClick={()=>{setCampaigns(p=>p.map((x,j)=>j===i?{...x,approved:true}:x));if(c.id)crm.dbUpdate("campaigns",c.id,{approved:true});}}>Утвердить</button>}</div></div>}
          </div>;
        })}
      </div>}

      {tab==="team"&&<div>
        {[{label:"Руководитель",items:[MARKETING_TEAM.head],bg:`${C.purple}0a`,border:`${C.purple}33`,tc:C.purple},{label:"Менеджеры",items:MARKETING_TEAM.managers,bg:`${C.cyan}06`,border:`${C.cyan}22`,tc:C.cyan},{label:"Линейный персонал",items:MARKETING_TEAM.staff,bg:`${C.blue}06`,border:`${C.blue}22`,tc:C.blue}].map(g=><div key={g.label} style={{...CS,background:g.bg,borderColor:g.border,marginBottom:12}}>
          <div style={{fontSize:10,color:g.tc,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:700,marginBottom:12}}>{g.label}</div>
          <div style={{display:"grid",gridTemplateColumns:g.items.length===1?"1fr":"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
            {g.items.map(m=><div key={m.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:9,background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`}}>
              <Av initials={m.avatar} color={m.color} size={g.items.length===1?42:34}/>
              <div style={{minWidth:0}}><div style={{fontSize:g.items.length===1?14:12,fontWeight:700,color:"#f0f4ff"}}>{m.name}</div><div style={{fontSize:11,color:C.muted}}>{m.title}</div>{m.email&&<div style={{fontSize:10,color:C.cyan,marginTop:3}}>{m.email}</div>}</div>
            </div>)}
          </div>
        </div>)}
      </div>}

      {showAddCamp&&<AddCampaignModal canBudget={canBudget} onClose={()=>setShowAddCamp(false)} onSave={f=>{const row={name:f.name,goal:f.goal,channel:f.channel||"—",status:canBudget&&f.budget?"active":"planned",start:f.start,end:f.end,budget:parseInt(f.budget)||0,spent:0,exp_leads:parseInt(f.expLeads)||0,leads:0,responsible:f.responsible,result:"—",approved:canBudget&&!!f.budget};crm.dbInsert("campaigns",row).then(saved=>setCampaigns(p=>[...p,saved||{...row,id:p.length+1}]));}}/>}
    </div>
  );
}

function AdSlotsSection() {
  const crm=useCrm();
  const [contractors,setContractors]=useState(initContractors);
  const [showAdd,setShowAdd]=useState(false);
  const totalSlots=MACHINES_DB.length*4;
  const taken=contractors.length;
  const rev=contractors.reduce((s,c)=>s+c.price,0);
  const overdue=contractors.filter(c=>c.paid==="overdue");
  const payC={paid:{c:C.green,l:"Оплачено"},overdue:{c:C.red,l:"Просрочено"},pending:{c:C.amber,l:"Ожидает"}};
  const modC={true:{c:C.green,l:"Одобрено"},false:{c:C.amber,l:"На модерации"}};
  return (
    <Section title="Реклама на автоматах" subtitle="Слоты, контракторы, оплаты" render={({current,drill})=>{
      if(current==="root") return <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,flex:1,marginRight:12}}>
            <DrillCard label="Занято" value={`${taken}/${totalSlots}`} accent={C.cyan} onClick={()=>drill("slots-detail","Детали по слотам")}/>
            <DrillCard label="Заполненность" value={`${Math.round(taken/totalSlots*100)}%`} accent={C.amber} onClick={()=>drill("slots-detail","Детали")}/>
            <DrillCard label="Выручка/мес." value={`₽ ${rev.toLocaleString("ru")}`} accent={C.green} mono onClick={()=>drill("rev-ads","Выручка")}/>
            <DrillCard label="Просрочек" value={overdue.length} accent={overdue.length>0?C.red:C.muted} onClick={()=>overdue.length>0&&drill("overdue","Просрочки")}/>
          </div>
          <Btn variant="amber" onClick={()=>setShowAdd(true)}><Plus size={13}/>Контрактор</Btn>
        </div>

        {overdue.length>0&&<div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:11,border:"1px solid rgba(239,68,68,.3)",background:"rgba(239,68,68,.07)",marginBottom:18}}>
          <AlertTriangle size={14} color={C.red}/>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"#fca5a5"}}>{overdue.length} просроченных платежей: {overdue.map(c=>c.company).join(", ")}</div></div>
          <Badge color={C.red}>→ Юр. отдел</Badge>
        </div>}

        <div style={{...CS,marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:14,textTransform:"uppercase",letterSpacing:"0.06em"}}>Заполненность по автоматам</div>
          {MACHINES_DB.map(m=>{const n=contractors.filter(c=>c.machine===m.id).length;return <div key={m.id} onClick={()=>drill(`slots-${m.id}`,`Слоты ${m.id}`)} style={{display:"flex",alignItems:"center",gap:12,marginBottom:9,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.opacity=".8"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
            <div style={{width:55,fontSize:12,fontWeight:700,color:"#e2e8f0",flexShrink:0}}>{m.id}</div>
            <div style={{width:120,fontSize:11,color:C.muted,flexShrink:0}}>{m.place}</div>
            <div style={{flex:1}}><PBar value={n/4*100} color={n===4?C.green:n>0?C.cyan:C.dim}/></div>
            <div style={{fontSize:13,fontWeight:700,color:n===4?C.green:n>0?C.cyan:C.muted,minWidth:30}}>{n}/4</div>
            <ChevronRight size={13} color={C.dim}/>
          </div>;})}
        </div>

        <div style={{...CS,padding:0,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr style={{borderBottom:`1px solid ${C.border}`}}>{["Компания","Бренд","Авт.","Вид","Стоимость","Оплата","Модерация","Статус"].map(h=><th key={h} style={{textAlign:"left",padding:"10px 14px",fontSize:10,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.07em"}}>{h}</th>)}</tr></thead>
            <tbody>{contractors.map((c,i)=>{const pc=payC[c.paid]||payC.pending;const mc=modC[c.moderated];return <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.04)",cursor:"pointer"}} onClick={()=>drill(`contractor-${i}`,c.company)}>
              <td style={{padding:"10px 14px",fontWeight:700,color:"#f0f4ff"}}>{c.company}</td>
              <td style={{padding:"10px 14px"}}><Badge color={C.purple}>{c.brand}</Badge></td>
              <td style={{padding:"10px 14px",color:C.muted}}>{c.machine}</td>
              <td style={{padding:"10px 14px",color:C.muted}}>{c.type}</td>
              <td style={{padding:"10px 14px",fontWeight:700,color:C.green}}>₽{c.price.toLocaleString("ru")}</td>
              <td style={{padding:"10px 14px",color:C.muted,fontSize:11}}>{c.payForm}</td>
              <td style={{padding:"10px 14px"}}><Badge color={mc.c}>{mc.l}</Badge></td>
              <td style={{padding:"10px 14px"}}><Badge color={pc.c}>{pc.l}</Badge></td>
            </tr>;})}
            </tbody>
          </table>
        </div>
        {showAdd&&<AddContractorModal onClose={()=>setShowAdd(false)} onSave={f=>{const row={company:f.company,brand:f.brand,type:f.adType,machine:f.machine,price:parseInt(f.price)||0,payForm:f.payForm==="deferred"?`Отсрочка ${f.deferDays}д`:f.payForm,paid:f.payForm==="deferred"?"pending":"paid",dueDate:f.deferDate||null,moderated:f.moderated,start:f.start,end:f.end,contact:f.contactName,phone:f.contactPhone,responsible:f.responsible};crm.dbInsert("contractors",row).then(saved=>setContractors(p=>[...p,saved||{...row,id:p.length+1}]));}}/>}
      </div>;

      if(current.startsWith("contractor-")) {
        const idx=parseInt(current.replace("contractor-",""));
        const c=contractors[idx];
        const pc=payC[c.paid]||payC.pending;
        const mc=modC[c.moderated];
        return <div>
          <div style={{...CS,marginBottom:14,borderColor:c.paid==="overdue"?"rgba(239,68,68,.3)":C.border}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}><div><div style={{fontSize:18,fontWeight:700,color:"#f0f4ff"}}>{c.company}</div><Badge color={C.purple}>{c.brand}</Badge></div><div style={{display:"flex",gap:7}}><Badge color={mc.c}>{mc.l}</Badge><Badge color={pc.c}>{pc.l}</Badge></div></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              <Stat label="Стоимость/мес" value={`₽ ${c.price.toLocaleString("ru")}`} color={C.green}/>
              <Stat label="Автомат" value={c.machine} color={C.cyan}/>
              <Stat label="Вид рекламы" value={c.type} color={C.muted}/>
              <Stat label="Период" value={`${c.start} → ${c.end}`} color={C.muted}/>
              <Stat label="Оплата" value={c.payForm} color={C.muted}/>
              <Stat label="Контакт" value={c.contact} color={C.muted}/>
            </div>
            {c.paid==="overdue"&&<div style={{marginTop:14,padding:"10px 14px",borderRadius:9,background:"rgba(239,68,68,.07)",border:"1px solid rgba(239,68,68,.25)"}}><div style={{fontSize:12,fontWeight:700,color:"#fca5a5",display:"flex",alignItems:"center",gap:5}}><AlertTriangle size={12}/>Просрочка оплаты {c.dueDate&&`с ${c.dueDate}`} — сигнал отправлен в юридический отдел</div></div>}
          </div>
        </div>;
      }

      if(current.startsWith("slots-")) {
        const mid=current.replace("slots-","");
        const slots=contractors.filter(c=>c.machine===mid);
        const m=MACHINES_DB.find(x=>x.id===mid);
        const free=4-slots.length;
        return <div>
          <div style={{...CS,marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}><div style={{fontSize:16,fontWeight:700,color:"#f0f4ff"}}>{mid} · {m?.place}</div><Badge color={C.cyan}>{slots.length}/4 слота</Badge></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}><Stat label="Занято" value={slots.length} color={C.cyan}/><Stat label="Свободно" value={free} color={free>0?C.amber:C.muted}/><Stat label="Выручка/мес." value={`₽ ${slots.reduce((s,a)=>s+a.price,0).toLocaleString("ru")}`} color={C.green}/></div>
          </div>
          {slots.map((a,i)=>{const pc=payC[a.paid]||payC.pending;return <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:9,background:"rgba(255,255,255,0.03)",marginBottom:8,border:`1px solid ${C.border}`}}>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"#f0f4ff"}}>{a.company} · {a.brand}</div><div style={{fontSize:11,color:C.muted}}>{a.type} · {a.start} → {a.end}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:700,color:C.green}}>₽{a.price.toLocaleString("ru")}</div><div style={{marginTop:4}}><Badge color={pc.c}>{pc.l}</Badge></div></div>
          </div>;})}
          {free>0&&<div style={{...CS,borderColor:`${C.amber}33`,background:"rgba(245,158,11,.04)"}}><div style={{fontSize:13,color:C.amber,fontWeight:600}}>⚡ {free} слота свободны · потенциал +₽ {(free*6000).toLocaleString("ru")}/мес</div></div>}
        </div>;
      }

      return <div style={{color:C.muted,padding:40,textAlign:"center"}}>Раздел в разработке</div>;
    }}/>
  );
}

function FranchiseSection() {
  const crm = useCrm();
  // ── FUNNEL CONFIG
  const STAGES = {
    // Active
    new:          { l:"Новый",               en:"New",           c:C.dim,    prob:0,   group:"active"  },
    contacted:    { l:"Первичный контакт",   en:"Contacted",     c:C.blue,   prob:5,   group:"active"  },
    qualification:{ l:"Квалификация",        en:"Qualification", c:C.cyan,   prob:10,  group:"active"  },
    presentation: { l:"Презентация",         en:"Presentation",  c:C.purple, prob:20,  group:"active"  },
    proposal:     { l:"КП отправлено",       en:"Proposal",      c:C.amber,  prob:40,  group:"active"  },
    negotiation:  { l:"Переговоры",          en:"Negotiation",   c:"#f97316",prob:60,  group:"active"  },
    contract:     { l:"Договор / Предоплата",en:"Contract",      c:C.green,  prob:80,  group:"active"  },
    closed_won:   { l:"Оплата / Закрыто",    en:"Closed Won",    c:"#22c55e",prob:100, group:"won"     },
    // Deferred
    warm:         { l:"Отложено до 3 мес.",  en:"Warm",          c:C.amber,  prob:5,   group:"deferred"},
    longterm:     { l:"Долгий прогрев 3+",   en:"Long-term",     c:C.muted,  prob:2,   group:"deferred"},
    // Lost
    not_qualified:{ l:"Нецелевой",           en:"Not Qualified", c:C.dim,    prob:0,   group:"lost"    },
    lost:         { l:"Потерян (отказ)",      en:"Lost",          c:C.red,    prob:0,   group:"lost"    },
    junk:         { l:"Фрод / Дубль / Бот",  en:"Junk",          c:C.dim,    prob:0,   group:"lost"    },
  };

  const NEXT_STEP = {
    new:          "Назначить ответственного, совершить первый контакт",
    contacted:    "Провести квалификацию — задать вопросы по стране, бюджету, цели",
    qualification:"Заполнить поля квалификации. Определить: целевой или нет",
    presentation: "Через 2–3 дня связаться, узнать мнение по материалам",
    proposal:     "Контролировать сроки, отвечать на вопросы по КП",
    negotiation:  "Фиксировать возражения, готовить договор",
    contract:     "Сопровождать до полной оплаты",
    closed_won:   "Передать в реализацию, запустить онбординг",
    warm:         "Указать дату следующего касания, поставить задачу в CRM",
    longterm:     "Перевести в базу для авторассылок",
    not_qualified:"Закрыть с указанием причины отказа",
    lost:         "Закрыть с причиной, проанализировать возражения",
    junk:         "Удалить или скрыть из системы",
  };

  // ── live data
  // Zoho removed — using local FR_LEADS data
  // Helm Care воронка продаж
  const STAGE_MAP = {
    "New":          "new",
    "Contacted":    "contacted",
    "Qualification":"qualification",
    "Presentation": "presentation",
    "Proposal":     "proposal",
    "Negotiation":  "negotiation",
    "Contract":     "contract",
    "Closed Won":   "closed_won",
    "Closed Lost":  "lost",
    "Warm (up to 3 months)": "warm",
    "Long-term (3+ months)": "longterm",
    "Warm":         "warm",
    "Long-term":    "longterm",
    "Not Qualified":"not_qualified",
    "Lost":         "lost",
    "Junk":         "junk",
    // legacy mappings
    "Contact Established":"contacted",
    "Proposal/Price Quote":"proposal",
    "Negotiation/Review":  "negotiation",
    "Contract Sent":       "contract",
    "Not Contacted":       "new",
    "Junk Lead":           "junk",
    "Pre-Qualified":       "qualification",
  };
  const [leads, setLeads] = useState(FR_LEADS);

  const [tab, setTab] = useState("funnel");
  const [filterStage, setFilterStage] = useState("all");
  const [search, setSearch] = useState("");
  const [movingLead, setMovingLead] = useState(null);

  const activeStages = Object.entries(STAGES).filter(([,v])=>v.group==="active");
  const deferredStages = Object.entries(STAGES).filter(([,v])=>v.group==="deferred");
  const lostStages = Object.entries(STAGES).filter(([,v])=>v.group==="lost");

  const activeLeads = leads.filter(l=>STAGES[l.stage]?.group==="active");
  const wonLeads = leads.filter(l=>l.stage==="closed_won");
  const deferredLeads = leads.filter(l=>STAGES[l.stage]?.group==="deferred");
  const lostLeads = leads.filter(l=>STAGES[l.stage]?.group==="lost");

  const filteredLeads = leads.filter(l => {
    const matchStage = filterStage === "all" || l.stage === filterStage;
    const matchSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.city.toLowerCase().includes(search.toLowerCase());
    return matchStage && matchSearch;
  });

  const moveLeadStage = (leadId, newStage) => {
    setLeads(ls => ls.map(l => l.id===leadId ? {...l, stage:newStage} : l));
    crm.dbUpdate("franchise_leads", leadId, { stage: newStage });
    setMovingLead(null);
  };

  return (
    <Section title="Продажа франшизы" subtitle="Воронка продаж · Нажми на лид — полная карточка" render={({current, drill}) => {

      // ── ROOT ──────────────────────────────────────────────────────────────
      if (current === "root") return (
        <div>
          {/* KPI summary */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:20}}>
            {[
              {l:"Активных лидов",  v:activeLeads.length,  c:C.cyan,   onClick:()=>setFilterStage("all")},
              {l:"Закрыто (Выиграно)", v:wonLeads.length,  c:"#22c55e",onClick:()=>setFilterStage("closed_won")},
              {l:"Отложено",        v:deferredLeads.length,c:C.amber,  onClick:()=>setFilterStage("warm")},
              {l:"Потеряно",        v:lostLeads.length,    c:C.red,    onClick:()=>setFilterStage("lost")},
              {l:"Всего лидов",     v:leads.length,        c:C.muted,  onClick:()=>setFilterStage("all")},
            ].map(s=>(
              <div key={s.l} onClick={s.onClick} style={{...CS,textAlign:"center",padding:"14px 12px",cursor:"pointer",transition:"all .2s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=`${s.c}44`}
                onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                <div style={{fontSize:26,fontWeight:700,color:s.c}}>{s.v}</div>
                <div style={{fontSize:10,color:C.muted,marginTop:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <Tabs tabs={[["funnel","Воронка"],["kanban","Канбан"],["list","Список"]]} active={tab} onChange={setTab}/>

          {/* ── FUNNEL VIEW ── */}
          {tab==="funnel" && (
            <div>
              {/* Active stages funnel */}
              <div style={{fontSize:11,fontWeight:600,color:C.cyan,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10,display:"flex",alignItems:"center",gap:6}}>
                <Activity size={11}/>Активные этапы
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
                {activeStages.map(([k,s],i) => {
                  const count = leads.filter(l=>l.stage===k).length;
                  const maxCount = Math.max(...activeStages.map(([ak])=>leads.filter(l=>l.stage===ak).length),1);
                  const pct = Math.max(count/maxCount*100, 4);
                  return (
                    <div key={k} onClick={()=>drill(`stage-${k}`, `${s.l} · ${s.en}`)}
                      style={{display:"flex",alignItems:"center",gap:12,cursor:"pointer",transition:"all .15s"}}
                      onMouseEnter={e=>e.currentTarget.style.opacity=".85"}
                      onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                      {/* Stage label */}
                      <div style={{width:180,flexShrink:0,textAlign:"right"}}>
                        <div style={{fontSize:12,fontWeight:600,color:"#e2e8f0"}}>{s.l}</div>
                        <div style={{fontSize:10,color:C.dim}}>{s.en} · {s.prob}%</div>
                      </div>
                      {/* Bar */}
                      <div style={{flex:1,height:32,background:"rgba(255,255,255,0.04)",borderRadius:6,overflow:"hidden",position:"relative"}}>
                        <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${s.c}99,${s.c})`,borderRadius:6,transition:"width .4s",display:"flex",alignItems:"center",paddingLeft:10}}>
                          {count>0&&<span style={{fontSize:12,fontWeight:700,color:"#fff",whiteSpace:"nowrap"}}>{count} лид{count===1?"":"а"}</span>}
                        </div>
                        {count===0&&<span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:11,color:C.dim}}>нет лидов</span>}
                      </div>
                      <div style={{width:30,textAlign:"right"}}>
                        <ChevronRight size={13} color={C.dim}/>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Closed Won */}
              <div onClick={()=>drill("stage-closed_won","Закрыто · Выиграно")}
                style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:10,
                  background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.25)",marginBottom:16,cursor:"pointer"}}>
                <div style={{fontSize:20}}>🏆</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#22c55e"}}>Оплата получена · Closed Won</div>
                  <div style={{fontSize:11,color:C.muted}}>100% оплата · передача в реализацию</div>
                </div>
                <div style={{fontSize:24,fontWeight:700,color:"#22c55e"}}>{wonLeads.length}</div>
                <ChevronRight size={13} color={C.dim}/>
              </div>

              {/* Deferred */}
              <div style={{fontSize:11,fontWeight:600,color:C.amber,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>
                Отложенные
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
                {deferredStages.map(([k,s])=>{
                  const count=leads.filter(l=>l.stage===k).length;
                  return (
                    <div key={k} onClick={()=>drill(`stage-${k}`,s.l)}
                      style={{...CS,padding:"12px 14px",cursor:"pointer",transition:"all .2s",borderColor:`${s.c}22`}}
                      onMouseEnter={e=>e.currentTarget.style.borderColor=`${s.c}55`}
                      onMouseLeave={e=>e.currentTarget.style.borderColor=`${s.c}22`}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div>
                          <div style={{fontSize:12,fontWeight:700,color:"#e2e8f0"}}>{s.l}</div>
                          <div style={{fontSize:10,color:C.dim}}>{s.en} · {s.prob}% вероятность</div>
                        </div>
                        <div style={{fontSize:22,fontWeight:700,color:s.c}}>{count}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Lost */}
              <div style={{fontSize:11,fontWeight:600,color:C.red,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>
                Потерянные / Нецелевые
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                {lostStages.map(([k,s])=>{
                  const count=leads.filter(l=>l.stage===k).length;
                  return (
                    <div key={k} onClick={()=>drill(`stage-${k}`,s.l)}
                      style={{...CS,padding:"12px 14px",cursor:"pointer",transition:"all .2s",opacity:0.7}}
                      onMouseEnter={e=>e.currentTarget.style.opacity="1"}
                      onMouseLeave={e=>e.currentTarget.style.opacity="0.7"}>
                      <div style={{fontSize:22,fontWeight:700,color:C.dim,marginBottom:4}}>{count}</div>
                      <div style={{fontSize:11,fontWeight:600,color:"#e2e8f0"}}>{s.l}</div>
                      <div style={{fontSize:10,color:C.dim}}>{s.en}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── KANBAN VIEW ── */}
          {tab==="kanban" && (
            <div style={{overflowX:"auto",paddingBottom:12}}>
              <div style={{display:"flex",gap:10,minWidth:"max-content"}}>
                {activeStages.map(([k,s])=>{
                  const stageLeads=leads.filter(l=>l.stage===k);
                  return (
                    <div key={k} style={{width:210,flexShrink:0}}>
                      <div style={{padding:"8px 12px",borderRadius:9,background:`${s.c}12`,border:`1px solid ${s.c}2a`,marginBottom:8}}>
                        <div style={{fontSize:11,fontWeight:700,color:s.c}}>{s.l}</div>
                        <div style={{fontSize:10,color:C.dim,marginTop:1}}>{stageLeads.length} лидов · {s.prob}%</div>
                      </div>
                      {stageLeads.map(l=>(
                        <div key={l.id} onClick={()=>drill(`lead-${l.id}`,l.name)}
                          style={{...CS,padding:"11px 13px",marginBottom:8,cursor:"pointer",transition:"all .2s"}}
                          onMouseEnter={e=>e.currentTarget.style.borderColor=`${s.c}44`}
                          onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                          <div style={{fontSize:12,fontWeight:700,color:"#f0f4ff",marginBottom:3}}>{l.name}</div>
                          <div style={{fontSize:11,color:C.muted,marginBottom:6}}>{l.city} · {l.mach} авт.</div>
                          <div style={{fontSize:10,color:C.dim}}>{l.mgr}</div>
                          {/* Quick move buttons */}
                          {movingLead===l.id ? (
                            <div style={{marginTop:8,display:"flex",flexWrap:"wrap",gap:4}}>
                              {activeStages.filter(([ak])=>ak!==k).slice(0,4).map(([ak,as])=>(
                                <button key={ak} onClick={e=>{e.stopPropagation();moveLeadStage(l.id,ak);}}
                                  style={{fontSize:9,padding:"2px 6px",borderRadius:5,cursor:"pointer",
                                    background:`${as.c}18`,border:`1px solid ${as.c}33`,color:as.c,fontWeight:600}}>
                                  →{as.l.slice(0,8)}
                                </button>
                              ))}
                              <button onClick={e=>{e.stopPropagation();setMovingLead(null);}}
                                style={{fontSize:9,padding:"2px 6px",borderRadius:5,cursor:"pointer",
                                  background:"rgba(255,255,255,0.05)",border:`1px solid ${C.border}`,color:C.muted}}>✕</button>
                            </div>
                          ) : (
                            <button onClick={e=>{e.stopPropagation();setMovingLead(l.id);}}
                              style={{marginTop:7,fontSize:10,color:C.muted,background:"rgba(255,255,255,0.04)",
                                border:`1px solid ${C.border}`,borderRadius:5,padding:"2px 8px",cursor:"pointer",width:"100%"}}>
                              Переместить →
                            </button>
                          )}
                        </div>
                      ))}
                      {stageLeads.length===0&&<div style={{padding:"16px 12px",textAlign:"center",borderRadius:9,border:`1px dashed ${C.dim}`,color:C.dim,fontSize:11}}>Пусто</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── LIST VIEW ── */}
          {tab==="list" && (
            <div>
              {/* Search + filter */}
              <div style={{display:"flex",gap:10,marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:7,flex:1,background:C.surface2,border:`1px solid ${C.border}`,borderRadius:9,padding:"7px 12px"}}>
                  <Search size={13} color={C.muted}/>
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Поиск по имени, городу..."
                    style={{background:"none",border:"none",outline:"none",color:C.text,fontSize:13,width:"100%"}}/>
                </div>
                <select value={filterStage} onChange={e=>setFilterStage(e.target.value)}
                  style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:9,padding:"7px 13px",color:C.text,fontSize:12,outline:"none"}}>
                  <option value="all">Все этапы</option>
                  {Object.entries(STAGES).map(([k,s])=><option key={k} value={k}>{s.l}</option>)}
                </select>
              </div>
              <div style={{...CS,padding:0,overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead>
                    <tr style={{borderBottom:`1px solid ${C.border}`}}>
                      {["Лид / Город","Этап","Вер.%","Автоматов","Источник","Менеджер","Дата"].map(h=>(
                        <th key={h} style={{textAlign:"left",padding:"10px 14px",fontSize:10,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map(l=>{
                      const s=STAGES[l.stage];
                      return (
                        <tr key={l.id} onClick={()=>drill(`lead-${l.id}`,l.name)}
                          style={{borderBottom:"1px solid rgba(255,255,255,0.04)",cursor:"pointer"}}
                          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <td style={{padding:"10px 14px"}}>
                            <div style={{fontSize:13,fontWeight:600,color:"#e2e8f0"}}>{l.name}</div>
                            <div style={{fontSize:11,color:C.muted}}>{l.city}</div>
                          </td>
                          <td style={{padding:"10px 14px"}}><Badge color={s?.c||C.muted}>{s?.l||l.stage}</Badge></td>
                          <td style={{padding:"10px 14px",fontSize:12,fontWeight:700,color:s?.c||C.muted}}>{s?.prob||0}%</td>
                          <td style={{padding:"10px 14px",fontSize:13,fontWeight:700,color:C.cyan}}>{l.mach}</td>
                          <td style={{padding:"10px 14px",fontSize:11,color:C.muted}}>{l.src}</td>
                          <td style={{padding:"10px 14px",fontSize:11,color:C.muted}}>{l.mgr}</td>
                          <td style={{padding:"10px 14px",fontSize:11,color:C.dim}}>{l.date}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      );

      // ── STAGE DETAIL ──────────────────────────────────────────────────────
      if (current.startsWith("stage-")) {
        const key = current.replace("stage-","");
        const s = STAGES[key];
        const filtered = leads.filter(l=>l.stage===key);
        return (
          <div>
            <div style={{...CS,marginBottom:14,borderColor:`${s.c}33`,background:`${s.c}06`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div>
                  <div style={{fontSize:18,fontWeight:700,color:"#f0f4ff"}}>{s.l}</div>
                  <div style={{fontSize:12,color:C.muted,marginTop:3}}>{s.en} · Вероятность: {s.prob}%</div>
                </div>
                <Badge color={s.c}>{filtered.length} лидов</Badge>
              </div>
              <div style={{fontSize:12,color:"#e2e8f0",padding:"10px 14px",borderRadius:9,background:"rgba(0,0,0,0.2)"}}>
                {NEXT_STEP[key]}
              </div>
            </div>
            {filtered.length===0
              ? <div style={{...CS,textAlign:"center",padding:40,color:C.muted}}>На этом этапе нет лидов</div>
              : filtered.map(l=>(
                <div key={l.id} onClick={()=>drill(`lead-${l.id}`,l.name)}
                  style={{display:"flex",alignItems:"center",gap:13,padding:"12px 14px",borderRadius:9,background:"rgba(255,255,255,0.02)",marginBottom:8,cursor:"pointer",border:`1px solid ${C.border}`,transition:"all .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=`${s.c}44`}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                  <Av initials={l.name.slice(0,2)} color={s.c} size={36}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:"#f0f4ff"}}>{l.name} <span style={{fontSize:11,color:C.muted,fontWeight:400}}>· {l.city}</span></div>
                    <div style={{fontSize:11,color:C.muted,marginTop:2}}>{l.note}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0,fontSize:11,color:C.muted}}>
                    <div>{l.mach} авт.</div>
                    <div style={{color:C.dim,marginTop:2}}>{l.mgr}</div>
                  </div>
                  <ChevronRight size={13} color={C.dim}/>
                </div>
              ))
            }
          </div>
        );
      }

      // ── LEAD CARD ─────────────────────────────────────────────────────────
      if (current.startsWith("lead-")) {
        const id = parseInt(current.replace("lead-",""));
        const l = leads.find(x=>x.id===id) || leads[0];
        const s = STAGES[l.stage] || STAGES.new;
        const stageKeys = Object.keys(STAGES);
        const curIdx = stageKeys.indexOf(l.stage);
        return (
          <div>
            {/* Lead header */}
            <div style={{...CS,marginBottom:14,borderColor:`${s.c}33`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <Av initials={l.name.slice(0,2)} color={s.c} size={50}/>
                  <div>
                    <div style={{fontSize:20,fontWeight:700,color:"#f0f4ff"}}>{l.name}</div>
                    <div style={{fontSize:13,color:C.muted,marginTop:3}}>{l.city}</div>
                    <div style={{marginTop:6}}><Badge color={s.c}>{s.l} · {s.en}</Badge></div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:11,color:C.muted,marginBottom:4}}>Вероятность сделки</div>
                  <div style={{fontSize:28,fontWeight:700,color:s.c}}>{s.prob}%</div>
                </div>
              </div>

              {/* Stage progress bar */}
              <div style={{marginBottom:6,fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.05em"}}>
                Прогресс по воронке
              </div>
              <div style={{display:"flex",gap:3,marginBottom:12}}>
                {Object.entries(STAGES).filter(([,v])=>v.group==="active").map(([k,sv],i)=>(
                  <div key={k} style={{flex:1,height:6,borderRadius:3,
                    background:k===l.stage?sv.c:stageKeys.indexOf(k)<curIdx?`${sv.c}55`:"rgba(255,255,255,0.07)",
                    transition:"all .3s"}}/>
                ))}
              </div>

              {/* Key info */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
                <Stat label="Автоматов"  value={l.mach}  color={C.cyan}/>
                <Stat label="Источник"   value={l.src}   color={C.muted}/>
                <Stat label="Дата"       value={l.date}  color={C.muted}/>
                <Stat label="Менеджер"   value={l.mgr.split(" ")[0]} color={C.purple}/>
              </div>
            </div>

            {/* Note + contact */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
              <div style={{...CS}}>
                <div style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",marginBottom:12}}>Текущий статус</div>
                <div style={{fontSize:13,color:"#e2e8f0",lineHeight:1.6,marginBottom:12}}>{l.note}</div>
                <div style={{fontSize:11,color:C.muted}}>Ответственный: <strong style={{color:"#e2e8f0"}}>{l.mgr}</strong></div>
              </div>
              <div style={{...CS}}>
                <div style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",marginBottom:12}}>Следующий шаг</div>
                <div style={{padding:"10px 14px",borderRadius:9,background:`${s.c}09`,border:`1px solid ${s.c}22`,fontSize:12,color:"#e2e8f0",lineHeight:1.6,marginBottom:12}}>
                  {NEXT_STEP[l.stage]}
                </div>
                {l.phone && (
                  <div style={{fontSize:12,color:C.cyan,display:"flex",alignItems:"center",gap:5}}>
                    <Phone size={11}/>{l.phone}
                  </div>
                )}
              </div>
            </div>

            {/* Move to stage */}
            <div style={{...CS,marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",marginBottom:12}}>Переместить в этап</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {Object.entries(STAGES).map(([k,sv])=>(
                  <button key={k} onClick={()=>moveLeadStage(l.id,k)}
                    disabled={k===l.stage}
                    style={{padding:"6px 12px",borderRadius:8,fontSize:11,fontWeight:600,cursor:k===l.stage?"default":"pointer",
                      background:k===l.stage?`${sv.c}22`:"rgba(255,255,255,0.04)",
                      border:`1px solid ${k===l.stage?sv.c+"55":C.border}`,
                      color:k===l.stage?sv.c:C.muted,
                      opacity:k===l.stage?1:0.7,
                      transition:"all .15s"}}>
                    {k===l.stage?"✓ ":""}{sv.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{display:"flex",gap:8}}>
              <Btn variant="primary"><Send size={12}/>Отправить КП</Btn>
              <Btn variant="success"><Phone size={12}/>Позвонить</Btn>
              <Btn variant="ghost"><FileText size={12}/>Договор</Btn>
            </div>
          </div>
        );
      }

      return <div style={{color:C.muted,padding:40,textAlign:"center"}}>Раздел в разработке</div>;
    }}/>
  );
}


function MyFranchiseSection() {
  const royalty_pct=8,invested=2800000;
  const myM=MACHINES_DB.filter(m=>["AW-005","AW-006"].includes(m.id));
  const rev=myM.reduce((s,m)=>s+m.rm,0);
  const royalty=Math.round(rev*royalty_pct/100),profit=rev-royalty,tax=Math.round(profit*0.06);
  const roi=Math.round(profit*12/invested*1000)/10;
  return (
    <Section title="Мой кабинет · Франчайзи" subtitle="Нажми на автомат — детали" render={({current,drill})=>{
      if(current==="root") return <div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
          <DrillCard label="Выручка (мес.)" value={`₽ ${rev.toLocaleString("ru")}`} trend="+8%" trendUp accent={C.green} mono onClick={()=>drill("fin","Финансы · расчёт")}/>
          <DrillCard label={`Роялти (${royalty_pct}%)`} value={`₽ ${royalty.toLocaleString("ru")}`} accent={C.amber} mono onClick={()=>drill("fin","Финансы · расчёт")}/>
          <DrillCard label="Чистая прибыль" value={`₽ ${profit.toLocaleString("ru")}`} accent={C.cyan} mono onClick={()=>drill("fin","Финансы · расчёт")}/>
          <DrillCard label="Налог УСН 6%" value={`₽ ${tax.toLocaleString("ru")}`} accent={C.red} mono onClick={()=>drill("fin","Финансы · расчёт")}/>
        </div>
        <div style={{...CS,marginBottom:14}}><div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>{[{l:"Инвестиции",v:`₽ ${invested.toLocaleString("ru")}`},{l:"ROI (% год.)",v:`${roi}%`},{l:"Договор",v:"01.03.2024 → 01.03.2027"},{l:"Роялти",v:`${royalty_pct}% · индивидуально`}].map(s=><div key={s.l}><div style={{fontSize:11,color:C.muted,marginBottom:4}}>{s.l}</div><div style={{fontSize:15,fontWeight:700,color:"#f0f4ff"}}>{s.v}</div></div>)}</div></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {myM.map(m=><div key={m.id} onClick={()=>drill(`myfr-${m.id}`,`${m.id} · ${m.place}`)} style={{...CS,cursor:"pointer",transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=`${C.cyan}44`} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:11}}><div><div style={{fontSize:13,fontWeight:700,color:"#f0f4ff"}}>{m.id} · {m.place}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{m.addr}</div></div><MPill status={m.status}/></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7}}>{[{l:"Моек/день",v:m.wd,c:C.cyan},{l:"Моек/мес",v:m.wm,c:C.cyan},{l:"Выр./мес",v:`₽${(m.rm/1000).toFixed(0)}к`,c:C.green}].map(s=><div key={s.l} style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"7px 9px"}}><div style={{fontSize:9,color:C.muted,textTransform:"uppercase"}}>{s.l}</div><div style={{fontSize:14,fontWeight:700,color:s.c}}>{s.v}</div></div>)}</div>
          </div>)}
        </div>
      </div>;

      if(current==="fin") return <div style={{...CS}}>
        <div style={{fontSize:16,fontWeight:700,color:"#f0f4ff",marginBottom:20}}>Финансовый расчёт · апрель 2026</div>
        {[{l:"Выручка всего",v:`₽ ${rev.toLocaleString("ru")}`,c:C.green},{l:`Роялти (${royalty_pct}%)`,v:`- ₽ ${royalty.toLocaleString("ru")}`,c:C.amber},{l:"Чистая прибыль",v:`₽ ${profit.toLocaleString("ru")}`,c:C.cyan},{l:"Налог УСН 6%",v:`- ₽ ${tax.toLocaleString("ru")}`,c:C.red},{l:"К получению",v:`₽ ${(profit-tax).toLocaleString("ru")}`,c:C.green},{l:"ROI (% годовых)",v:`${roi}%`,c:C.purple}].map(r=><div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:`1px solid ${C.border}`}}><span style={{fontSize:13,color:"#e2e8f0"}}>{r.l}</span><span style={{fontSize:15,fontWeight:700,color:r.c,fontFamily:"monospace"}}>{r.v}</span></div>)}
      </div>;

      if(current.startsWith("myfr-")) {
        const mid=current.replace("myfr-","");const m=MACHINES_DB.find(x=>x.id===mid)||myM[0];const sc={online:C.green,offline:C.red,repair:C.amber}[m.status];
        return <div>
          <div style={{...CS,marginBottom:14,borderColor:`${sc}33`}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}><div><div style={{fontSize:18,fontWeight:700,color:"#f0f4ff"}}>{m.id} · {m.place}</div><MPill status={m.status}/></div></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}><Stat label="Моек/день" value={m.wd} color={C.cyan}/><Stat label="Моек/мес" value={m.wm.toLocaleString("ru")} color={C.cyan}/><Stat label="Выр./мес" value={`₽ ${(m.rm/1000).toFixed(0)}к`} color={C.green}/><Stat label="Роялти" value={`₽ ${(m.rm*royalty_pct/100/1000).toFixed(0)}к`} color={C.amber}/><Stat label="Прибыль" value={`₽ ${(m.rm*(1-royalty_pct/100)/1000).toFixed(0)}к`} color={C.cyan}/><Stat label="Uptime" value={`${m.up}%`} color={m.up>90?C.green:C.amber}/></div>
          </div>
          <div style={{...CS}}><div style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",marginBottom:12}}>Обслуживание</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>{[{l:"Последнее ТО",v:m.ls},{l:"Плановое ТО",v:m.ns},{l:"Место",v:m.place},{l:"Адрес",v:m.addr}].map(f=><div key={f.l}><div style={{fontSize:10,color:C.dim}}>{f.l}</div><div style={{fontSize:13,color:"#e2e8f0",marginTop:2}}>{f.v}</div></div>)}</div></div>
        </div>;
      }
      return <div style={{color:C.muted,padding:40,textAlign:"center"}}>Раздел в разработке</div>;
    }}/>
  );
}

function LegalSection() {
  const stC={active:{c:C.green,l:"Активный"},expiring:{c:C.amber,l:"Истекает"},dispute:{c:C.red,l:"Спор"}};
  const rC={low:{c:C.green,l:"Низкий"},medium:{c:C.amber,l:"Средний"},high:{c:C.red,l:"Высокий"}};
  return (
    <Section title="Юридический отдел" subtitle="Нажми на договор — детали" render={({current,drill})=>{
      if(current==="root") return <div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
          <DrillCard label="Договоров" value={LEGAL_DB.length} accent={C.cyan} onClick={()=>drill("all","Все договоры")}/>
          <DrillCard label="Споров" value={LEGAL_DB.filter(c=>c.status==="dispute").length} accent={C.red} onClick={()=>drill("disputes","Споры")}/>
          <DrillCard label="Истекают" value={LEGAL_DB.filter(c=>c.status==="expiring").length} accent={C.amber} onClick={()=>drill("expiring","Истекающие")}/>
          <DrillCard label="Активных" value={LEGAL_DB.filter(c=>c.status==="active").length} accent={C.green} onClick={()=>drill("active","Активные")}/>
        </div>
        <div style={{...CS}}>
          <div style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:14,textTransform:"uppercase",letterSpacing:"0.06em"}}>Все договоры</div>
          {LEGAL_DB.map(c=>{const s=stC[c.status];const r=rC[c.risk];return <div key={c.id} onClick={()=>drill(`contract-${c.id}`,`${c.type} · ${c.party}`)} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:9,background:"rgba(255,255,255,0.02)",marginBottom:7,cursor:"pointer",border:`1px solid ${C.border}`,transition:"all .15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=`${s.c}44`} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
            <div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}><Badge color={C.purple}>{c.type}</Badge><span style={{fontSize:13,fontWeight:700,color:"#f0f4ff"}}>{c.party}</span></div><div style={{fontSize:11,color:C.muted}}>Истекает: {c.expires} · {c.pay}</div></div>
            <Badge color={r.c}>{r.l}</Badge><Badge color={s.c}>{s.l}</Badge><ChevronRight size={13} color={C.dim}/>
          </div>;})}
        </div>
      </div>;

      if(current.startsWith("contract-")) {
        const id=parseInt(current.replace("contract-",""));const c=LEGAL_DB.find(x=>x.id===id)||LEGAL_DB[0];const s=stC[c.status];const r=rC[c.risk];
        return <div>
          <div style={{...CS,marginBottom:14,borderColor:`${s.c}33`}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}><div><Badge color={C.purple}>{c.type}</Badge><div style={{fontSize:18,fontWeight:700,color:"#f0f4ff",marginTop:6}}>{c.party}</div></div><div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}><Badge color={s.c}>{s.l}</Badge><Badge color={r.c}>{r.l} риск</Badge></div></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}><Stat label="Подписан" value={c.signed} color={C.muted}/><Stat label="Истекает" value={c.expires} color={c.status!=="active"?C.amber:C.muted}/><Stat label="Оплата" value={c.pay} color={c.pay==="В срок"?C.green:C.red}/></div>
          </div>
          {c.status==="dispute"&&<div style={{...CS,borderColor:`${C.red}33`,background:"rgba(239,68,68,.05)"}}><div style={{fontSize:13,fontWeight:700,color:C.red,marginBottom:8}}>⚠ Активный спор</div><div style={{fontSize:12,color:"#e2e8f0"}}>Требуется немедленное юридическое вмешательство.</div></div>}
          {c.status==="expiring"&&<div style={{...CS,borderColor:`${C.amber}33`,background:"rgba(245,158,11,.05)"}}><div style={{fontSize:13,fontWeight:700,color:C.amber,marginBottom:8}}>⏰ Договор истекает</div><div style={{fontSize:12,color:"#e2e8f0"}}>Необходимо продление. Инициировать переговоры.</div></div>}
        </div>;
      }

      const map={all:null,disputes:"dispute",expiring:"expiring",active:"active"};
      const filter=map[current];
      if(filter!==undefined) {
        const filtered=filter?LEGAL_DB.filter(c=>c.status===filter):LEGAL_DB;
        return <div style={{...CS}}>{filtered.map(c=>{const s=stC[c.status];const r=rC[c.risk];return <div key={c.id} onClick={()=>drill(`contract-${c.id}`,`${c.type} · ${c.party}`)} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:9,background:"rgba(255,255,255,0.02)",marginBottom:7,cursor:"pointer",border:`1px solid ${C.border}`,transition:"all .15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=`${s.c}44`} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"#f0f4ff"}}>{c.party}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{c.type} · {c.expires}</div></div><Badge color={r.c}>{r.l}</Badge><Badge color={s.c}>{s.l}</Badge><ChevronRight size={13} color={C.dim}/></div>;})}
        </div>;
      }

      return <div style={{color:C.muted,padding:40,textAlign:"center"}}>Раздел в разработке</div>;
    }}/>
  );
}

function DevLabSection() {
  const stC={on_track:{c:C.green,l:"По графику"},delayed:{c:C.red,l:"Отстаёт"},completed:{c:C.cyan,l:"Завершён"},planning:{c:C.muted,l:"Планирование"}};
  return (
    <Section title="Разработка и внедрение" subtitle="Нажми на проект — детали" render={({current,drill})=>{
      if(current==="root") return <div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
          <DrillCard label="Активных" value={DEV_DB.filter(p=>p.status!=="completed").length} accent={C.blue} onClick={()=>drill("all-dev","Все проекты")}/>
          <DrillCard label="По графику" value={DEV_DB.filter(p=>p.status==="on_track").length} accent={C.green} onClick={()=>drill("on-track","По графику")}/>
          <DrillCard label="Отстают" value={DEV_DB.filter(p=>p.status==="delayed").length} accent={C.red} onClick={()=>drill("delayed","Отстающие")}/>
          <DrillCard label="Завершено" value={DEV_DB.filter(p=>p.status==="completed").length} accent={C.cyan} onClick={()=>drill("completed","Завершённые")}/>
        </div>
        {DEV_DB.map((p,i)=>{const s=stC[p.status];return <div key={i} onClick={()=>drill(`proj-${i}`,p.name)} style={{...CS,padding:"15px 18px",marginBottom:10,cursor:"pointer",transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=`${s.c}44`} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><div><div style={{fontSize:14,fontWeight:700,color:"#f0f4ff"}}>{p.name}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>Срок: {p.dl}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:11,color:C.muted}}>₽{(p.spent/1000).toFixed(0)}к / ₽{(p.budget/1000).toFixed(0)}к</div></div></div>
          <div style={{display:"flex",alignItems:"center",gap:12}}><div style={{flex:1}}><PBar value={p.pct} color={s.c} h={6}/></div><Badge color={s.c}>{s.l}</Badge><span style={{fontSize:13,fontWeight:700,color:s.c,minWidth:40}}>{p.pct}%</span><ChevronRight size={13} color={C.dim}/></div>
        </div>;})}
      </div>;

      if(current.startsWith("proj-")) {
        const idx=parseInt(current.replace("proj-",""));const p=DEV_DB[idx];const s=stC[p.status];
        return <div>
          <div style={{...CS,marginBottom:14,borderColor:`${s.c}33`}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}><div><div style={{fontSize:18,fontWeight:700,color:"#f0f4ff"}}>{p.name}</div><div style={{fontSize:12,color:C.muted,marginTop:4}}>Срок {p.dl}</div></div><Badge color={s.c}>{s.l}</Badge></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}><Stat label="Прогресс" value={`${p.pct}%`} color={s.c}/><Stat label="Бюджет" value={`₽ ${(p.budget/1000).toFixed(0)}к`} color={C.muted}/><Stat label="Потрачено" value={`₽ ${(p.spent/1000).toFixed(0)}к`} color={p.spent/p.budget>0.9?C.red:C.amber}/></div>
            <PBar value={p.pct} color={s.c} h={8}/>
          </div>
          <div style={{...CS}}><div style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",marginBottom:12}}>Задачи проекта</div>
            {p.tasks.map((t,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,background:"rgba(255,255,255,0.03)",marginBottom:7,border:`1px solid ${C.border}`}}>
              <div style={{width:18,height:18,borderRadius:"50%",background:i<Math.floor(p.tasks.length*p.pct/100)?`${s.c}22`:"rgba(255,255,255,0.05)",border:`1px solid ${i<Math.floor(p.tasks.length*p.pct/100)?s.c:C.dim}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i<Math.floor(p.tasks.length*p.pct/100)&&<CheckCircle size={10} color={s.c}/>}</div>
              <span style={{fontSize:13,color:i<Math.floor(p.tasks.length*p.pct/100)?"#94a3b8":"#e2e8f0"}}>{t}</span>
            </div>)}
          </div>
        </div>;
      }

      const filt={all:null,"on-track":"on_track",delayed:"delayed",completed:"completed"}[current];
      if(filt!==undefined) {
        const filtered=filt?DEV_DB.filter(p=>p.status===filt):DEV_DB;
        return <div>{filtered.map((p,i)=>{const s=stC[p.status];return <div key={i} onClick={()=>drill(`proj-${DEV_DB.indexOf(p)}`,p.name)} style={{...CS,padding:"14px 18px",marginBottom:10,cursor:"pointer",transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=`${s.c}44`} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}><div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><div style={{fontSize:14,fontWeight:700,color:"#f0f4ff"}}>{p.name}</div><Badge color={s.c}>{s.l}</Badge></div><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{flex:1}}><PBar value={p.pct} color={s.c} h={6}/></div><span style={{fontSize:13,fontWeight:700,color:s.c}}>{p.pct}%</span><ChevronRight size={13} color={C.dim}/></div></div>;})}</div>;
      }

      return <div style={{color:C.muted,padding:40,textAlign:"center"}}>Раздел в разработке</div>;
    }}/>
  );
}

// ─── MACHINE DETAIL CARD (with period selector) ──────────────────────────────
function MachineDetailCard({ machine:m, onTO, onTech, onDelete, onRelocate }) {
  const PERIODS = [
    { id:"day",     label:"Сегодня"    },
    { id:"week",    label:"Неделя"     },
    { id:"month",   label:"Месяц"      },
    { id:"quarter", label:"Квартал"    },
    { id:"year",    label:"Год"        },
    { id:"custom",  label:"Период ↓"  },
  ];

  const [period, setPeriod] = useState("month");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const sc = {online:C.green, offline:C.red, repair:C.amber}[m.status] || C.muted;

  // Multipliers for mock data per period
  const mult = { day:1/30, week:7/30, month:1, quarter:3, year:12 };
  const k = period === "custom" ? 1 : (mult[period] || 1);

  // Derived stats for selected period
  const washes  = Math.round(m.wm * k);
  const revenue = Math.round(m.rm * k);
  const downtime = Math.round(m.dt * (k < 1 ? 1 : k));
  const avgPerDay = period === "day" ? m.wd : Math.round(washes / (period==="week"?7:period==="month"?30:period==="quarter"?90:365));

  // Chart data — 7 points scaled to period
  const chartPoints = WASHES_TREND.map((d,i) => ({
    d: d.d,
    w: m.status !== "online" ? 0 : Math.round(d.w / 6 * (m.wd / 87 || 0.5) * (period==="day"?1:1)),
    r: m.status !== "online" ? 0 : Math.round(d.r / 6 * (m.rd / 8700 || 0.5)),
  }));

  const periodLabel = period === "custom" && dateFrom && dateTo
    ? `${dateFrom} → ${dateTo}`
    : PERIODS.find(p => p.id === period)?.label || "Месяц";

  return (
    <div>
      {/* Header */}
      <div style={{...CS, marginBottom:14, borderColor:`${sc}33`}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16}}>
          <div>
            <div style={{fontSize:20, fontWeight:700, color:"#f0f4ff"}}>{m.id} · {m.place}</div>
            <div style={{display:"flex", alignItems:"center", gap:8, marginTop:6}}>
              <MPill status={m.status}/>
              <span style={{fontSize:12, color:C.muted}}>{m.addr}</span>
            </div>
          </div>
          <div style={{display:"flex", gap:8}}>
            <Btn variant="amber" onClick={onRelocate}><Navigation size={12}/>Релоцировать</Btn>
            <Btn variant="danger" onClick={onDelete}><span style={{fontSize:14}}>✕</span>Удалить</Btn>
          </div>
        </div>

        {/* Period Selector */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:10, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8}}>
            Период статистики
          </div>
          <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
            {PERIODS.map(p => (
              <button key={p.id} onClick={()=>setPeriod(p.id)} style={{
                padding:"6px 14px", borderRadius:8, fontSize:12, fontWeight:600,
                cursor:"pointer", border:"none", transition:"all .15s",
                background: period === p.id ? C.cyan : "rgba(255,255,255,0.06)",
                color: period === p.id ? "#001824" : C.muted,
                boxShadow: period === p.id ? `0 0 10px ${C.cyan}44` : "none",
              }}>{p.label}</button>
            ))}
          </div>
          {/* Custom date picker */}
          {period === "custom" && (
            <div style={{display:"flex", gap:10, alignItems:"center", marginTop:12}}>
              <div style={{flex:1}}>
                <div style={{fontSize:10, color:C.dim, marginBottom:4}}>От</div>
                <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)}
                  style={{width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`,
                    borderRadius:8, padding:"8px 11px", color:C.text, fontSize:12, outline:"none"}}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:10, color:C.dim, marginBottom:4}}>До</div>
                <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)}
                  style={{width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`,
                    borderRadius:8, padding:"8px 11px", color:C.text, fontSize:12, outline:"none"}}/>
              </div>
              <div style={{paddingTop:20}}>
                <Btn variant="primary" style={{fontSize:11, padding:"7px 14px"}}>
                  <Activity size={11}/>Применить
                </Btn>
              </div>
            </div>
          )}
        </div>

        {/* Period label */}
        <div style={{fontSize:11, color:C.cyan, fontWeight:600, marginBottom:12, display:"flex", alignItems:"center", gap:6}}>
          <Activity size={11}/>Статистика за: {periodLabel}
        </div>

        {/* KPI row — period-aware */}
        <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:14}}>
          {[
            { l:"Всего моек",    v:washes.toLocaleString("ru"),          c:m.wd>0?C.cyan:C.muted,  sub:`~${avgPerDay}/день` },
            { l:"Выручка",       v:`₽ ${(revenue/1000).toFixed(1)}к`,    c:C.green,                 sub:`₽${Math.round(revenue/Math.max(washes,1))}/мойку` },
            { l:"Uptime",        v:`${m.up}%`,                           c:m.up>90?C.green:C.amber, sub:period==="day"?`Сегодня`:`За ${periodLabel.toLowerCase()}` },
            { l:"Простой",       v:`${downtime} ч`,                      c:m.dt>0?C.red:C.green,    sub:"часов без работы" },
            { l:"Ср. моек/день", v:avgPerDay,                            c:C.cyan,                  sub:"средний показатель" },
            { l:"Упущ. выручка", v:m.dt>0?`₽${(m.dt*300).toLocaleString("ru")}`:"₽ 0", c:m.dt>0?C.red:C.green, sub:"из-за простоя" },
          ].map(s => (
            <div key={s.l} style={{background:"rgba(255,255,255,0.03)", borderRadius:9, padding:"10px 12px"}}>
              <div style={{fontSize:9, color:C.muted, textTransform:"uppercase", marginBottom:4}}>{s.l}</div>
              <div style={{fontSize:18, fontWeight:700, color:s.c, marginBottom:2}}>{s.v}</div>
              <div style={{fontSize:10, color:C.dim}}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Uptime bar */}
        <div style={{marginBottom:5, display:"flex", justifyContent:"space-between", fontSize:11, color:C.muted}}>
          <span>Uptime</span><span style={{color:m.up>90?C.green:C.amber}}>{m.up}%</span>
        </div>
        <PBar value={m.up} color={m.up>90?C.green:m.up>70?C.amber:C.red} h={7}/>
      </div>

      {/* Chart */}
      <div style={{...CS, marginBottom:14}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14}}>
          <div style={{fontSize:11, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em"}}>
            График моек · {periodLabel}
          </div>
          <div style={{display:"flex", gap:12, fontSize:11, color:C.muted}}>
            <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:10,height:3,background:C.cyan,display:"inline-block",borderRadius:2}}/>Мойки</span>
            <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:10,height:3,background:C.green,display:"inline-block",borderRadius:2}}/>Выручка</span>
          </div>
        </div>
        {m.status !== "online" ? (
          <div style={{textAlign:"center", padding:"30px 0", color:C.muted, fontSize:12}}>
            Автомат не в сети — данные недоступны
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartPoints} margin={{left:-20, right:5, top:5}}>
              <defs>
                <linearGradient id={`wg_${m.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.cyan}  stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={C.cyan}  stopOpacity={0}/>
                </linearGradient>
                <linearGradient id={`rg_${m.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.green} stopOpacity={0.15}/>
                  <stop offset="95%" stopColor={C.green} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
              <XAxis dataKey="d" tick={{fill:"#475569", fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#475569", fontSize:9}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:"#1a2235", border:`1px solid ${C.border}`, borderRadius:8, color:"#f0f4ff", fontSize:11}}/>
              <Area type="monotone" dataKey="w" stroke={C.cyan}  strokeWidth={2} fill={`url(#wg_${m.id})`} name="Мойки"/>
              <Area type="monotone" dataKey="r" stroke={C.green} strokeWidth={1.5} fill={`url(#rg_${m.id})`} name="Выручка" yAxisId={0}/>
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Details grid */}
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14}}>
        <div style={{...CS}}>
          <div style={{fontSize:11, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:14}}>Расположение</div>
          {[{l:"Место",v:m.place},{l:"Адрес",v:m.addr},{l:"Техник",v:m.tech}].map(f=>(
            <div key={f.l} style={{marginBottom:10}}>
              <div style={{fontSize:10, color:C.dim}}>{f.l}</div>
              <div style={{fontSize:13, color:"#e2e8f0", marginTop:2, fontWeight:500}}>{f.v}</div>
            </div>
          ))}
          <div style={{display:"flex", gap:7, marginTop:8}}>
            <Btn variant="ghost" style={{fontSize:11,padding:"5px 10px"}}><MapPin size={11}/>Google Maps</Btn>
            <Btn variant="ghost" style={{fontSize:11,padding:"5px 10px"}}><FileText size={11}/>Договор</Btn>
          </div>
        </div>
        <div style={{...CS}}>
          <div style={{fontSize:11, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:14}}>Аренда</div>
          {[
            {l:"Стоимость", v:`₽ ${m.rent.toLocaleString("ru")} / мес`},
            {l:"Следующая оплата", v:m.rent>0?"01.05.2026":"—"},
            {l:"Прибыль с мойки",  v:`₽ ${Math.max(0, Math.round(m.rm/Math.max(m.wm,1) - m.rent/30)).toLocaleString("ru")}`},
          ].map(f=>(
            <div key={f.l} style={{marginBottom:10}}>
              <div style={{fontSize:10, color:C.dim}}>{f.l}</div>
              <div style={{fontSize:13, color:"#e2e8f0", marginTop:2, fontWeight:500}}>{f.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Service history */}
      <div style={{...CS, marginBottom:14}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14}}>
          <div style={{fontSize:11, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em"}}>ТО и обслуживание</div>
          <div style={{display:"flex", gap:7}}>
            <Btn variant="success" onClick={onTO} style={{fontSize:11,padding:"5px 11px"}}><Wrench size={11}/>Назначить ТО</Btn>
            {m.status!=="online" && <Btn variant="danger" onClick={onTech} style={{fontSize:11,padding:"5px 11px"}}><Truck size={11}/>Выезд</Btn>}
          </div>
        </div>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14}}>
          <div style={{background:`${C.muted}10`, borderRadius:9, padding:"10px 12px"}}>
            <div style={{fontSize:10, color:C.dim, marginBottom:3}}>Последнее ТО</div>
            <div style={{fontSize:15, fontWeight:700, color:"#e2e8f0"}}>{m.ls}</div>
          </div>
          <div style={{background:`${C.amber}10`, borderRadius:9, padding:"10px 12px", border:`1px solid ${C.amber}22`}}>
            <div style={{fontSize:10, color:C.dim, marginBottom:3}}>Плановое ТО</div>
            <div style={{fontSize:15, fontWeight:700, color:C.amber}}>{m.ns}</div>
          </div>
        </div>
        {[
          {d:m.ls,   t:"Плановое ТО",        r:"Выполнено", c:C.green},
          {d:"15.03", t:"Замена расходников", r:"Выполнено", c:C.green},
          {d:"01.02", t:"Диагностика",        r:"Выполнено", c:C.green},
          {d:"10.01", t:"Установка и запуск", r:"Выполнено", c:C.cyan},
        ].map((h,i) => (
          <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 12px",borderRadius:8,background:"rgba(255,255,255,0.02)",marginBottom:6,border:`1px solid ${C.border}`}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:h.c,flexShrink:0,boxShadow:`0 0 5px ${h.c}66`}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:600,color:"#e2e8f0"}}>{h.t}</div>
              <div style={{fontSize:11,color:C.muted}}>{h.d}</div>
            </div>
            <Badge color={h.c}>{h.r}</Badge>
          </div>
        ))}
      </div>

      {m.status !== "online" && (
        <div style={{padding:"12px 16px",borderRadius:10,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.25)"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.red,marginBottom:6}}>
            {m.status==="offline" ? `⚠️ Автомат оффлайн ${m.dt} часов` : `🔧 В ремонте ${m.dt} часов`}
          </div>
          <div style={{fontSize:12,color:"#fca5a5"}}>
            Упущено моек: ~{m.dt*3} · Упущено выручки: ₽{(m.dt*3*100).toLocaleString("ru")}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RELOCATE MODAL ──────────────────────────────────────────────────────────
function RelocateModal({ machine, onClose, onSave }) {
  const [step, setStep] = useState(1);
  const [saved, setSaved] = useState(false);
  const [f, setF] = useState({
    country:"", city:"", district:"", address:"", mapsUrl:"",
    techId:"", moveDate:"", notes:"", photos:[],
  });
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const tech = TECHNICIANS.find(t=>t.id===parseInt(f.techId));

  const handleSave = () => {
    setSaved(true);
    setTimeout(()=>{ onSave(f); onClose(); }, 1800);
  };

  return (
    <ModalShell
      title={`Релокация · ${machine.id}`}
      subtitle={`Текущее место: ${machine.place} · ${machine.addr}`}
      steps={["Новое место","Техник","Фото","Подтверждение"]}
      step={step} onStep={setStep} onClose={onClose}
      onSave={handleSave} saveLabel="Запустить релокацию"
      saved={saved}
      savedMsg={tech ? `Задача отправлена → ${tech.telegram}` : "Задача создана"}
      accent={C.amber}
    >
      {step===1 && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* Old location (read-only) */}
          <div style={{padding:"12px 14px",borderRadius:10,background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`}}>
            <div style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",marginBottom:8}}>Текущее расположение</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><div style={{fontSize:10,color:C.dim}}>Место</div><div style={{fontSize:13,color:"#94a3b8",marginTop:2}}>{machine.place}</div></div>
              <div><div style={{fontSize:10,color:C.dim}}>Адрес</div><div style={{fontSize:13,color:"#94a3b8",marginTop:2}}>{machine.addr}</div></div>
            </div>
          </div>
          <div style={{fontSize:11,fontWeight:600,color:C.amber,textTransform:"uppercase",letterSpacing:"0.05em"}}>Новое место размещения</div>
          <Sel label="Страна" value={f.country} onChange={v=>set("country",v)} required
            options={[{value:"",label:"Страна"},{value:"ru",label:"🇷🇺 Россия"},{value:"kz",label:"🇰🇿 Казахстан"},{value:"by",label:"🇧🇾 Беларусь"},{value:"ae",label:"🇦🇪 ОАЭ"}]}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Inp label="Город" placeholder="Москва" value={f.city} onChange={v=>set("city",v)} required/>
            <Inp label="Район" placeholder="Центральный" value={f.district} onChange={v=>set("district",v)}/>
          </div>
          <Inp label="Новый адрес" placeholder="ул. Пушкина, 10" value={f.address} onChange={v=>set("address",v)} required/>
          <div>
            <Inp label="Ссылка Google Maps" placeholder="https://maps.google.com/?q=..." value={f.mapsUrl} onChange={v=>set("mapsUrl",v)}/>
            {f.mapsUrl && (
              <a href={f.mapsUrl} target="_blank" rel="noreferrer"
                style={{display:"inline-flex",alignItems:"center",gap:5,marginTop:6,fontSize:11,color:C.cyan}}>
                <MapPin size={11}/>Проверить на карте
              </a>
            )}
          </div>
          <Inp label="Дата переезда" type="date" value={f.moveDate} onChange={v=>set("moveDate",v)} required/>
        </div>
      )}

      {step===2 && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Sel label="Назначить техника" value={f.techId} onChange={v=>set("techId",v)} required
            options={[{value:"",label:"Выбери техника"},...TECHNICIANS.map(t=>({value:t.id,label:`${t.name} ${!t.active?"(неактивен)":""}`}))]}/>
          {tech && (
            <div style={{background:"rgba(245,158,11,0.06)",borderRadius:9,padding:"14px 16px",border:"1px solid rgba(245,158,11,0.2)"}}>
              <div style={{fontSize:11,color:C.amber,fontWeight:600,marginBottom:10,display:"flex",alignItems:"center",gap:5}}>
                <Send size={11}/>Telegram-уведомление → {tech.telegram}
              </div>
              <div style={{fontSize:12,color:"#e2e8f0",fontFamily:"monospace",lineHeight:1.8,background:"rgba(0,0,0,0.2)",borderRadius:7,padding:"10px 12px"}}>
                🚛 <strong>ЗАДАЧА: Релокация автомата</strong><br/>
                🆔 {machine.id}<br/>
                📍 Откуда: {machine.place}, {machine.addr}<br/>
                📍 Куда: {f.city||"?"}, {f.address||"новый адрес"}<br/>
                📅 Дата переезда: {f.moveDate||"..."}<br/>
                ⚙️ Статус: <strong>Требует выполнения</strong>
              </div>
              <div style={{marginTop:10,padding:"8px 12px",borderRadius:8,background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.15)"}}>
                <div style={{fontSize:11,color:C.green,fontWeight:600,marginBottom:4}}>Что войдёт в задачу техника</div>
                <div style={{fontSize:11,color:"#e2e8f0",lineHeight:1.7}}>
                  ✅ Демонтаж на старом месте<br/>
                  ✅ Транспортировка оборудования<br/>
                  ✅ Монтаж и подключение на новом месте<br/>
                  ✅ Проверка работоспособности<br/>
                  ✅ Фото-отчёт после установки
                </div>
              </div>
            </div>
          )}
          <div>
            <label style={{fontSize:11,fontWeight:600,color:C.muted,display:"block",marginBottom:6,letterSpacing:"0.05em",textTransform:"uppercase"}}>Дополнительные инструкции</label>
            <textarea value={f.notes} onChange={e=>set("notes",e.target.value)}
              placeholder="Особенности нового места, доступ, контакт арендодателя..."
              rows={3} style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 13px",color:C.text,fontSize:13,outline:"none",resize:"vertical",fontFamily:"inherit"}}/>
          </div>
        </div>
      )}

      {step===3 && (
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <PhotoUpload
            photos={f.photos}
            onAdd={()=>set("photos",[...f.photos,Date.now()])}
            onRemove={i=>set("photos",f.photos.filter((_,j)=>j!==i))}
          />
          <div style={{...CS,background:C.surface2,padding:"14px 16px"}}>
            <div style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:10,textTransform:"uppercase"}}>Что снять на новом месте</div>
            {["Общий вид нового расположения","Подготовленное место для автомата","Подъездные пути и парковка"].map((t,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <div style={{width:20,height:20,borderRadius:"50%",background:`${C.amber}18`,border:`1px solid ${C.amber}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:C.amber,flexShrink:0}}>{i+1}</div>
                <span style={{fontSize:12,color:"#e2e8f0"}}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {step===4 && (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{fontSize:13,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>Проверь данные релокации</div>
          {[
            {l:"Автомат",           v:machine.id},
            {l:"Откуда",           v:`${machine.place} · ${machine.addr}`},
            {l:"Куда (страна)",    v:f.country||"—"},
            {l:"Куда (город)",     v:[f.city,f.district].filter(Boolean).join(", ")||"—"},
            {l:"Новый адрес",      v:f.address||"—"},
            {l:"Дата переезда",    v:f.moveDate||"—"},
            {l:"Ответственный",    v:tech?.name||"Не назначен"},
            {l:"Telegram техника", v:tech?.telegram||"—"},
            {l:"Фото подготовлено",v:`${f.photos.length} фото`},
          ].map(r => (
            <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"9px 13px",borderRadius:9,background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`}}>
              <span style={{fontSize:12,color:C.muted}}>{r.l}</span>
              <span style={{fontSize:12,fontWeight:600,color:"#e2e8f0"}}>{r.v}</span>
            </div>
          ))}
          <div style={{padding:"12px 14px",borderRadius:9,background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.2)"}}>
            <div style={{fontSize:11,color:C.amber,fontWeight:600,display:"flex",alignItems:"center",gap:5}}>
              <Bell size={11}/>После сохранения
            </div>
            <div style={{fontSize:11,color:"#e2e8f0",marginTop:6,lineHeight:1.7}}>
              📱 Telegram с задачей → {tech?.name||"технику"}<br/>
              🗺 Адрес автомата обновится в системе<br/>
              📋 История релокации сохранится в карточке
            </div>
          </div>
        </div>
      )}
    </ModalShell>
  );
}

// ─── DELETE CONFIRM ────────────────────────────────────────────────────────────
function DeleteConfirmModal({ machine, onClose, onConfirm }) {
  const [confirmed, setConfirmed] = useState(false);
  const [input, setInput] = useState("");
  const isMatch = input === machine.id;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{width:"100%",maxWidth:440,background:C.surface,borderRadius:20,border:"1px solid rgba(239,68,68,0.3)",boxShadow:"0 24px 60px rgba(0,0,0,.65)"}}>
        <div style={{padding:"20px 24px 16px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:40,height:40,borderRadius:12,background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <AlertTriangle size={20} color={C.red}/>
            </div>
            <div>
              <div style={{fontSize:16,fontWeight:700,color:"#f0f4ff"}}>Удалить автомат?</div>
              <div style={{fontSize:12,color:C.muted,marginTop:2}}>Это действие нельзя отменить</div>
            </div>
          </div>
        </div>
        <div style={{padding:"20px 24px"}}>
          <div style={{...CS,background:C.surface2,padding:"14px 16px",marginBottom:16}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[{l:"Номер",v:machine.id},{l:"Место",v:machine.place},{l:"Адрес",v:machine.addr},{l:"Статус",v:machine.status}].map(r=>(
                <div key={r.l}><div style={{fontSize:10,color:C.dim}}>{r.l}</div><div style={{fontSize:13,color:"#e2e8f0",marginTop:2,fontWeight:600}}>{r.v}</div></div>
              ))}
            </div>
          </div>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,color:"#e2e8f0",marginBottom:8}}>
              Введи <strong style={{color:C.red}}>{machine.id}</strong> для подтверждения удаления:
            </div>
            <input value={input} onChange={e=>setInput(e.target.value)}
              placeholder={machine.id}
              style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${isMatch?"rgba(239,68,68,0.5)":C.border}`,borderRadius:10,padding:"10px 13px",color:isMatch?C.red:C.text,fontSize:13,outline:"none",fontFamily:"monospace",fontWeight:700}}/>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <Btn onClick={onClose}>Отмена</Btn>
            <Btn variant="danger" disabled={!isMatch} onClick={()=>{ onConfirm(machine.id); onClose(); }}>
              <AlertTriangle size={12}/>Удалить навсегда
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TECHNICAL SECTION ────────────────────────────────────────────────────────
function TechnicalSection() {
  const crm = useCrm();
  const [machines, setMachines] = useState(MACHINES_DB);
  const [showAdd, setShowAdd] = useState(false);
  const [toMachine, setToMachine] = useState(null);
  const [techMachine, setTechMachine] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [relocateTarget, setRelocateTarget] = useState(null);

  const deleteMachine = (id) => { setMachines(p => p.filter(m => m.id !== id)); crm.dbRemove("machines", id); };
  const problems = machines.filter(m => m.status !== "online");
  const lowWashes = machines.filter(m => m.status === "online" && m.wd < 60);

  return (
    <Section title="Технический отдел" subtitle="Нажми на автомат — полная карточка" render={({current, drill}) => {

      // ── ROOT ──────────────────────────────────────────────────────────────
      if (current === "root") return (
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,flex:1,marginRight:12}}>
              <DrillCard label="Online"        value={machines.filter(m=>m.status==="online").length}  accent={C.green} onClick={()=>drill("tech-online","Online автоматы")}/>
              <DrillCard label="Offline/Ремонт" value={`${machines.filter(m=>m.status==="offline").length}/${machines.filter(m=>m.status==="repair").length}`} accent={C.red} onClick={()=>drill("tech-problems","Требуют внимания")}/>
              <DrillCard label="Просроч. ТО"  value="1"                                                accent={C.amber} onClick={()=>drill("tech-to","График ТО")}/>
              <DrillCard label="Моек сегодня" value={machines.reduce((s,m)=>s+m.wd,0)}                accent={C.cyan}  onClick={()=>drill("tech-washes","Мойки")}/>
            </div>
            <Btn variant="primary" onClick={()=>setShowAdd(true)}><Plus size={13}/>Добавить автомат</Btn>
          </div>

          {/* Offline alerts */}
          {problems.length > 0 && (
            <div style={{marginBottom:18}}>
              <div style={{fontSize:11,fontWeight:600,color:C.red,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10,display:"flex",alignItems:"center",gap:6}}>
                <AlertTriangle size={12}/>Требуют внимания · {problems.length}
              </div>
              {problems.map(m => (
                <div key={m.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:11,marginBottom:8,
                  border:`1px solid ${m.status==="offline"?"rgba(239,68,68,.35)":"rgba(245,158,11,.3)"}`,
                  background:m.status==="offline"?"rgba(239,68,68,.08)":"rgba(245,158,11,.07)"}}>
                  {m.status==="offline" ? <WifiOff size={16} color={C.red}/> : <Wrench size={16} color={C.amber}/>}
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:m.status==="offline"?"#fca5a5":"#fcd34d"}}>
                      {m.id} — {m.place} <span style={{fontSize:11,fontWeight:400}}>{m.dt}ч простой</span>
                    </div>
                    <div style={{fontSize:11,color:C.muted}}>{m.addr}</div>
                  </div>
                  <div style={{display:"flex",gap:7}}>
                    <Btn variant={m.status==="offline"?"danger":"amber"} onClick={()=>setTechMachine(m)} style={{fontSize:11,padding:"5px 11px"}}><Truck size={11}/>Выезд</Btn>
                    <Btn variant="ghost" style={{fontSize:11,padding:"5px 11px"}}><Navigation size={11}/>Карта</Btn>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Low washes */}
          {lowWashes.length > 0 && (
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",borderRadius:9,border:"1px solid rgba(129,140,248,.25)",background:"rgba(129,140,248,.07)",marginBottom:18}}>
              <TrendingDown size={13} color={C.purple}/>
              <span style={{fontSize:12,color:"#c4b5fd",flex:1}}>{lowWashes.map(m=>m.id).join(", ")} — мало моек (&lt;60/день)</span>
              <button style={{fontSize:11,color:C.purple,background:"rgba(129,140,248,.15)",border:"1px solid rgba(129,140,248,.3)",borderRadius:7,padding:"3px 9px",cursor:"pointer",fontWeight:600}}>→ Задача в маркетинг</button>
            </div>
          )}

          {/* Machine list */}
          <div style={{...CS,marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:14,textTransform:"uppercase",letterSpacing:"0.06em"}}>
              Парк автоматов · {machines.length} шт.
            </div>
            {machines.map(m => (
              <div key={m.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:10,background:"rgba(255,255,255,0.02)",marginBottom:8,border:`1px solid ${C.border}`,transition:"all .15s"}}>
                {/* Clickable area → drill */}
                <div onClick={()=>drill(`tech-m-${m.id}`, `${m.id} · ${m.place}`)}
                  style={{display:"flex",alignItems:"center",gap:12,flex:1,cursor:"pointer"}}
                  onMouseEnter={e=>e.currentTarget.parentElement.style.borderColor=`${C.cyan}44`}
                  onMouseLeave={e=>e.currentTarget.parentElement.style.borderColor=C.border}>
                  <MPill status={m.status}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:700,color:"#f0f4ff"}}>{m.id} · {m.place}</div>
                    <div style={{fontSize:11,color:C.muted,marginTop:2}}>
                      {m.addr} · Техник: {m.tech} · ТО: {m.ns}
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7,flexShrink:0}}>
                    {[{l:"Моек",v:m.wd,c:m.wd>0?C.cyan:C.muted},{l:"Выр/д",v:`₽${(m.rd/1000).toFixed(1)}к`,c:C.green},{l:"Up%",v:`${m.up}%`,c:m.up>90?C.green:C.amber}].map(s=>(
                      <div key={s.l} style={{background:"rgba(255,255,255,0.04)",borderRadius:7,padding:"5px 8px",textAlign:"center"}}>
                        <div style={{fontSize:9,color:C.muted,textTransform:"uppercase"}}>{s.l}</div>
                        <div style={{fontSize:12,fontWeight:700,color:s.c}}>{s.v}</div>
                      </div>
                    ))}
                  </div>
                  {m.dt > 0 && <Badge color={C.red}>{m.dt}ч</Badge>}
                  <ChevronRight size={13} color={C.dim}/>
                </div>
                {/* Delete button */}
                <button onClick={e=>{e.stopPropagation();setDeleteTarget(m);}}
                  style={{width:30,height:30,borderRadius:8,background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.15)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(239,68,68,0.2)";e.currentTarget.style.borderColor="rgba(239,68,68,0.4)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="rgba(239,68,68,0.06)";e.currentTarget.style.borderColor="rgba(239,68,68,0.15)";}}>
                  <span style={{fontSize:14,color:C.red}}>✕</span>
                </button>
              </div>
            ))}
          </div>

          {/* Technicians */}
          <div style={{...CS}}>
            <div style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:14,textTransform:"uppercase",letterSpacing:"0.06em"}}>Технический персонал</div>
            {TECHNICIANS.map(t => (
              <div key={t.id} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 14px",borderRadius:9,background:"rgba(255,255,255,0.02)",border:`1px solid ${C.border}`,marginBottom:8}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:`${t.active?C.green:C.muted}22`,border:`1px solid ${t.active?C.green:C.muted}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:t.active?C.green:C.muted,flexShrink:0}}>{t.name[0]}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#f0f4ff"}}>{t.name}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:2}}>{t.phone} · <span style={{color:C.cyan}}>{t.telegram}</span></div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:11,color:C.muted}}>Авт: <strong style={{color:C.cyan}}>{machines.filter(m=>m.tech===t.name).length}</strong></div>
                  <div style={{marginTop:4}}><Badge color={t.active?C.green:C.muted}>{t.active?"Активен":"Неактивен"}</Badge></div>
                </div>
              </div>
            ))}
          </div>

          {/* Modals */}
          {showAdd && <AddMachineModal onClose={()=>setShowAdd(false)} onSave={f=>{const row={id:f.number||`AW-00${machines.length+1}`,place:f.address,addr:[f.city,f.address].filter(Boolean).join(", "),status:"online",wd:0,wm:0,rd:0,rm:0,up:100,dt:0,rent:0,ls:"—",ns:"—",tech:TECHNICIANS.find(t=>t.id===parseInt(f.techId))?.name||"—",mapsUrl:f.mapsUrl};setMachines(p=>[...p,row]);crm.dbInsert("machines",row);}}/>}
          {toMachine && <ScheduleToModal machine={toMachine} onClose={()=>setToMachine(null)}/>}
          {techMachine && <SendTechModal machine={techMachine} onClose={()=>setTechMachine(null)}/>}
          {deleteTarget && <DeleteConfirmModal machine={deleteTarget} onClose={()=>setDeleteTarget(null)} onConfirm={deleteMachine}/>}
          {relocateTarget && <RelocateModal machine={relocateTarget} onClose={()=>setRelocateTarget(null)} onSave={f=>{const patch={place:f.address,addr:[f.city,f.address].filter(Boolean).join(", "),mapsUrl:f.mapsUrl};setMachines(p=>p.map(m=>m.id===relocateTarget.id?{...m,...patch}:m));crm.dbUpdate("machines",relocateTarget.id,patch);}}/>}
        </div>
      );

      // ── SINGLE MACHINE FULL CARD ──────────────────────────────────────────
      if (current.startsWith("tech-m-")) {
        const mid = current.replace("tech-m-","");
        const m = machines.find(x=>x.id===mid) || machines[0];
        return (
          <div>
            <MachineDetailCard
              machine={m}
              onTO={()=>setToMachine(m)}
              onTech={()=>setTechMachine(m)}
              onDelete={()=>setDeleteTarget(m)}
              onRelocate={()=>setRelocateTarget(m)}
            />
            {toMachine && <ScheduleToModal machine={toMachine} onClose={()=>setToMachine(null)}/>}
            {techMachine && <SendTechModal machine={techMachine} onClose={()=>setTechMachine(null)}/>}
            {deleteTarget && <DeleteConfirmModal machine={deleteTarget} onClose={()=>setDeleteTarget(null)} onConfirm={deleteMachine}/>}
            {relocateTarget && <RelocateModal machine={relocateTarget} onClose={()=>setRelocateTarget(null)} onSave={f=>{const patch={place:f.address,addr:[f.city,f.address].filter(Boolean).join(", "),mapsUrl:f.mapsUrl};setMachines(p=>p.map(mm=>mm.id===relocateTarget.id?{...mm,...patch}:mm));crm.dbUpdate("machines",relocateTarget.id,patch);}}/>}
          </div>
        );
      }
      // ── FILTERED LISTS ────────────────────────────────────────────────────
      const filteredM = current==="tech-online"
        ? machines.filter(m=>m.status==="online")
        : current==="tech-problems"
        ? machines.filter(m=>m.status!=="online")
        : machines;

      return (
        <div style={{...CS}}>
          {filteredM.map(m => (
            <div key={m.id} onClick={()=>drill(`tech-m-${m.id}`,`${m.id} · ${m.place}`)}
              style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:9,background:"rgba(255,255,255,0.02)",marginBottom:7,cursor:"pointer",border:`1px solid ${C.border}`,transition:"all .15s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=`${C.cyan}44`}
              onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
              <MPill status={m.status}/>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:"#f0f4ff"}}>{m.id} · {m.place}</div>
                <div style={{fontSize:11,color:C.muted}}>ТО: {m.ns} · Моек: {m.wd} · {m.tech}</div>
              </div>
              {m.dt>0 && <Badge color={C.red}>{m.dt}ч</Badge>}
              <ChevronRight size={13} color={C.dim}/>
            </div>
          ))}
        </div>
      );
    }}/>
  );
}


// ─── CLIENTS SECTION ──────────────────────────────────────────────────────────
function ClientsSection() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("washes");
  const [tab, setTab] = useState("list");
  // Zoho removed — using local CLIENTS_DB

  // Клиенты из локальной БД
  const zohoMapped = [].map((c,i) => ({
    id: 100+i, name: [c.First_Name,c.Last_Name].filter(Boolean).join(" ")||"—",
    phone: c.Phone||c.Mobile||"", email: c.Email||"",
    city: c.Mailing_City||c.Account_Name||"—", district:"",
    source: c.Lead_Source||"CRM", gender:"М", age:0,
    helmet:"M", moped:"—", vouchers:0, washes: c.Number_Of_Chats||0,
    joined: c.Created_Time?new Date(c.Created_Time).toLocaleDateString("ru-RU",{day:"2-digit",month:"2-digit",year:"2-digit"}):"—",
    active:true, refs:0,
  }));
  const ALL_CLIENTS = [...ALL_CLIENTS, ...zohoMapped];

  const sorted = [...ALL_CLIENTS]
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.city.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => b[sortBy] - a[sortBy]);

  const totalW = ALL_CLIENTS.reduce((s,c)=>s+c.washes,0);
  const totalV = ALL_CLIENTS.reduce((s,c)=>s+c.vouchers,0);
  const totalR = ALL_CLIENTS.reduce((s,c)=>s+c.refs,0);
  const activeC = ALL_CLIENTS.filter(c=>c.active).length;

  const sourceData = Object.entries(
    ALL_CLIENTS.reduce((acc,c)=>{ acc[c.source]=(acc[c.source]||0)+1; return acc; }, {})
  ).sort((a,b)=>b[1]-a[1]);

  const helmetData = Object.entries(
    ALL_CLIENTS.reduce((acc,c)=>{ acc[c.helmet]=(acc[c.helmet]||0)+1; return acc; }, {})
  ).sort((a,b)=>{ const order=["XS","S","M","L","XL","XXL"]; return order.indexOf(a[0])-order.indexOf(b[0]); });

  return (
    <Section title="Клиентская база" subtitle="Аналитика · Ваучеры · Реферальная система" render={({current,drill})=>{
      if(current==="root") return (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
            <DrillCard label="Всего клиентов" value={ALL_CLIENTS.length} sub={`${activeC} активных`} accent={C.cyan} icon={Users} onClick={()=>drill("all-clients","Все клиенты")}/>
            <DrillCard label="Моек всего" value={totalW} trend="+12%" trendUp accent={C.green} icon={Droplets} onClick={()=>drill("wash-stats","Статистика моек")}/>
            <DrillCard label="Ваучеров активных" value={totalV} sub="у клиентов" accent={C.amber} icon={Gift} onClick={()=>drill("vouchers","Ваучеры")}/>
            <DrillCard label="Рефералов всего" value={totalR} trend="+8" trendUp accent={C.purple} icon={UserPlus} onClick={()=>drill("referrals","Реферальная система")}/>
          </div>

          <Tabs tabs={[["list","Клиенты"],["analytics","Аналитика"],["referrals-tab","Рефералы"]]} active={tab} onChange={setTab}/>

          {tab==="list"&&(
            <div>
              <div style={{display:"flex",gap:10,marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:7,flex:1,background:C.surface2,border:`1px solid ${C.border}`,borderRadius:9,padding:"7px 12px"}}>
                  <Search size={13} color={C.muted}/>
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Поиск по имени, городу..."
                    style={{background:"none",border:"none",outline:"none",color:C.text,fontSize:13,width:"100%"}}/>
                </div>
                <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
                  style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:9,padding:"7px 13px",color:C.text,fontSize:12,outline:"none"}}>
                  <option value="washes">По мойкам</option>
                  <option value="vouchers">По ваучерам</option>
                  <option value="refs">По рефералам</option>
                </select>
              </div>
              <div style={{...CS,padding:0,overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead><tr style={{borderBottom:`1px solid ${C.border}`}}>
                    {["Клиент","Город","Шлем","Мопед","Мойки","Ваучеры","Рефералы","Статус"].map(h=>(
                      <th key={h} style={{textAlign:"left",padding:"10px 14px",fontSize:10,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em"}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>{sorted.map(c=>(
                    <tr key={c.id} onClick={()=>drill(`client-${c.id}`,c.name)}
                      style={{borderBottom:"1px solid rgba(255,255,255,0.04)",cursor:"pointer"}}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{padding:"10px 14px"}}><div style={{fontSize:13,fontWeight:600,color:"#f0f4ff"}}>{c.name}</div><div style={{fontSize:10,color:C.muted}}>{c.email}</div></td>
                      <td style={{padding:"10px 14px",color:C.muted,fontSize:12}}>{c.city}</td>
                      <td style={{padding:"10px 14px"}}><Badge color={C.cyan}>{c.helmet}</Badge></td>
                      <td style={{padding:"10px 14px",fontSize:12,color:C.muted}}>{c.moped}</td>
                      <td style={{padding:"10px 14px",fontSize:14,fontWeight:700,color:C.cyan}}>{c.washes}</td>
                      <td style={{padding:"10px 14px"}}><Badge color={c.vouchers>0?C.amber:C.muted}>{c.vouchers} шт.</Badge></td>
                      <td style={{padding:"10px 14px",fontSize:13,fontWeight:700,color:C.purple}}>{c.refs}</td>
                      <td style={{padding:"10px 14px"}}><Badge color={c.active?C.green:C.muted}>{c.active?"Активен":"Неактивен"}</Badge></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}

          {tab==="analytics"&&(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                <div style={{...CS}}>
                  <div style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",marginBottom:14,letterSpacing:"0.06em"}}>Источник регистрации</div>
                  {sourceData.map(([src,count],i)=>(
                    <div key={src} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                      <div style={{width:90,fontSize:12,color:"#e2e8f0",flexShrink:0}}>{src}</div>
                      <div style={{flex:1}}><PBar value={count/ALL_CLIENTS.length*100} color={[C.cyan,C.purple,C.amber,C.green,C.pink][i%5]}/></div>
                      <div style={{fontSize:13,fontWeight:700,color:"#e2e8f0",minWidth:20}}>{count}</div>
                    </div>
                  ))}
                </div>
                <div style={{...CS}}>
                  <div style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",marginBottom:14,letterSpacing:"0.06em"}}>Размер шлема</div>
                  {helmetData.map(([size,count])=>(
                    <div key={size} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                      <div style={{width:40,fontSize:12,color:"#e2e8f0",flexShrink:0,fontWeight:700}}>{size}</div>
                      <div style={{flex:1}}><PBar value={count/ALL_CLIENTS.length*100} color={C.cyan}/></div>
                      <div style={{fontSize:13,fontWeight:700,color:C.cyan,minWidth:20}}>{count}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
                <Stat label="Муж. / Жен." value={`${ALL_CLIENTS.filter(c=>c.gender==="М").length} / ${ALL_CLIENTS.filter(c=>c.gender==="Ж").length}`} color={C.cyan}/>
                <Stat label="Средний возраст" value={`${Math.round(ALL_CLIENTS.reduce((s,c)=>s+c.age,0)/ALL_CLIENTS.length)} лет`} color={C.purple}/>
                <Stat label="Ср. моек / клиент" value={(totalW/ALL_CLIENTS.length).toFixed(1)} color={C.green}/>
              </div>
            </div>
          )}

          {tab==="referrals-tab"&&(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}}>
                <Stat label="Всего рефералов" value={totalR} color={C.purple}/>
                <Stat label="Топ реферер" value={ALL_CLIENTS.sort((a,b)=>b.refs-a.refs)[0]?.name||"—"} color={C.cyan}/>
                <Stat label="Ср. рефералов" value={(totalR/ALL_CLIENTS.length).toFixed(1)} color={C.amber}/>
              </div>
              <div style={{...CS}}>
                <div style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",marginBottom:14,letterSpacing:"0.06em"}}>Рейтинг рефереров</div>
                {[...ALL_CLIENTS].sort((a,b)=>b.refs-a.refs).filter(c=>c.refs>0).map((c,i)=>(
                  <div key={c.id} onClick={()=>drill(`client-${c.id}`,c.name)}
                    style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:9,background:"rgba(255,255,255,0.02)",marginBottom:7,cursor:"pointer",border:`1px solid ${C.border}`,transition:"all .15s"}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=`${C.purple}44`}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                    <div style={{width:22,height:22,borderRadius:"50%",background:`${C.purple}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:C.purple,flexShrink:0}}>{i+1}</div>
                    <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"#f0f4ff"}}>{c.name}</div><div style={{marginTop:4}}><PBar value={c.refs/12*100} color={C.purple}/></div></div>
                    <div style={{fontSize:18,fontWeight:700,color:C.purple,minWidth:40,textAlign:"right"}}>{c.refs}</div>
                    <ChevronRight size={13} color={C.dim}/>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );

      if(current.startsWith("client-")) {
        const id=parseInt(current.replace("client-",""));
        const c=ALL_CLIENTS.find(x=>x.id===id)||ALL_CLIENTS[0];
        return (
          <div>
            <div style={{...CS,marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <Av initials={c.name.slice(0,2)} color={C.cyan} size={50}/>
                  <div>
                    <div style={{fontSize:18,fontWeight:700,color:"#f0f4ff"}}>{c.name}</div>
                    <div style={{fontSize:12,color:C.muted,marginTop:3}}>{c.city} · {c.district}</div>
                    <div style={{display:"flex",gap:6,marginTop:6}}>
                      <Badge color={c.active?C.green:C.muted}>{c.active?"Активен":"Неактивен"}</Badge>
                      <Badge color={C.cyan}>{c.source}</Badge>
                    </div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:10,color:C.muted,marginBottom:4}}>С нами с</div>
                  <div style={{fontSize:14,fontWeight:700,color:"#f0f4ff"}}>{c.joined}</div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
                <Stat label="Всего моек" value={c.washes} color={C.cyan}/>
                <Stat label="Ваучеры" value={c.vouchers} color={C.amber}/>
                <Stat label="Рефералы" value={c.refs} color={C.purple}/>
                <Stat label="Размер шлема" value={c.helmet} color={C.muted}/>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{...CS}}>
                <div style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",marginBottom:12}}>Личные данные</div>
                {[{l:"Email",v:c.email},{l:"Телефон",v:c.phone},{l:"Пол",v:c.gender==="М"?"Мужской":"Женский"},{l:"Возраст",v:`${c.age} лет`},{l:"Мопед",v:c.moped}].map(f=>(
                  <div key={f.l} style={{marginBottom:8}}><div style={{fontSize:10,color:C.dim}}>{f.l}</div><div style={{fontSize:13,color:"#e2e8f0",marginTop:2}}>{f.v}</div></div>
                ))}
              </div>
              <div style={{...CS}}>
                <div style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",marginBottom:12}}>Программа лояльности</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                  <Stat label="Моек до ваучера" value={5-c.washes%5} color={C.amber}/>
                  <Stat label="Ваучеров" value={c.vouchers} color={C.amber}/>
                </div>
                <PBar value={((c.washes%5)/5)*100} color={C.amber} h={8}/>
                <div style={{fontSize:11,color:C.muted,marginTop:6}}>{c.washes%5} из 5 моек до следующего ваучера</div>
                <div style={{marginTop:14}}>
                  <Btn variant="amber" style={{width:"100%",justifyContent:"center",marginBottom:8}}>
                    <Gift size={12}/>Начислить ваучер
                  </Btn>
                  <Btn variant="ghost" style={{width:"100%",justifyContent:"center"}}>
                    <Send size={12}/>Отправить уведомление
                  </Btn>
                </div>
              </div>
            </div>
          </div>
        );
      }

      if(current==="vouchers") return (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
            <Stat label="Активных ваучеров" value={totalV} color={C.amber}/>
            <Stat label="Использовано (мес.)" value="34" color={C.green}/>
            <Stat label="Выдано всего" value="128" color={C.muted}/>
          </div>
          <div style={{...CS}}>
            <div style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",marginBottom:14,letterSpacing:"0.06em"}}>Клиенты с ваучерами</div>
            {ALL_CLIENTS.filter(c=>c.vouchers>0).map(c=>(
              <div key={c.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:9,background:"rgba(255,255,255,0.02)",marginBottom:7,border:`1px solid ${C.border}`}}>
                <Av initials={c.name.slice(0,2)} color={C.amber} size={32}/>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"#f0f4ff"}}>{c.name}</div><div style={{fontSize:11,color:C.muted}}>{c.city}</div></div>
                <div style={{display:"flex",gap:6}}>{Array.from({length:c.vouchers}).map((_,i)=>(
                  <div key={i} style={{width:24,height:24,borderRadius:"50%",background:`${C.amber}22`,border:`1px solid ${C.amber}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:C.amber}}>🎫</div>
                ))}</div>
              </div>
            ))}
          </div>
        </div>
      );

      return <div style={{color:C.muted,padding:40,textAlign:"center"}}>Раздел в разработке</div>;
    }}/>
  );
}

// ─── NOTIFICATIONS SECTION ────────────────────────────────────────────────────
function NotificationsSection() {
  const [tab, setTab] = useState("history");
  const [notifType, setNotifType] = useState("all");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState("all");
  const [schedDate, setSchedDate] = useState("");
  const [sent, setSent] = useState(false);

  const levelColor={all:C.cyan,geo:C.green,segment:C.purple};

  return (
    <Section title="Push-уведомления" subtitle="Отправка по группам и геолокации" render={({current,drill})=>{
      if(current==="root") return (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
            <DrillCard label="Отправлено (мес.)" value="1 184" trend="+23%" trendUp accent={C.cyan} icon={Radio} onClick={()=>drill("stats-notif","Статистика")}/>
            <DrillCard label="Открытий" value="56.8%" trend="+4%" trendUp accent={C.green} icon={Activity} onClick={()=>drill("stats-notif","Статистика")}/>
            <DrillCard label="Гео-тригеры" value="3" sub="активных" accent={C.amber} icon={MapPin} onClick={()=>drill("geo-notif","Гео-уведомления")}/>
            <DrillCard label="Запланировано" value={NOTIF_HISTORY.filter(n=>n.status==="scheduled").length} accent={C.purple} icon={Clock} onClick={()=>drill("scheduled","Запланированные")}/>
          </div>

          <Tabs tabs={[["history","История"],["create","Создать"]]} active={tab} onChange={setTab}/>

          {tab==="history"&&(
            <div>
              {NOTIF_HISTORY.map(n=>{
                const tc={all:C.cyan,geo:C.green,segment:C.purple}[n.target]||C.muted;
                const tl={all:"Всем",geo:"Геолокация",segment:"Сегмент"}[n.target]||n.target;
                const openRate=n.sent>0?Math.round(n.opened/n.sent*100):0;
                return (
                  <div key={n.id} style={{...CS,padding:"16px 18px",marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                      <div>
                        <div style={{fontSize:14,fontWeight:700,color:"#f0f4ff"}}>{n.title||n.name}</div>
                        <div style={{fontSize:12,color:C.muted,marginTop:3}}>{n.body}</div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                        <Badge color={tc}>{tl}</Badge>
                        <Badge color={n.status==="sent"?C.green:C.amber}>{n.status==="sent"?"Отправлено":"Запланировано"}</Badge>
                      </div>
                    </div>
                    {n.sent>0&&(
                      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                        <Stat label="Отправлено" value={n.sent} color={C.cyan}/>
                        <Stat label="Открыто" value={n.opened} color={C.green}/>
                        <Stat label="Open Rate" value={`${openRate}%`} color={openRate>50?C.green:C.amber}/>
                      </div>
                    )}
                    <div style={{fontSize:11,color:C.dim,marginTop:8}}>{n.date}</div>
                  </div>
                );
              })}
            </div>
          )}

          {tab==="create"&&(
            <div>
              {sent?(
                <div style={{...CS,textAlign:"center",padding:40}}>
                  <CheckCircle size={40} color={C.green} style={{margin:"0 auto 12px",display:"block"}}/>
                  <div style={{fontSize:16,fontWeight:700,color:"#f0f4ff",marginBottom:8}}>Уведомление отправлено!</div>
                  <div style={{fontSize:12,color:C.muted}}>Получателей: {CLIENTS_DB.length}</div>
                  <Btn style={{margin:"16px auto 0"}} onClick={()=>{setSent(false);setTitle("");setBody("");}}>
                    Создать ещё
                  </Btn>
                </div>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  <Inp label="Заголовок уведомления" placeholder="Акция — бесплатная мойка!" value={title} onChange={setTitle} required/>
                  <div>
                    <label style={{fontSize:11,fontWeight:600,color:C.muted,display:"block",marginBottom:6,letterSpacing:"0.05em",textTransform:"uppercase"}}>Текст <span style={{color:C.red}}>*</span></label>
                    <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Текст push-уведомления..." rows={3}
                      style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 13px",color:C.text,fontSize:13,outline:"none",resize:"vertical",fontFamily:"inherit"}}/>
                  </div>
                  <Sel label="Целевая аудитория" value={target} onChange={setTarget}
                    options={[{value:"all",label:"👥 Все клиенты"},{value:"geo",label:"📍 По геолокации (рядом с аппаратом)"},{value:"segment",label:"🎯 Сегмент (5+ моек)"},{value:"voucher",label:"🎫 Есть ваучеры"},{value:"inactive",label:"💤 Неактивные (7+ дней)"}]}/>
                  <div style={{...CS,background:C.surface2,padding:"14px 16px"}}>
                    <div style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",marginBottom:12}}>Предварительный просмотр</div>
                    <div style={{background:"rgba(0,0,0,0.3)",borderRadius:12,padding:"12px 14px",border:`1px solid ${C.border}`}}>
                      <div style={{fontSize:11,color:C.dim,marginBottom:4}}>HELM CARE</div>
                      <div style={{fontSize:13,fontWeight:700,color:"#f0f4ff"}}>{title||"Заголовок уведомления"}</div>
                      <div style={{fontSize:12,color:C.muted,marginTop:4}}>{body||"Текст уведомления..."}</div>
                    </div>
                    <div style={{marginTop:10,fontSize:12,color:C.muted}}>
                      Получателей: <strong style={{color:C.cyan}}>{target==="all"?CLIENTS_DB.length:target==="geo"?Math.round(CLIENTS_DB.length*0.3):Math.round(CLIENTS_DB.length*0.6)} клиентов</strong>
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                    <Inp label="Запланировать на (опционально)" type="datetime-local" value={schedDate} onChange={setSchedDate}/>
                    <div style={{display:"flex",alignItems:"flex-end"}}>
                      <Btn variant="primary" style={{width:"100%",justifyContent:"center"}} onClick={()=>setSent(true)}>
                        <Send size={13}/>{schedDate?"Запланировать":"Отправить сейчас"}
                      </Btn>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );
      return <div style={{color:C.muted,padding:40,textAlign:"center"}}>Раздел в разработке</div>;
    }}/>
  );
}

// ─── CONTENT SECTION ──────────────────────────────────────────────────────────
function ContentSection() {
  const crm = useCrm();
  const [content2, setContent2] = useState(CONTENT_DB);
  const [uploading, setUploading] = useState(false);

  const handleUpload = () => {
    setUploading(true);
    setTimeout(()=>{
      const row = {name:"Новый файл",type:"image",size:"1.5 МБ",assigned:[],status:"pending",uploaded:new Date().toLocaleDateString("ru")};
      crm.dbInsert("content_items",row).then(saved=>setContent2(p=>[...p,saved||{...row,id:p.length+1}]));
      setUploading(false);
    },1500);
  };

  return (
    <Section title="Контент аппаратов" subtitle="Фото, видео, фоны · Загрузка и назначение" render={({current,drill})=>{
      if(current==="root") return (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
            <DrillCard label="Файлов всего" value={content2.length} accent={C.cyan} icon={Image} onClick={()=>{}}/>
            <DrillCard label="Видео" value={content2.filter(c=>c.type==="video").length} accent={C.purple} icon={Video} onClick={()=>{}}/>
            <DrillCard label="Активных" value={content2.filter(c=>c.status==="active").length} accent={C.green} icon={Monitor} onClick={()=>{}}/>
            <DrillCard label="Ожидают" value={content2.filter(c=>c.status==="pending").length} accent={C.amber} icon={Clock} onClick={()=>{}}/>
          </div>

          {/* Upload zone */}
          <div onClick={handleUpload} style={{border:`2px dashed ${uploading?C.green:C.border}`,borderRadius:14,padding:"24px",textAlign:"center",cursor:"pointer",marginBottom:16,transition:"all .2s",background:uploading?"rgba(16,185,129,0.05)":"rgba(255,255,255,0.02)"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.cyan;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=uploading?C.green:C.border;}}>
            {uploading
              ? <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10}}><Loader size={18} color={C.green} style={{animation:"spin 1s linear infinite"}}/><span style={{fontSize:13,color:C.green,fontWeight:600}}>Загружается...</span></div>
              : <div>
                  <Upload size={24} color={C.muted} style={{margin:"0 auto 8px",display:"block"}}/>
                  <div style={{fontSize:14,fontWeight:600,color:"#f0f4ff",marginBottom:4}}>Загрузить новый файл</div>
                  <div style={{fontSize:12,color:C.muted}}>JPG, PNG, MP4, MOV · до 100 МБ</div>
                </div>
            }
          </div>

          <div style={{...CS,padding:0,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{borderBottom:`1px solid ${C.border}`}}>
                {["Файл","Тип","Размер","Назначен на","Статус","Загружен"].map(h=>(
                  <th key={h} style={{textAlign:"left",padding:"10px 14px",fontSize:10,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em"}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>{content2.map(c=>(
                <tr key={c.id} onClick={()=>drill(`content-${c.id}`,c.name)}
                  style={{borderBottom:"1px solid rgba(255,255,255,0.04)",cursor:"pointer"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"10px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:28,height:28,borderRadius:6,background:c.type==="video"?`${C.purple}22`:`${C.cyan}22`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        {c.type==="video"?<Video size={13} color={C.purple}/>:<Image size={13} color={C.cyan}/>}
                      </div>
                      <div style={{fontSize:12,fontWeight:600,color:"#f0f4ff"}}>{c.name}</div>
                    </div>
                  </td>
                  <td style={{padding:"10px 14px"}}><Badge color={c.type==="video"?C.purple:C.cyan}>{c.type}</Badge></td>
                  <td style={{padding:"10px 14px",color:C.muted}}>{c.size}</td>
                  <td style={{padding:"10px 14px"}}>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {c.assigned.length===0
                        ? <span style={{fontSize:11,color:C.dim}}>Не назначен</span>
                        : c.assigned.length>3
                        ? <Badge color={C.green}>Все аппараты</Badge>
                        : c.assigned.map(a=><Badge key={a} color={C.cyan}>{a}</Badge>)
                      }
                    </div>
                  </td>
                  <td style={{padding:"10px 14px"}}><Badge color={c.status==="active"?C.green:C.amber}>{c.status==="active"?"Активен":"Ожидает"}</Badge></td>
                  <td style={{padding:"10px 14px",fontSize:11,color:C.dim}}>{c.uploaded}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      );

      if(current.startsWith("content-")) {
        const id=parseInt(current.replace("content-",""));
        const c=content2.find(x=>x.id===id)||content2[0];
        const [assigned, setAssigned] = useState(c.assigned);
        return (
          <div>
            <div style={{...CS,marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
                <div style={{width:48,height:48,borderRadius:10,background:c.type==="video"?`${C.purple}22`:`${C.cyan}22`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {c.type==="video"?<Video size={22} color={C.purple}/>:<Image size={22} color={C.cyan}/>}
                </div>
                <div>
                  <div style={{fontSize:16,fontWeight:700,color:"#f0f4ff"}}>{c.name}</div>
                  <div style={{fontSize:12,color:C.muted,marginTop:3}}>{c.type} · {c.size} · загружен {c.uploaded}</div>
                </div>
              </div>
              <div style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",marginBottom:12}}>Назначить на автоматы</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {MACHINES_DB.map(m=>{
                  const isA=assigned.includes(m.id);
                  return (
                    <div key={m.id} onClick={()=>setAssigned(a=>isA?a.filter(x=>x!==m.id):[...a,m.id])}
                      style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:9,cursor:"pointer",
                        background:isA?"rgba(0,212,255,0.08)":"rgba(255,255,255,0.02)",
                        border:`1px solid ${isA?"rgba(0,212,255,0.3)":C.border}`,transition:"all .15s"}}>
                      <div style={{width:18,height:18,borderRadius:4,background:isA?C.cyan:"rgba(255,255,255,0.08)",border:`1px solid ${isA?C.cyan:C.dim}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        {isA&&<CheckCircle size={11} color="#001824"/>}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:600,color:isA?"#f0f4ff":C.muted}}>{m.id} · {m.place}</div>
                        <div style={{fontSize:10,color:C.dim}}>{m.addr}</div>
                      </div>
                      <MPill status={m.status}/>
                    </div>
                  );
                })}
              </div>
              <div style={{display:"flex",gap:8,marginTop:14}}>
                <Btn variant="primary" style={{flex:1,justifyContent:"center"}}>
                  <Send size={12}/>Применить на {assigned.length} аппарат{assigned.length===1?"":"а"}
                </Btn>
                <Btn variant="ghost" onClick={()=>setAssigned(MACHINES_DB.map(m=>m.id))}>Выбрать все</Btn>
                <Btn variant="ghost" onClick={()=>setAssigned([])}>Снять все</Btn>
              </div>
            </div>
          </div>
        );
      }
      return <div style={{color:C.muted,padding:40,textAlign:"center"}}>Раздел в разработке</div>;
    }}/>
  );
}

// ─── PRICING SECTION ──────────────────────────────────────────────────────────
function PricingSection() {
  const [prices, setPrices] = useState(PRICING_DB.modes);
  const [rules, setRules] = useState(PRICING_DB.timeRules);
  const [tab, setTab] = useState("base");
  const DAYS = ["МО","ВТ","СР","ЧТ","ПТ","СБ","ВС"];

  const fmtPrice = v => parseInt(v||0).toLocaleString("ru");

  return (
    <Section title="Ценообразование" subtitle="Базовые цены и тарифы по времени" render={({current,drill})=>{
      if(current==="root") return (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
            <Stat label="Режимов мойки" value={prices.length} color={C.cyan}/>
            <Stat label="Временных правил" value={rules.length} color={C.amber}/>
            <Stat label="Мин. цена" value={`₽ ${Math.min(...prices.map(p=>p.basePrice)).toLocaleString("ru")}`} color={C.green}/>
          </div>

          <Tabs tabs={[["base","Базовые цены"],["time","По времени суток"],["schedule","Расписание"]]} active={tab} onChange={setTab}/>

          {tab==="base"&&(
            <div>
              <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginBottom:12}}>
                <Btn variant="ghost"><RefreshCw size={12}/>Применить ко всем аппаратам</Btn>
              </div>
              {prices.map((p,i)=>(
                <div key={p.id} style={{...CS,padding:"16px 18px",marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:"#f0f4ff"}}>{p.name}</div>
                      <div style={{fontSize:12,color:C.muted,marginTop:3}}>Длительность: {p.duration} мин.</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{fontSize:22,fontWeight:700,color:C.green,fontFamily:"monospace"}}>
                        Rp {fmtPrice(p.basePrice)}
                      </div>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <span style={{fontSize:12,color:C.muted}}>Цена:</span>
                    <input type="range" min={5000} max={100000} step={1000} value={p.basePrice}
                      onChange={e=>setPrices(pr=>pr.map((x,j)=>j===i?{...x,basePrice:parseInt(e.target.value)}:x))}
                      style={{flex:1}}/>
                    <input type="number" value={p.basePrice}
                      onChange={e=>setPrices(pr=>pr.map((x,j)=>j===i?{...x,basePrice:parseInt(e.target.value)||0}:x))}
                      style={{width:100,background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 10px",color:C.text,fontSize:13,outline:"none",textAlign:"right"}}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab==="time"&&(
            <div>
              <div style={{...CS,marginBottom:12,padding:"12px 16px",background:"rgba(0,212,255,0.05)",borderColor:"rgba(0,212,255,0.2)"}}>
                <div style={{fontSize:12,color:C.cyan}}>Временные правила применяются поверх базовых цен. Отрицательный % = скидка, положительный = надбавка.</div>
              </div>
              {rules.map((r,i)=>(
                <div key={r.id} style={{...CS,padding:"16px 18px",marginBottom:10,borderColor:`${r.color}33`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:"#f0f4ff"}}>{r.name}</div>
                      <div style={{fontSize:12,color:C.muted,marginTop:3}}>{r.from} — {r.to}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{fontSize:20,fontWeight:700,color:r.discount<0?C.green:C.red}}>
                        {r.discount>0?"+":""}{r.discount}%
                      </div>
                      <Badge color={r.discount<0?C.green:C.red}>{r.discount<0?"Скидка":"Надбавка"}</Badge>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {DAYS.map(d=>(
                      <div key={d} style={{padding:"4px 10px",borderRadius:7,fontSize:11,fontWeight:600,
                        background:r.days.includes(d)?`${r.color}22`:"rgba(255,255,255,0.04)",
                        border:`1px solid ${r.days.includes(d)?r.color+"44":C.border}`,
                        color:r.days.includes(d)?r.color:C.dim}}>{d}</div>
                    ))}
                  </div>
                </div>
              ))}
              <Btn variant="primary" style={{marginTop:8}}><Plus size={12}/>Добавить правило</Btn>
            </div>
          )}

          {tab==="schedule"&&(
            <div style={{...CS}}>
              <div style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",marginBottom:14,letterSpacing:"0.06em"}}>Сетка цен по дням и часам</div>
              <div style={{overflowX:"auto"}}>
                <div style={{display:"grid",gridTemplateColumns:"60px repeat(7,1fr)",gap:4,minWidth:520}}>
                  <div/>
                  {DAYS.map(d=><div key={d} style={{textAlign:"center",fontSize:11,fontWeight:600,color:C.muted,padding:"6px 0"}}>{d}</div>)}
                  {[0,6,12,18,22].map(hour=>(
                    <React.Fragment key={hour}>
                      <div style={{fontSize:10,color:C.dim,padding:"8px 4px",textAlign:"right"}}>{hour}:00</div>
                      {DAYS.map(d=>{
                        const active=rules.filter(r=>r.days.includes(d)&&parseInt(r.from)<=hour&&parseInt(r.to)>hour);
                        const disc=active.reduce((s,r)=>s+r.discount,0);
                        const c2=disc<0?C.green:disc>0?C.red:C.surface2;
                        return (
                          <div key={d} style={{borderRadius:6,padding:"6px 4px",textAlign:"center",background:disc!==0?`${c2}22`:C.surface2,border:`1px solid ${disc!==0?c2+"33":C.border}`}}>
                            <div style={{fontSize:10,fontWeight:700,color:disc!==0?c2:C.dim}}>{disc!==0?`${disc>0?"+":""}${disc}%`:"—"}</div>
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      );
      return <div style={{color:C.muted,padding:40,textAlign:"center"}}>Раздел в разработке</div>;
    }}/>
  );
}

// ─── REPORTS SECTION ──────────────────────────────────────────────────────────
function ReportsSection() {
  const [period, setPeriod] = useState("30 дней");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const mult = {"Сегодня":1/30,"Вчера":1/30,"7 дней":7/30,"30 дней":1,"Квартал":3,"Год":12}[period]||1;
  const totalRev = Math.round(MACHINES_DB.reduce((s,m)=>s+m.rm,0)*mult);
  const totalW   = Math.round(MACHINES_DB.reduce((s,m)=>s+m.wm,0)*mult);
  const totalAdRev = Math.round(35000*mult);
  const avgCheck   = Math.round(totalRev/Math.max(totalW,1));

  const reportData = MACHINES_DB.map(m=>({
    id:m.id, place:m.place, washes:Math.round(m.wm*mult), rev:Math.round(m.rm*mult),
    vouchers:Math.round(m.wm*mult/5), avg:Math.round(m.rm/Math.max(m.wm,1)),
  }));

  return (
    <Section title="Финансовые отчёты" subtitle="Аналитика по датам, мойкам, купонам" render={({current,drill})=>{
      if(current==="root") return (
        <div>
          {/* Period selector */}
          <div style={{...CS,marginBottom:20,padding:"14px 16px"}}>
            <div style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",marginBottom:10,letterSpacing:"0.06em"}}>Период отчёта</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:period==="Период"?12:0}}>
              {REPORTS_PERIODS.map(p=>(
                <button key={p} onClick={()=>setPeriod(p)} style={{padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",border:"none",transition:"all .15s",
                  background:period===p?C.cyan:"rgba(255,255,255,0.06)",
                  color:period===p?"#001824":C.muted,boxShadow:period===p?`0 0 10px ${C.cyan}44`:"none"}}>{p}</button>
              ))}
            </div>
            {period==="Период"&&(
              <div style={{display:"flex",gap:12,marginTop:12}}>
                <Inp label="От" type="date" value={dateFrom} onChange={setDateFrom}/>
                <Inp label="До" type="date" value={dateTo} onChange={setDateTo}/>
                <div style={{display:"flex",alignItems:"flex-end"}}>
                  <Btn variant="primary" style={{padding:"10px 16px"}}><Activity size={12}/>Применить</Btn>
                </div>
              </div>
            )}
          </div>

          {/* KPI */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
            <DrillCard label="Выручка автоматы" value={`₽ ${(totalRev/1000).toFixed(0)}к`} trend="+8%" trendUp accent={C.green} mono onClick={()=>drill("rev-detail","Выручка · детали")}/>
            <DrillCard label="Мойок всего" value={totalW.toLocaleString("ru")} trend="+12%" trendUp accent={C.cyan} onClick={()=>drill("wash-detail","Мойки · детали")}/>
            <DrillCard label="Выручка реклама" value={`₽ ${(totalAdRev/1000).toFixed(0)}к`} accent={C.amber} mono onClick={()=>drill("ads-detail","Реклама · отчёт")}/>
            <DrillCard label="Средний чек" value={`₽ ${avgCheck.toLocaleString("ru")}`} accent={C.purple} mono onClick={()=>{}}/>
          </div>

          {/* Table */}
          <div style={{...CS,padding:0,overflow:"hidden",marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:`1px solid ${C.border}`}}>
              <div style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em"}}>По автоматам · {period}</div>
              <Btn variant="ghost" style={{fontSize:11,padding:"5px 11px"}}><Download size={11}/>Экспорт CSV</Btn>
            </div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{borderBottom:`1px solid ${C.border}`}}>
                {["Автомат","Мойок","Выручка","Ваучеров","Ср. чек","Доля"].map(h=>(
                  <th key={h} style={{textAlign:"left",padding:"10px 14px",fontSize:10,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em"}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>{reportData.sort((a,b)=>b.rev-a.rev).map((r,i)=>(
                <tr key={r.id} style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                  <td style={{padding:"10px 14px"}}><div style={{fontSize:13,fontWeight:600,color:"#f0f4ff"}}>{r.id}</div><div style={{fontSize:11,color:C.muted}}>{r.place}</div></td>
                  <td style={{padding:"10px 14px",fontSize:13,fontWeight:700,color:C.cyan}}>{r.washes.toLocaleString("ru")}</td>
                  <td style={{padding:"10px 14px",fontSize:13,fontWeight:700,color:C.green,fontFamily:"monospace"}}>₽ {(r.rev/1000).toFixed(1)}к</td>
                  <td style={{padding:"10px 14px",fontSize:13,color:C.amber}}>{r.vouchers}</td>
                  <td style={{padding:"10px 14px",fontSize:12,color:C.muted,fontFamily:"monospace"}}>₽ {r.avg.toLocaleString("ru")}</td>
                  <td style={{padding:"10px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{flex:1,minWidth:60}}><PBar value={r.rev/totalRev*100} color={C.green}/></div>
                      <span style={{fontSize:11,color:C.muted,minWidth:35}}>{Math.round(r.rev/totalRev*100)}%</span>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
              <tfoot><tr style={{borderTop:`1px solid ${C.border}`,background:"rgba(255,255,255,0.02)"}}>
                <td style={{padding:"10px 14px",fontSize:12,fontWeight:700,color:"#f0f4ff"}}>Итого</td>
                <td style={{padding:"10px 14px",fontSize:13,fontWeight:700,color:C.cyan}}>{totalW.toLocaleString("ru")}</td>
                <td style={{padding:"10px 14px",fontSize:13,fontWeight:700,color:C.green,fontFamily:"monospace"}}>₽ {(totalRev/1000).toFixed(1)}к</td>
                <td style={{padding:"10px 14px",fontSize:13,color:C.amber}}>{reportData.reduce((s,r)=>s+r.vouchers,0)}</td>
                <td style={{padding:"10px 14px",fontSize:12,color:C.muted,fontFamily:"monospace"}}>₽ {avgCheck.toLocaleString("ru")}</td>
                <td style={{padding:"10px 14px"}}><Badge color={C.green}>100%</Badge></td>
              </tr></tfoot>
            </table>
          </div>

          {/* Voucher report */}
          <div style={{...CS}}>
            <div style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",marginBottom:14,letterSpacing:"0.06em"}}>Ваучеры и купоны · {period}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
              <Stat label="Выдано ваучеров" value={Math.round(92*mult)} color={C.amber}/>
              <Stat label="Использовано" value={Math.round(58*mult)} color={C.green}/>
              <Stat label="Сгорело" value={Math.round(12*mult)} color={C.red}/>
              <Stat label="Конверсия" value={`${Math.round(58/92*100)}%`} color={C.purple}/>
            </div>
          </div>
        </div>
      );
      return <div style={{color:C.muted,padding:40,textAlign:"center"}}>Раздел в разработке</div>;
    }}/>
  );
}

// ─── LOGS SECTION ─────────────────────────────────────────────────────────────
function LogsSection() {
  const [filter, setFilter] = useState("all");
  const [machine, setMachine] = useState("all");

  const levelColor={critical:C.red,warning:C.amber,info:C.cyan};
  const levelLabel={critical:"Критическая",warning:"Предупреждение",info:"Информация"};

  const filtered = LOGS_DB.filter(l=>{
    if(filter!=="all"&&l.level!==filter) return false;
    if(machine!=="all"&&l.machine!==machine) return false;
    return true;
  });

  const critCount=LOGS_DB.filter(l=>l.level==="critical"&&!l.resolved).length;
  const warnCount=LOGS_DB.filter(l=>l.level==="warning"&&!l.resolved).length;

  return (
    <Section title="Логи аппаратов" subtitle="Ошибки, устройства, COM-порты" render={({current,drill})=>{
      if(current==="root") return (
        <div>
          {critCount>0&&(
            <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:11,marginBottom:20,border:"1px solid rgba(239,68,68,.35)",background:"rgba(239,68,68,.08)"}}>
              <AlertOctagon size={16} color={C.red}/>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:"#fca5a5"}}>{critCount} критических ошибок требуют внимания</div>
                <div style={{fontSize:11,color:C.muted}}>{LOGS_DB.filter(l=>l.level==="critical"&&!l.resolved).map(l=>l.machine).join(", ")}</div>
              </div>
              <Btn variant="danger" style={{fontSize:11,padding:"5px 11px"}}><Truck size={11}/>Выезд</Btn>
            </div>
          )}

          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
            <DrillCard label="Критических" value={LOGS_DB.filter(l=>l.level==="critical"&&!l.resolved).length} accent={C.red} icon={AlertOctagon} onClick={()=>setFilter("critical")}/>
            <DrillCard label="Предупреждений" value={LOGS_DB.filter(l=>l.level==="warning"&&!l.resolved).length} accent={C.amber} icon={AlertTriangle} onClick={()=>setFilter("warning")}/>
            <DrillCard label="Решённых" value={LOGS_DB.filter(l=>l.resolved).length} accent={C.green} icon={CheckCircle} onClick={()=>setFilter("all")}/>
            <DrillCard label="Всего записей" value={LOGS_DB.length} accent={C.muted} icon={Database} onClick={()=>setFilter("all")}/>
          </div>

          {/* Filters */}
          <div style={{display:"flex",gap:10,marginBottom:14}}>
            <select value={filter} onChange={e=>setFilter(e.target.value)}
              style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:9,padding:"7px 13px",color:C.text,fontSize:12,outline:"none"}}>
              <option value="all">Все уровни</option>
              <option value="critical">Критические</option>
              <option value="warning">Предупреждения</option>
              <option value="info">Информация</option>
            </select>
            <select value={machine} onChange={e=>setMachine(e.target.value)}
              style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:9,padding:"7px 13px",color:C.text,fontSize:12,outline:"none"}}>
              <option value="all">Все автоматы</option>
              {MACHINES_DB.map(m=><option key={m.id} value={m.id}>{m.id} · {m.place}</option>)}
            </select>
            <Btn variant="ghost" style={{fontSize:11,padding:"6px 12px"}} onClick={()=>{setFilter("all");setMachine("all");}}>
              <RefreshCw size={11}/>Сбросить
            </Btn>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {filtered.map(l=>{
              const lc=levelColor[l.level]||C.muted;
              return (
                <div key={l.id} style={{...CS,padding:"14px 16px",borderColor:l.resolved?"none":`${lc}33`,
                  background:l.resolved?"rgba(255,255,255,0.01)":l.level==="critical"?"rgba(239,68,68,0.04)":"rgba(255,255,255,0.02)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <Badge color={lc}>{levelLabel[l.level]}</Badge>
                      <span style={{fontSize:13,fontWeight:600,color:l.resolved?"#64748b":"#f0f4ff"}}>{l.machine}</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:11,color:C.dim}}>{l.time}</span>
                      <Badge color={l.resolved?C.green:C.red}>{l.resolved?"Решена":"Открыта"}</Badge>
                    </div>
                  </div>
                  <div style={{fontSize:12,color:C.muted,marginBottom:6}}>
                    <span style={{fontFamily:"monospace",color:C.cyan}}>{l.device}</span>
                  </div>
                  <div style={{fontSize:12,color:l.resolved?C.dim:"#e2e8f0",fontFamily:"monospace"}}>
                    {l.error}
                  </div>
                  {!l.resolved&&(
                    <div style={{display:"flex",gap:7,marginTop:10}}>
                      {l.level==="critical"&&<Btn variant="danger" style={{fontSize:11,padding:"5px 11px"}}><Truck size={11}/>Выезд</Btn>}
                      <Btn variant="success" style={{fontSize:11,padding:"5px 11px"}}><CheckCircle size={11}/>Отметить решённой</Btn>
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length===0&&(
              <div style={{...CS,textAlign:"center",padding:40,color:C.muted}}>
                Записей не найдено
              </div>
            )}
          </div>
        </div>
      );
      return <div style={{color:C.muted,padding:40,textAlign:"center"}}>Раздел в разработке</div>;
    }}/>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id:"overview",    label:"Обзор · CEO",      icon:LayoutDashboard, roles:["ceo"]                               },
  { id:"machines",    label:"Автоматы",          icon:Cpu,             roles:["ceo","director","financier","tech"] },
  { id:"marketing",   label:"Маркетинг",         icon:Megaphone,       roles:["ceo","director","financier","rop"]  },
  { id:"adslots",     label:"Реклама на авт.",   icon:Tv,              roles:["ceo","director","financier"]        },
  { id:"franchise",   label:"Продажа франшизы", icon:Award,           roles:["ceo","director","financier","rop"]  },
  { id:"my_franchise",label:"Мой кабинет",       icon:Star,            roles:["franchisee"]                        },
  { id:"legal",       label:"Юридический",       icon:Scale,           roles:["ceo","director","financier"]        },
  { id:"devlab",      label:"Разработка",        icon:Code2,           roles:["ceo","director"]                    },
  { id:"technical",   label:"Технический",       icon:Wrench,          roles:["ceo","tech"]                       },
  { id:"clients",     label:"Клиентская база",   icon:Users,           roles:["ceo","director","financier","rop"]  },
  { id:"notifications",label:"Уведомления",      icon:Bell,            roles:["ceo","director","rop"]              },
  { id:"content",     label:"Контент аппаратов", icon:Monitor,         roles:["ceo","director","tech"]             },
  { id:"pricing",     label:"Ценообразование",   icon:Percent,         roles:["ceo","director","financier"]        },
  { id:"reports",     label:"Отчёты",            icon:BarChart2,       roles:["ceo","director","financier"]        },
  { id:"logs",        label:"Логи аппаратов",    icon:AlertOctagon,    roles:["ceo","director","tech"]             },
];

// ─── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginPage() {
  const {login}=useAuth();
  const [email,setEmail]=useState("");const [pw,setPw]=useState("");const [showPw,setShowPw]=useState(false);const [loading,setLoading]=useState(false);const [error,setError]=useState("");const [ready,setReady]=useState(false);
  useEffect(()=>{setTimeout(()=>setReady(true),60);},[]);
  const fill=u=>{setEmail(u.email);setPw(u.password);setError("");};
  const submit=async e=>{e.preventDefault();setLoading(true);setError("");try{await login(email,pw);}catch(err){setError(err.message);}finally{setLoading(false);}};
  const inp={width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"11px 13px",color:"#e2e8f0",fontSize:13,outline:"none"};
  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
      <div style={{position:"absolute",inset:0,opacity:.04,backgroundImage:"linear-gradient(rgba(0,212,255,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.8) 1px,transparent 1px)",backgroundSize:"60px 60px"}}/>
      <div style={{position:"relative",zIndex:10,width:"100%",maxWidth:440,padding:"0 20px",transform:ready?"translateY(0)":"translateY(20px)",opacity:ready?1:0,transition:"all .5s ease"}}>
        <div style={{textAlign:"center",marginBottom:26}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:48,height:48,borderRadius:14,marginBottom:12,background:"linear-gradient(135deg,rgba(0,212,255,.15),rgba(129,140,248,.1))",border:"1px solid rgba(0,212,255,.25)"}}><Target size={21} color={C.cyan}/></div>
          <div style={{fontSize:22,fontWeight:800,color:"#f0f4ff",letterSpacing:"-0.03em"}}>Business Dashboard</div>
          <div style={{fontSize:11,color:"#475569",marginTop:3}}>Единая система управления · v4.0</div>
        </div>
        <div style={{background:"rgba(14,21,40,.9)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,.08)",borderRadius:20,padding:"24px",boxShadow:"0 24px 60px rgba(0,0,0,.5)"}}>
          <form onSubmit={submit}>
            <div style={{marginBottom:12}}><label style={{fontSize:11,fontWeight:600,color:C.muted,display:"block",marginBottom:6,letterSpacing:"0.05em",textTransform:"uppercase"}}>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@co.ru" style={inp} onFocus={e=>e.target.style.borderColor="rgba(0,212,255,.5)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.1)"}/></div>
            <div style={{marginBottom:16}}><label style={{fontSize:11,fontWeight:600,color:C.muted,display:"block",marginBottom:6,letterSpacing:"0.05em",textTransform:"uppercase"}}>Пароль</label><div style={{position:"relative"}}><input type={showPw?"text":"password"} value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••••" style={{...inp,paddingRight:42}} onFocus={e=>e.target.style.borderColor="rgba(0,212,255,.5)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.1)"}/><button type="button" onClick={()=>setShowPw(p=>!p)} style={{position:"absolute",right:11,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.muted}}>{showPw?<EyeOff size={15}/>:<Eye size={15}/>}</button></div></div>
            {error&&<div style={{display:"flex",alignItems:"center",gap:7,padding:"9px 12px",borderRadius:9,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.25)",marginBottom:14,fontSize:12,color:"#fca5a5"}}><AlertCircle size={13} color={C.red}/>{error}</div>}
            <button type="submit" disabled={loading} style={{width:"100%",padding:"12px",borderRadius:10,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#00d4ff,#0090cc)",color:"#001824",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:7,boxShadow:"0 4px 20px rgba(0,212,255,.25)",opacity:loading?.7:1}}>
              {loading&&<Loader size={14} style={{animation:"spin 1s linear infinite"}}/>}{loading?"Входим...":"Войти"}
            </button>
          </form>
        </div>
        <div style={{marginTop:14}}>
          <div style={{fontSize:10,color:C.dim,textAlign:"center",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.08em"}}>Демо-аккаунты</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
            {USERS.map(u=><button key={u.id} onClick={()=>fill(u)} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:9,padding:"8px 10px",cursor:"pointer",textAlign:"left",transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=`${u.color}44`;e.currentTarget.style.background=`${u.color}09`;}} onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.07)";e.currentTarget.style.background="rgba(255,255,255,0.03)";}}>
              <div style={{fontSize:10,fontWeight:700,color:u.color,marginBottom:1}}>{ROLE_INFO[u.role]?.label}</div>
              <div style={{fontSize:9,color:C.muted}}>{u.email}</div>
            </button>)}
          </div>
        </div>
      </div>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}body{background:${C.bg};}@keyframes spin{to{transform:rotate(360deg)}}input::placeholder{color:#2d3f5a}button{font-family:inherit}`}</style>
    </div>
  );
}



// ─── APP SHELL ────────────────────────────────────────────────────────────────
function AppShell() {
  const {user,logout}=useAuth();
  const ri=user?ROLE_INFO[user.role]:null;
  const navItems=NAV_ITEMS.filter(n=>n.roles.includes(user?.role));
  const [active,setActive]=useState(navItems[0]?.id||"overview");
  const [sectionKey,setSectionKey]=useState(0);
  const [time,setTime]=useState(new Date());
  useEffect(()=>{const t=setInterval(()=>setTime(new Date()),60000);return()=>clearInterval(t);},[]);

  const navigate=id=>{if(navItems.some(n=>n.id===id)){setActive(id);setSectionKey(k=>k+1);}};

  const SECTION_MAP = {
    overview:      <OverviewSection/>,
    machines:      <MachinesSection user={user}/>,
    marketing:     <MarketingSection user={user}/>,
    adslots:       <AdSlotsSection/>,
    franchise:     <FranchiseSection/>,
    my_franchise:  <MyFranchiseSection/>,
    legal:         <LegalSection/>,
    devlab:        <DevLabSection/>,
    technical:     <TechnicalSection/>,
    clients:       <ClientsSection/>,
    notifications: <NotificationsSection/>,
    content:       <ContentSection/>,
    pricing:       <PricingSection/>,
    reports:       <ReportsSection/>,
    logs:          <LogsSection/>,
  };

  return (
    <div style={{display:"flex",height:"100vh",background:C.bg,fontFamily:"sans-serif",fontSize:13}}>
      <aside style={{width:216,flexShrink:0,background:C.surface,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",padding:"16px 10px"}}>
        <div style={{padding:"0 7px 14px",borderBottom:`1px solid ${C.border}`,marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:10}}>
            <div style={{width:32,height:32,borderRadius:9,flexShrink:0,background:"linear-gradient(135deg,rgba(0,212,255,.2),rgba(129,140,248,.1))",border:"1px solid rgba(0,212,255,.25)",display:"flex",alignItems:"center",justifyContent:"center"}}><Target size={15} color={C.cyan}/></div>
            <div><div style={{fontSize:14,fontWeight:800,color:"#f0f4ff",letterSpacing:"-0.03em"}}>Dashboard</div><div style={{fontSize:9,color:C.dim,textTransform:"uppercase",letterSpacing:"0.07em"}}>v4.0</div></div>
          </div>
          {user&&ri&&<div style={{display:"flex",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:9,background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`}}>
            <Av initials={user.avatar} color={user.color} size={28}/>
            <div style={{minWidth:0}}><div style={{fontSize:11,fontWeight:600,color:"#e2e8f0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div><span style={{fontSize:9,fontWeight:600,color:ri.color,padding:"1px 5px",borderRadius:99,background:ri.bg}}>{ri.label}</span></div>
          </div>}
        </div>
        <nav style={{flex:1,display:"flex",flexDirection:"column",gap:2}}>
          {navItems.map(({id,label,icon:Icon})=>{const isA=active===id;return <button key={id} onClick={()=>navigate(id)} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 11px",borderRadius:9,cursor:"pointer",width:"100%",textAlign:"left",background:isA?"rgba(0,212,255,0.10)":"transparent",border:`1px solid ${isA?"rgba(0,212,255,0.22)":"transparent"}`,color:isA?C.cyan:"#475569",fontSize:12,fontWeight:isA?600:400,transition:"all .15s"}}><Icon size={14}/><span style={{flex:1}}>{label}</span></button>;})}
        </nav>
        <div style={{borderTop:`1px solid ${C.border}`,paddingTop:10}}>
          <div style={{padding:"4px 11px",fontSize:10,color:C.dim,display:"flex",alignItems:"center",gap:5,marginBottom:6}}><div style={{width:5,height:5,borderRadius:"50%",background:C.green,boxShadow:`0 0 5px ${C.green}`}}/>{time.toLocaleTimeString("ru",{hour:"2-digit",minute:"2-digit"})}</div>
          <button onClick={logout} style={{display:"flex",alignItems:"center",gap:7,padding:"7px 11px",width:"100%",borderRadius:8,cursor:"pointer",background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.15)",color:"#f87171",fontSize:11,fontWeight:600}} onMouseEnter={e=>e.currentTarget.style.background="rgba(239,68,68,0.12)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(239,68,68,0.06)"}><LogOut size={12}/>Выйти</button>
        </div>
      </aside>
      <main style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        <header style={{height:50,flexShrink:0,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 22px",background:"rgba(9,14,28,.85)"}}>
          <div style={{display:"flex",alignItems:"center",gap:7,background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"6px 13px",border:`1px solid ${C.border}`}}><Search size={12} color={C.muted}/><span style={{fontSize:12,color:C.dim}}>Поиск по системе...</span></div>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <button style={{background:"none",border:"none",cursor:"pointer",padding:4}}><Bell size={15} color={C.muted}/></button>
            {user&&ri&&<div style={{display:"flex",alignItems:"center",gap:7,padding:"3px 10px 3px 5px",borderRadius:99,background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`}}>
              <Av initials={user.avatar} color={user.color} size={24}/>
              <div><div style={{fontSize:11,fontWeight:600,color:"#e2e8f0",lineHeight:1}}>{user.name}</div><div style={{fontSize:9,color:ri.color,marginTop:1}}>{ri.label}</div></div>
            </div>}
          </div>
        </header>
        <div style={{flex:1,overflowY:"auto",padding:"20px 22px"}}>
          <div key={`${active}-${sectionKey}`}>{SECTION_MAP[active]||SECTION_MAP[navItems[0]?.id]}</div>
        </div>
      </main>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}body{background:${C.bg};font-family:sans-serif;}::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:99px;}@keyframes spin{to{transform:rotate(360deg)}}button{font-family:inherit}input::placeholder,textarea::placeholder,select{color:#2d3f5a}select option{background:#141d2e}`}</style>
    </div>
  );
}

function Root(){const{isAuth}=useAuth();return isAuth?<AppShell/>:<LoginPage/>;}
export default function App(){return <CrmProvider><AuthProvider><Root/></AuthProvider></CrmProvider>;}
