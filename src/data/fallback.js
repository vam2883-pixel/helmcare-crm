// ─── DATA ─────────────────────────────────────────────────────────────────────
// Стартовые (fallback) данные. При загрузке приложения CrmProvider заменяет их
// реальными данными из Supabase через hydrate() — ESM live bindings позволяют
// всем модулям видеть обновлённые значения.
import { C } from "../lib/theme.js";

export let MACHINES_DB = [
  { id:"AW-001", place:"ТЦ Европа",    addr:"ул. Ленина, 12",     status:"online",  wd:87,  wm:2140, rd:8700,  rm:214000, up:99.2, dt:0,  rent:18000, ls:"12.04", ns:"12.05", tech:"Козлов В.",   mapsUrl:"https://maps.google.com" },
  { id:"AW-002", place:"Пятёрочка",    addr:"пр. Мира, 45",       status:"online",  wd:64,  wm:1680, rd:6400,  rm:168000, up:97.8, dt:0,  rent:12000, ls:"08.04", ns:"08.05", tech:"Козлов В.",   mapsUrl:"https://maps.google.com" },
  { id:"AW-003", place:"Ост. Садовая", addr:"ул. Садовая, 7",     status:"offline", wd:0,   wm:890,  rd:0,     rm:89000,  up:72.1, dt:14, rent:9000,  ls:"01.04", ns:"01.05", tech:"Иванов А.",   mapsUrl:"https://maps.google.com" },
  { id:"AW-004", place:"БЦ Победа",    addr:"бул. Победы, 22",    status:"repair",  wd:0,   wm:1120, rd:0,     rm:112000, up:68.4, dt:48, rent:22000, ls:"25.03", ns:"25.04", tech:"Иванов А.",   mapsUrl:"https://maps.google.com" },
  { id:"AW-005", place:"ТЦ Горький",   addr:"ул. Горького, 89",   status:"online",  wd:112, wm:2890, rd:11200, rm:289000, up:99.8, dt:0,  rent:18000, ls:"15.04", ns:"15.05", tech:"Козлов В.",   mapsUrl:"https://maps.google.com" },
  { id:"AW-006", place:"АЗС Космос",   addr:"пр. Космонавтов, 3", status:"online",  wd:45,  wm:1290, rd:4500,  rm:129000, up:96.5, dt:0,  rent:8000,  ls:"10.04", ns:"10.05", tech:"Петренко С.", mapsUrl:"https://maps.google.com" },
];

export let TECHNICIANS = [
  { id:1, name:"Козлов В.",    phone:"+7 985 111-22-33", telegram:"@kozlov_tech",   active:true  },
  { id:2, name:"Иванов А.",    phone:"+7 916 444-55-66", telegram:"@ivanov_tech",   active:true  },
  { id:3, name:"Петренко С.",  phone:"+7 903 777-88-99", telegram:"@petrenko_tech", active:false },
];

export const MARKETING_TEAM = {
  head:     { id:10, name:"Волкова М. С.", email:"volkova@co.ru", phone:"+7 916 111-22-33", title:"Руководитель маркетинга", avatar:"ВМ", color:C.purple },
  managers: [
    { id:11, name:"Смирнова К. И.", email:"smirnova@co.ru", phone:"+7 925 444-55-66", title:"Менеджер по рекламе",   avatar:"СК", color:C.cyan },
    { id:12, name:"Новиков С. А.",  email:"novikov@co.ru",  phone:"+7 903 777-88-99", title:"Менеджер по кампаниям", avatar:"НС", color:C.blue },
  ],
  staff: [
    { id:13, name:"Захарова Е.", title:"Контент-менеджер", avatar:"ЗЕ", color:C.pink  },
    { id:14, name:"Громов П.",   title:"SMM-специалист",   avatar:"ГП", color:C.amber },
    { id:15, name:"Лисина А.",   title:"Дизайнер",         avatar:"ЛА", color:C.green },
  ],
};
export const ALL_MKT_MEMBERS = [MARKETING_TEAM.head, ...MARKETING_TEAM.managers, ...MARKETING_TEAM.staff];

export let initCampaigns = [
  { id:1, name:"Meta — ретаргет апрель", goal:"Лиды на франшизу", channel:"Meta",   status:"active",    start:"01.04", end:"30.04", budget:80000, spent:54000, exp_leads:100, leads:142, responsible:"Смирнова К. И.", result:"Перевыполнено +42%", approved:true  },
  { id:2, name:"Яндекс Директ апрель",   goal:"Лиды автомойка",   channel:"Яндекс", status:"completed", start:"01.04", end:"30.04", budget:60000, spent:60000, exp_leads:80,  leads:98,  responsible:"Новиков С. А.",  result:"Выполнено +22.5%", approved:true  },
  { id:3, name:"Акция Майские",          goal:"Рост моек +20%",   channel:"Мульти", status:"planned",   start:"01.05", end:"10.05", budget:40000, spent:0,    exp_leads:60,  leads:0,   responsible:"Волкова М. С.", result:"—",               approved:false },
];

export let initContractors = [
  { id:1, company:"ООО Авторынок",   brand:"АвтоДетали+", type:"Баннер",  machine:"AW-001", price:8000,  payForm:"Предоплата",   paid:"paid",    dueDate:null,    moderated:true,  start:"01.04", end:"30.06", contact:"Иванов П.",  phone:"+7 916 111-22-33", responsible:"Смирнова К. И." },
  { id:2, company:"ИП Кофе Бар",     brand:"CoffeePoint", type:"Экран",   machine:"AW-001", price:5000,  payForm:"Постоплата",   paid:"paid",    dueDate:"05.04", moderated:true,  start:"01.03", end:"31.05", contact:"Орлова К.",  phone:"+7 925 333-44-55", responsible:"Новиков С. А."  },
  { id:3, company:"Пицца-Хаус",      brand:"PizzaHouse",  type:"Экран",   machine:"AW-002", price:6000,  payForm:"Отсрочка 14д", paid:"overdue", dueDate:"05.04", moderated:true,  start:"01.04", end:"30.04", contact:"Грибов М.",  phone:"+7 903 555-66-77", responsible:"Смирнова К. И." },
  { id:4, company:"Банк Открытие",   brand:"Открытие",    type:"Баннер",  machine:"AW-005", price:12000, payForm:"Предоплата",   paid:"paid",    dueDate:null,    moderated:true,  start:"01.02", end:"31.07", contact:"Белов А.",   phone:"+7 985 777-88-99", responsible:"Новиков С. А."  },
  { id:5, company:"Аптека Здоровье", brand:"ЗдоровьеПлюс",type:"Листовка",machine:"AW-006", price:4000,  payForm:"Предоплата",   paid:"paid",    dueDate:null,    moderated:false, start:"15.04", end:"15.07", contact:"Миронова Е.",phone:"+7 916 999-00-11", responsible:"Смирнова К. И." },
];

export let FR_LEADS = [
  { id:1, name:"Абдулов Р.",    city:"Казань",      stage:"negotiation", mach:3, src:"Выставка",   date:"17.04", mgr:"Новиков С. А.",  note:"Обсуждаем детали договора", phone:"+7 917 111-22-33" },
  { id:2, name:"ВелтГрупп",    city:"Новосибирск", stage:"proposal",    mach:5, src:"Таргет",     date:"15.04", mgr:"Новиков С. А.",  note:"КП отправлено",             phone:"+7 383 444-55-66" },
  { id:3, name:"Иванченко С.", city:"Екатеринбург",stage:"contract",    mach:2, src:"Нетворкинг", date:"10.04", mgr:"Смирнова К. И.", note:"Договор на согласовании",   phone:"+7 343 777-88-99" },
];

export let LEGAL_DB = [
  { id:1, type:"Аренда",   party:"ТЦ Европа",  status:"active",   signed:"12.01.2024", expires:"12.01.2027", risk:"low",    pay:"В срок"   },
  { id:2, type:"Франшиза", party:"Иванов С.",  status:"active",   signed:"01.03.2024", expires:"01.03.2027", risk:"low",    pay:"В срок"   },
  { id:3, type:"Аренда",   party:"БЦ Победа",  status:"expiring", signed:"05.09.2023", expires:"05.09.2026", risk:"medium", pay:"Задержка" },
  { id:4, type:"Реклама",  party:"Пицца-Хаус", status:"expiring", signed:"01.04.2026", expires:"30.04.2026", risk:"low",    pay:"Не опл."  },
  { id:5, type:"Аренда",   party:"АЗС Космос", status:"dispute",  signed:"14.07.2023", expires:"14.07.2026", risk:"high",   pay:"Спор"     },
];

export let DEV_DB = [
  { id:1, name:"Автомат v2.0",           status:"on_track",  pct:65,  dl:"01.09.2026", budget:850000, spent:420000, tasks:["Механика","Электроника","ПО управления"] },
  { id:2, name:"Мобильное приложение",   status:"delayed",   pct:28,  dl:"01.07.2026", budget:400000, spent:180000, tasks:["iOS","Android","Backend API"]           },
  { id:3, name:"Собственная CRM",        status:"on_track",  pct:40,  dl:"01.10.2026", budget:150000, spent:130000, tasks:["Supabase БД","CRUD","Авторизация"]      },
  { id:4, name:"API телеметрии v3",      status:"completed", pct:100, dl:"15.04.2026", budget:120000, spent:115000, tasks:["Протокол","Тесты","Деплой"]              },
  { id:5, name:"Система лояльности",     status:"planning",  pct:5,   dl:"01.11.2026", budget:600000, spent:12000,  tasks:["Концепция","Дизайн","MVP"]              },
];

export let CLIENTS_DB = [
  { id:1, name:"Ахмад Ю.",     phone:"+62 812-111-2233", email:"ahmad@mail.com",   city:"Джакарта", district:"Сентул",     source:"Instagram",   gender:"М", age:28, helmet:"L",   moped:"Honda Beat",      vouchers:2, washes:14, joined:"10.03.2026", active:true,  refs:3 },
  { id:2, name:"Карим Р.",     phone:"+62 813-222-3344", email:"karim@mail.com",   city:"Бандунг",  district:"Даго",       source:"Реклама",     gender:"М", age:34, helmet:"XL",  moped:"Yamaha NMAX",     vouchers:1, washes:7,  joined:"15.03.2026", active:true,  refs:1 },
  { id:3, name:"Дита С.",      phone:"+62 821-333-4455", email:"dita@mail.com",    city:"Джакарта", district:"Pondok Ind", source:"Друг",        gender:"Ж", age:25, helmet:"M",   moped:"Honda Scoopy",    vouchers:3, washes:21, joined:"01.02.2026", active:true,  refs:7 },
  { id:4, name:"Fajar H.",     phone:"+62 857-444-5566", email:"fajar@mail.com",   city:"Сурабая",  district:"Тенгах",     source:"Google",      gender:"М", age:31, helmet:"L",   moped:"Suzuki Address",  vouchers:0, washes:3,  joined:"01.04.2026", active:true,  refs:0 },
  { id:5, name:"Rini P.",      phone:"+62 877-555-6677", email:"rini@mail.com",    city:"Бали",     district:"Семиньяк",   source:"Instagram",   gender:"Ж", age:22, helmet:"S",   moped:"Honda Vario",     vouchers:1, washes:9,  joined:"20.03.2026", active:false, refs:2 },
  { id:6, name:"Budi W.",      phone:"+62 815-666-7788", email:"budi@mail.com",    city:"Джакарта", district:"Депок",      source:"Реклама",     gender:"М", age:41, helmet:"XXL", moped:"Yamaha Aerox",    vouchers:0, washes:2,  joined:"15.04.2026", active:true,  refs:0 },
  { id:7, name:"Sari A.",      phone:"+62 818-777-8899", email:"sari@mail.com",    city:"Бандунг",  district:"Цимахи",     source:"Друг",        gender:"Ж", age:29, helmet:"M",   moped:"Honda PCX",       vouchers:4, washes:28, joined:"15.01.2026", active:true,  refs:12 },
  { id:8, name:"Hendra G.",    phone:"+62 851-888-9900", email:"hendra@mail.com",  city:"Сурабая",  district:"Тенггилис",  source:"TikTok",      gender:"М", age:26, helmet:"L",   moped:"Yamaha Mio",      vouchers:1, washes:6,  joined:"05.04.2026", active:true,  refs:1 },
];

export let NOTIF_HISTORY = [
  { id:1, title:"Акция — бесплатная мойка!",       body:"Только сегодня: 1 бесплатная мойка всем активным клиентам.",  target:"all",      sent:847, opened:412, date:"15.04.2026", status:"sent"      },
  { id:2, title:"Рядом с вами новый аппарат",      body:"AW-007 запущен в вашем районе. Приходите!",                    target:"geo",      sent:134, opened:89,  date:"12.04.2026", status:"sent"      },
  { id:3, title:"5 моек — получи ваучер",           body:"Вы уже сделали 5 моек! Ваучер на бесплатную мойку начислен.", target:"segment",  sent:203, opened:178, date:"10.04.2026", status:"sent"      },
  { id:4, title:"Майские праздники — скидка 20%",  body:"С 1 по 10 мая мойка шлема со скидкой 20%. Не пропустите!",   target:"all",      sent:0,   opened:0,   date:"01.05.2026", status:"scheduled" },
];

export let CONTENT_DB = [
  { id:1, name:"Главный фон — мотоцикл",   type:"image", size:"2.4 МБ", assigned:["AW-001","AW-002","AW-005"], status:"active",   uploaded:"10.04.2026" },
  { id:2, name:"Промо-видео апрель",        type:"video", size:"18 МБ",  assigned:["AW-001"],                   status:"active",   uploaded:"01.04.2026" },
  { id:3, name:"Фон — бренд Helm Care",    type:"image", size:"1.8 МБ", assigned:["AW-006"],                   status:"active",   uploaded:"15.03.2026" },
  { id:4, name:"Видео инструкция мойки",   type:"video", size:"45 МБ",  assigned:["AW-001","AW-002","AW-003","AW-004","AW-005","AW-006"], status:"active", uploaded:"01.02.2026" },
  { id:5, name:"Акция майские праздники",  type:"image", size:"1.2 МБ", assigned:[],                           status:"pending",  uploaded:"20.04.2026" },
];

export let PRICING_DB = {
  modes: [
    { id:"basic",   name:"Стандартная мойка",  basePrice:15000,  duration:8  },
    { id:"deep",    name:"Глубокая очистка",   basePrice:25000,  duration:15 },
    { id:"uv",      name:"УФ-дезинфекция",     basePrice:20000,  duration:10 },
    { id:"express", name:"Экспресс 5 мин",     basePrice:10000,  duration:5  },
  ],
  timeRules: [
    { id:1, name:"Ночной тариф",  days:["МО","ВТ","СР","ЧТ","ПТ","СБ","ВС"], from:"23:00", to:"06:00", discount:-20, color:C.blue   },
    { id:2, name:"Час пик",       days:["МО","ВТ","СР","ЧТ","ПТ"],           from:"07:00", to:"09:00", discount:10,  color:C.red    },
    { id:3, name:"Обеденный",     days:["МО","ВТ","СР","ЧТ","ПТ"],           from:"12:00", to:"14:00", discount:-10, color:C.green  },
    { id:4, name:"Выходной",      days:["СБ","ВС"],                           from:"09:00", to:"21:00", discount:-15, color:C.purple },
  ],
};

export let LOGS_DB = [
  { id:1, machine:"AW-003", device:"COM2 · Вентилятор внешний", error:"Device timeout after 5s",            level:"critical", time:"19.04 · 14:32", resolved:false },
  { id:2, machine:"AW-004", device:"COM1 · УФ-лампа",           error:"No response on init",                level:"critical", time:"18.04 · 09:15", resolved:false },
  { id:3, machine:"AW-003", device:"COM3 · Помпа",               error:"Pressure drop detected",            level:"warning",  time:"18.04 · 11:40", resolved:false },
  { id:4, machine:"AW-001", device:"COM4 · Дозатор",             error:"Low fluid level warning",           level:"warning",  time:"17.04 · 16:20", resolved:true  },
  { id:5, machine:"AW-002", device:"COM1 · УФ-лампа",           error:"Lamp life 80% used",                level:"info",     time:"16.04 · 08:00", resolved:true  },
  { id:6, machine:"AW-005", device:"Payment · QR reader",        error:"Scan timeout 3s exceeded",          level:"warning",  time:"16.04 · 13:55", resolved:true  },
  { id:7, machine:"AW-006", device:"App · Auto-update",          error:"Update v2.3.1 installed OK",        level:"info",     time:"15.04 · 02:00", resolved:true  },
  { id:8, machine:"AW-001", device:"COM2 · Вентилятор",         error:"Speed variance ±12% normal range",  level:"info",     time:"14.04 · 17:30", resolved:true  },
];

export const REPORTS_PERIODS = ["Сегодня","Вчера","7 дней","30 дней","Квартал","Год","Период"];

export let WASHES_TREND = [
  {d:"13.04",w:1620,r:162000},{d:"14.04",w:1740,r:174000},{d:"15.04",w:1580,r:158000},
  {d:"16.04",w:1810,r:181000},{d:"17.04",w:1890,r:189000},{d:"18.04",w:1750,r:175000},
  {d:"19.04",w:1842,r:184200},
];

export const REV_CHART = [
  {m:"Янв",a:724000,ad:48000,f:340000},{m:"Фев",a:698000,ad:52000,f:340000},
  {m:"Мар",a:891000,ad:61000,f:680000},{m:"Апр",a:747000,ad:70000,f:340000},
];

// ─── HYDRATE ─────────────────────────────────────────────────────────────────
// Вызывается CrmProvider'ом: подменяет fallback-данные реальными из Supabase.
export function hydrate(d) {
  if (d.machines?.length)     MACHINES_DB   = d.machines;
  if (d.technicians?.length)  TECHNICIANS   = d.technicians;
  if (d.campaigns?.length)    initCampaigns = d.campaigns;
  if (d.contractors?.length)  initContractors = d.contractors;
  if (d.frLeads?.length)      FR_LEADS      = d.frLeads;
  if (d.legal?.length)        LEGAL_DB      = d.legal;
  if (d.devProjects?.length)  DEV_DB        = d.devProjects;
  if (d.clients?.length)      CLIENTS_DB    = d.clients;
  if (d.notifications?.length) NOTIF_HISTORY = d.notifications;
  if (d.content?.length)      CONTENT_DB    = d.content;
  if (d.logs?.length)         LOGS_DB       = d.logs;
  if (d.washTrend?.length)    WASHES_TREND  = d.washTrend;
  if (d.pricing?.modes)       PRICING_DB    = d.pricing;
}
