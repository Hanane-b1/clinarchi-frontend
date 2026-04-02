import { useState, useMemo, useCallback, useEffect } from "react";
import "./program-responsive.css";
import { api } from "../api";
// ─────────────────────────────────────────────────────────────────────────────
// LOGO
// ─────────────────────────────────────────────────────────────────────────────
function LogoSVG({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 90"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5fa8a0"/>
          <stop offset="100%" stopColor="#8fbf8f"/>
        </linearGradient>
      </defs>
      <path d="M20 60 L20 40 L40 25 L60 40 L60 60" fill="none" stroke="url(#grad)" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M35 60 L35 45 L48 35 L48 60" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M55 55 C50 45, 65 40, 70 50 C75 40, 90 45, 85 55 C80 65, 70 70, 70 75 C70 70, 60 65, 55 55 Z" fill="none" stroke="url(#grad)" strokeWidth="3"/>
      <path d="M50 58 L60 58 L65 50 L70 62 L75 55 L85 55" fill="none" stroke="url(#grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const VILLES_MAROC = ["Casablanca","Rabat","Marrakech","Fes","Tanger","Agadir","Meknes","Oujda","Kenitra","Tetouan","Safi","El Jadida","Beni Mellal","Nador","Mohammedia","Settat","Khemisset","Berrechid","Khouribga","Taza","Laayoune","Dakhla","Tiznit","Guelmim","Ouarzazate","Errachidia","Larache","Al Hoceima","Taroudant","Chefchaouen","Essaouira","Ifrane","Azrou","Sidi Kacem"];

const TYPE_META = {
  "HOSPITALISATION":             { color:"#1D4ED8", light:"#EFF6FF", icon:"🛏" },
  "PLATEAU TECHNIQUE":           { color:"#5B21B6", light:"#F5F3FF", icon:"⚕" },
  "AMBULATOIRE":                 { color:"#065F46", light:"#ECFDF5", icon:"🚶" },
  "ONCOLOGIE":                   { color:"#991B1B", light:"#FFF1F2", icon:"☢" },
  "ADMINISTRATION":              { color:"#78350F", light:"#FFFBEB", icon:"🏢" },
  "LOGISTIQUE":                  { color:"#1E293B", light:"#F8FAFC", icon:"📦" },
  "PHARMACIE":                   { color:"#9D174D", light:"#FFF0F3", icon:"💊" },
  "HOSPITALISATION GREFFE":      { color:"#115E59", light:"#F0FDFA", icon:"💉" },
  "HOSPITALISATION HÉMATOLOGIE": { color:"#0C4A6E", light:"#F0F9FF", icon:"🩸" },
};

const PLAN_META = {
  "HOSPITALISATION":             { floor:"#C2E8ED", wf:"#A0CCCC", label:"HOSPITALISATION",   furniture:"beds"   },
  "PLATEAU TECHNIQUE":           { floor:"#CFC8F0", wf:"#A090D0", label:"PLATEAU TECH.",      furniture:"equip"  },
  "AMBULATOIRE":                 { floor:"#C2EDD0", wf:"#80BCA0", label:"AMBULATOIRE",        furniture:"chairs" },
  "ONCOLOGIE":                   { floor:"#F0C8C2", wf:"#CC8880", label:"ONCOLOGIE",          furniture:"chairs" },
  "ADMINISTRATION":              { floor:"#EDEAD0", wf:"#CCBA5A", label:"ADMINISTRATION",     furniture:"desks"  },
  "LOGISTIQUE":                  { floor:"#D8D8D8", wf:"#AAAAAA", label:"LOGISTIQUE",         furniture:"shelves"},
  "PHARMACIE":                   { floor:"#F0C8DC", wf:"#CC88A8", label:"PHARMACIE",          furniture:"shelves"},
  "HOSPITALISATION GREFFE":      { floor:"#B8EDE4", wf:"#60C0B0", label:"GREFFE",             furniture:"beds"   },
  "HOSPITALISATION HEMATOLOGIE": { floor:"#C2D8EE", wf:"#7AAAD8", label:"HEMATOLOGIE",       furniture:"beds"   },
};

const UNITS_BY_TYPE = {
  "HOSPITALISATION": [
    { id:"ward", name:"Unite d'Hospitalisation", fields:[
        {key:"single_rooms",    label:"Chambres simples",                type:"number", bedsPerUnit:1, roomsPerUnit:1, m2:18},
        {key:"isolation_rooms", label:"Chambres d'isolement (avec sas)", type:"number", bedsPerUnit:1, roomsPerUnit:1, m2:22},
        {key:"double_rooms",    label:"Chambres doubles",                type:"number", bedsPerUnit:2, roomsPerUnit:1, m2:28},
        {key:"triple_rooms",    label:"Chambres triples",                type:"number", bedsPerUnit:3, roomsPerUnit:1, m2:36},
        {key:"en_suite",        label:"WC + douche privatif",            type:"checkbox"},
        {key:"instances",       label:"Nombre d'unites identiques",      type:"number", min:1, default:1},
    ]},
    { id:"day_medicine", name:"Hopital de jour - Medecine", fields:[
        {key:"day_beds",         label:"Lits de jour",            type:"number", bedsPerUnit:1, roomsPerUnit:1, m2:14},
        {key:"treatment_chairs", label:"Fauteuils de traitement", type:"number", roomsPerUnit:1, m2:6},
    ]},
    { id:"day_surgical", name:"Hopital de jour - Chirurgie", fields:[
        {key:"day_beds",      label:"Lits de jour",             type:"number", bedsPerUnit:1, roomsPerUnit:1, m2:14},
        {key:"recovery_bays", label:"Places de reveil (SSPI)", type:"number", roomsPerUnit:1, m2:12},
        {key:"prep_bays",     label:"Places de preparation",   type:"number", roomsPerUnit:1, m2:10},
    ]},
  ],
  "PLATEAU TECHNIQUE": [
    { id:"icu_adult", name:"Reanimation adultes (USI)", fields:[
        {key:"icu_beds",       label:"Lits de reanimation", type:"number", bedsPerUnit:1, roomsPerUnit:1, m2:25},
        {key:"isolation_beds", label:"Lits d'isolement",    type:"number", bedsPerUnit:1, roomsPerUnit:1, m2:28},
        {key:"open_bays",      label:"Lits espace ouvert",  type:"number", bedsPerUnit:1, m2:20},
    ]},
    { id:"icu_peds", name:"Reanimation pediatrique", fields:[
        {key:"picu_beds", label:"Lits pediatriques", type:"number", bedsPerUnit:1, roomsPerUnit:1, m2:22},
    ]},
    { id:"nicu", name:"Neonatologie (USIN)", fields:[
        {key:"incubators", label:"Places incubateurs", type:"number", bedsPerUnit:1, roomsPerUnit:1, m2:6},
        {key:"open_crib",  label:"Berceaux ouverts",   type:"number", bedsPerUnit:1, m2:4},
    ]},
    { id:"or", name:"Blocs Operatoires", fields:[
        {key:"standard",     label:"Salles standard",        type:"number", roomsPerUnit:1, m2:55},
        {key:"hyperaseptic", label:"Salles hyperaseptiques", type:"number", roomsPerUnit:1, m2:65},
        {key:"obstetric",    label:"Salles obstetricales",   type:"number", roomsPerUnit:1, m2:55},
        {key:"pacu",         label:"Places SSPI",            type:"number", roomsPerUnit:1, m2:12},
    ]},
    { id:"delivery", name:"Salle d'Accouchement", fields:[
        {key:"delivery_rooms",  label:"Salles d'accouchement", type:"number", roomsPerUnit:1, m2:30},
        {key:"postpartum_beds", label:"Lits post-partum",      type:"number", bedsPerUnit:1, roomsPerUnit:1, m2:16},
    ]},
    { id:"imaging", name:"Imagerie Medicale", fields:[
        {key:"xray",   label:"Tables de radiologie",  type:"number", roomsPerUnit:1, m2:30},
        {key:"ct_32",  label:"Scanner 32 barrettes",  type:"number", roomsPerUnit:1, m2:55},
        {key:"ct_128", label:"Scanner 128 barrettes", type:"number", roomsPerUnit:1, m2:60},
        {key:"mri_15", label:"IRM 1,5T",              type:"number", roomsPerUnit:1, m2:70},
    ]},
    { id:"emergency", name:"Service des Urgences", fields:[
        {key:"triage",    label:"Box de triage",       type:"number", roomsPerUnit:1, m2:12},
        {key:"consult",   label:"Box de consultation", type:"number", roomsPerUnit:1, m2:14},
        {key:"treatment", label:"Box de traitement",   type:"number", roomsPerUnit:1, m2:16},
        {key:"obs_beds",  label:"Lits d'observation",  type:"number", bedsPerUnit:1, roomsPerUnit:1, m2:14},
        {key:"resus",     label:"Box de reanimation",  type:"number", roomsPerUnit:1, m2:20},
    ]},
    { id:"labs", name:"Laboratoires", fields:[
        {key:"biochemistry",   label:"Biochimie",             type:"checkbox", m2:40},
        {key:"hematology",     label:"Hematologie",           type:"checkbox", m2:35},
        {key:"microbiology",   label:"Microbiologie",         type:"checkbox", m2:35},
        {key:"blood_bank",     label:"Banque de sang",        type:"checkbox", m2:30},
        {key:"sampling_rooms", label:"Salles de prelevement", type:"number", roomsPerUnit:1, m2:16},
    ]},
  ],
  "AMBULATOIRE": [
    { id:"consultations", name:"Consultations et Explorations", fields:[
        {key:"standard",  label:"Consultation standard",      type:"number", roomsPerUnit:1, m2:16},
        {key:"gynae",     label:"Consultation gynecologie",   type:"number", roomsPerUnit:1, m2:18},
        {key:"ophthalmo", label:"Consultation ophtalmologie", type:"number", roomsPerUnit:1, m2:16},
        {key:"ent",       label:"Consultation ORL",           type:"number", roomsPerUnit:1, m2:16},
        {key:"gastro",    label:"Exploration gastro",         type:"number", roomsPerUnit:1, m2:35},
    ]},
    { id:"dental", name:"Service Dentaire", fields:[
        {key:"chairs",    label:"Fauteuils dentaires",      type:"number", roomsPerUnit:1, m2:14},
        {key:"oral_surg", label:"Salle chirurgie buccale",  type:"number", roomsPerUnit:1, m2:30},
    ]},
    { id:"hemodialysis", name:"Hemodialyse", fields:[
        {key:"open_chairs", label:"Fauteuils espace ouvert", type:"number", roomsPerUnit:1, m2:6},
        {key:"boxes",       label:"Boxes individuels",       type:"number", roomsPerUnit:1, m2:14},
    ]},
  ],
  "ONCOLOGIE": [
    { id:"nuclear_med", name:"Medecine Nucleaire", fields:[
        {key:"spect_ct", label:"Salles SPECT-TDM", type:"number", roomsPerUnit:1, m2:55},
        {key:"pet_scan", label:"Salles TEP-SCAN",  type:"number", roomsPerUnit:1, m2:60},
    ]},
    { id:"radiotherapy", name:"Radiotherapie", fields:[
        {key:"linac_bunkers",  label:"Bunkers accelerateurs", type:"number", roomsPerUnit:1, m2:80},
        {key:"brachy_bunkers", label:"Bunkers curietherapie", type:"number", roomsPerUnit:1, m2:60},
    ]},
    { id:"chemo", name:"Chimiotherapie", fields:[
        {key:"open_chairs", label:"Fauteuils espace ouvert", type:"number", roomsPerUnit:1, m2:6},
        {key:"boxes",       label:"Boxes individuels",       type:"number", roomsPerUnit:1, m2:14},
    ]},
  ],
  "ADMINISTRATION": [
    { id:"front_office", name:"Accueil et Front Office", fields:[
        {key:"admission_desks", label:"Guichets d'admission",   type:"number", roomsPerUnit:1, m2:10},
        {key:"billing_offices", label:"Bureaux facturation",    type:"number", roomsPerUnit:1, m2:14},
        {key:"waiting_seats",   label:"Places salle d'attente", type:"number", m2:2},
    ]},
    { id:"back_office", name:"Direction et Back Office", fields:[
        {key:"general_mgmt",  label:"Bureaux direction",   type:"number", roomsPerUnit:1, m2:20},
        {key:"hr",            label:"Bureaux RH",          type:"number", roomsPerUnit:1, m2:14},
        {key:"meeting_rooms", label:"Salles de reunion",   type:"number", roomsPerUnit:1, m2:30},
    ]},
  ],
  "LOGISTIQUE": [
    { id:"support", name:"Locaux Techniques et Support", fields:[
        {key:"sterilization",  label:"Sterilisation centrale",   type:"checkbox", m2:80},
        {key:"kitchen",        label:"Cuisine",                  type:"checkbox", m2:60},
        {key:"laundry",        label:"Buanderie / Blanchisserie",type:"checkbox", m2:40},
        {key:"morgue",         label:"Morgue",                   type:"checkbox", m2:30},
        {key:"delivery_bays",  label:"Quais de livraison",       type:"number", roomsPerUnit:1, m2:20},
        {key:"changing_rooms", label:"Vestiaires personnel",     type:"number", roomsPerUnit:1, m2:15},
    ]},
  ],
  "PHARMACIE": [
    { id:"pharmacy", name:"Pharmacie", fields:[
        {key:"dispensing",    label:"Guichets de dispensation",  type:"number", roomsPerUnit:1, m2:12},
        {key:"storage_rooms", label:"Locaux de stockage",        type:"number", roomsPerUnit:1, m2:20},
        {key:"prep_rooms",    label:"Salles preparation sterile",type:"number", roomsPerUnit:1, m2:25},
        {key:"cytotoxic",     label:"Salle cytotoxiques",        type:"checkbox", m2:30},
    ]},
  ],
  "HOSPITALISATION GREFFE": [
    { id:"transplant", name:"Service Greffe", fields:[
        {key:"single_rooms", label:"Chambres individuelles avec sas", type:"number", bedsPerUnit:1, roomsPerUnit:1, m2:28},
        {key:"en_suite",     label:"WC + douche privatif",            type:"checkbox"},
    ]},
  ],
  "HOSPITALISATION HÉMATOLOGIE": [
    { id:"hematology", name:"Hospitalisation Hematologie", fields:[
        {key:"single_rooms", label:"Chambres individuelles avec sas", type:"number", bedsPerUnit:1, roomsPerUnit:1, m2:28},
        {key:"en_suite",     label:"WC + douche privatif",            type:"checkbox"},
    ]},
  ],
};

const ALL_TYPES = Object.keys(UNITS_BY_TYPE);

// ─────────────────────────────────────────────────────────────────────────────
// HISTORY
// ─────────────────────────────────────────────────────────────────────────────
let _memHistory = [];
const HKEY = "clinarchi_v2";
function loadHistory() {
  if (_memHistory.length) return _memHistory;
  try { const r = sessionStorage.getItem(HKEY); if (r) { _memHistory = JSON.parse(r); return _memHistory; } } catch {}
  return [];
}
function saveToHistory(entry) {
  _memHistory = [entry, ..._memHistory.slice(0, 19)];
  try { sessionStorage.setItem(HKEY, JSON.stringify(_memHistory)); } catch {}
}

// ─────────────────────────────────────────────────────────────────────────────
// SIZING TEXT BUILDER
// ─────────────────────────────────────────────────────────────────────────────
function buildSizingInput(type, unit, vals) {
  const n = k => parseInt(vals?.[k]) || 0;
  const b = k => !!vals?.[k];
  const p = v => String(v).padStart(2, "0");
  const parts = [];

  if (unit.id === "ward") {
    const inst=n("instances")||1, si=n("single_rooms"), iso=n("isolation_rooms"), db=n("double_rooms"), tr=n("triple_rooms");
    const tot=(si+iso+db*2+tr*3)*inst;
    if(tot>0){
      const bd=[];
      if(si)bd.push(`${p(si*inst)} chambre${si*inst>1?"s":""} simple${si*inst>1?"s":""}`);
      if(iso)bd.push(`${p(iso*inst)} chambre${iso*inst>1?"s":""} d'isolement`);
      if(db)bd.push(`${p(db*inst)} chambre${db*inst>1?"s":""} double${db*inst>1?"s":""}`);
      if(tr)bd.push(`${p(tr*inst)} chambre${tr*inst>1?"s":""} triple${tr*inst>1?"s":""}`);
      parts.push(`${tot} lits: ${bd.join(", ")}`);
      if(b("en_suite"))parts.push("sanitaires privatifs (WC + douche)");
      if(inst>1)parts.push(`${inst} unites identiques`);
    }
  }
  if(unit.id==="day_medicine"){const x=n("day_beds"),c=n("treatment_chairs");if(x)parts.push(`${p(x)} lit${x>1?"s":""} de jour`);if(c)parts.push(`${p(c)} fauteuil${c>1?"s":""} de traitement`);}
  if(unit.id==="day_surgical"){const x=n("day_beds"),r=n("recovery_bays"),pr=n("prep_bays");if(x)parts.push(`${p(x)} lit${x>1?"s":""} de jour`);if(r)parts.push(`${p(r)} place${r>1?"s":""} SSPI`);if(pr)parts.push(`${p(pr)} place${pr>1?"s":""} preparation`);}
  if(unit.id==="icu_adult"){const x=n("icu_beds"),i=n("isolation_beds"),o=n("open_bays");if(x)parts.push(`${p(x)} lit${x>1?"s":""} reanimation`);if(i)parts.push(`${p(i)} lit${i>1?"s":""} isolement`);if(o)parts.push(`${p(o)} lit${o>1?"s":""} ouvert`);}
  if(unit.id==="icu_peds"){const x=n("picu_beds");if(x)parts.push(`${p(x)} lit${x>1?"s":""} pediatrique${x>1?"s":""}`);}
  if(unit.id==="nicu"){const x=n("incubators"),c=n("open_crib");if(x)parts.push(`${p(x)} incubateur${x>1?"s":""}`);if(c)parts.push(`${p(c)} berceau${c>1?"x":""}`);}
  if(unit.id==="or"){const s=n("standard"),h=n("hyperaseptic"),o=n("obstetric"),pa=n("pacu");const tot=s+h+o;if(tot){const bd=[];if(s)bd.push(`${p(s)} standard`);if(h)bd.push(`${p(h)} hyperaseptique${h>1?"s":""}`);if(o)bd.push(`${p(o)} obstetricale${o>1?"s":""}`);parts.push(`${p(tot)} salle${tot>1?"s":""} operatoire${tot>1?"s":""} (${bd.join(", ")})`);}if(pa)parts.push(`${p(pa)} place${pa>1?"s":""} SSPI`);}
  if(unit.id==="delivery"){const d=n("delivery_rooms"),po=n("postpartum_beds");if(d)parts.push(`${p(d)} salle${d>1?"s":""} d'accouchement`);if(po)parts.push(`${p(po)} lit${po>1?"s":""} post-partum`);}
  if(unit.id==="imaging"){const x=n("xray"),c32=n("ct_32"),c128=n("ct_128"),mr=n("mri_15");if(x)parts.push(`${p(x)} table${x>1?"s":""} radiologie`);if(c32)parts.push(`${p(c32)} scanner 32`);if(c128)parts.push(`${p(c128)} scanner 128`);if(mr)parts.push(`${p(mr)} IRM 1,5T`);}
  if(unit.id==="emergency"){const t=n("triage"),c=n("consult"),tr=n("treatment"),o=n("obs_beds"),r=n("resus");if(t)parts.push(`${p(t)} box triage`);if(c)parts.push(`${p(c)} box consultation`);if(tr)parts.push(`${p(tr)} box traitement`);if(o)parts.push(`${p(o)} lit${o>1?"s":""} observation`);if(r)parts.push(`${p(r)} box reanimation`);}
  if(unit.id==="labs"){const sv=[];if(b("biochemistry"))sv.push("Biochimie");if(b("hematology"))sv.push("Hematologie");if(b("microbiology"))sv.push("Microbiologie");if(b("blood_bank"))sv.push("Banque de sang");if(sv.length)parts.push(sv.join(", "));const s=n("sampling_rooms");if(s)parts.push(`${p(s)} salle${s>1?"s":""} de prelevement`);}
  if(unit.id==="consultations"){const s=n("standard"),g=n("gynae"),op=n("ophthalmo"),e=n("ent"),ga=n("gastro");if(s)parts.push(`${p(s)} salle${s>1?"s":""} standard`);if(g)parts.push(`${p(g)} gynecologie`);if(op)parts.push(`${p(op)} ophtalmologie`);if(e)parts.push(`${p(e)} ORL`);if(ga)parts.push(`${p(ga)} gastro-enterologie`);}
  if(unit.id==="dental"){const c=n("chairs"),o=n("oral_surg");if(c)parts.push(`${p(c)} fauteuil${c>1?"s":""} dentaire${c>1?"s":""}`);if(o)parts.push(`${p(o)} salle chirurgie buccale`);}
  if(unit.id==="hemodialysis"){const o=n("open_chairs"),bx=n("boxes");if(o)parts.push(`${p(o)} fauteuil${o>1?"s":""} ouvert${o>1?"s":""}`);if(bx)parts.push(`${p(bx)} box${bx>1?"es":""} individuel${bx>1?"s":""}`);}
  if(unit.id==="nuclear_med"){const s=n("spect_ct"),pt=n("pet_scan");if(s)parts.push(`${p(s)} salle SPECT-TDM`);if(pt)parts.push(`${p(pt)} salle TEP-SCAN`);}
  if(unit.id==="radiotherapy"){const l=n("linac_bunkers"),br=n("brachy_bunkers");if(l)parts.push(`${p(l)} bunker${l>1?"s":""} accelerateur${l>1?"s":""}`);if(br)parts.push(`${p(br)} bunker${br>1?"s":""} curietherapie`);}
  if(unit.id==="chemo"){const o=n("open_chairs"),bx=n("boxes");if(o)parts.push(`${p(o)} fauteuil${o>1?"s":""} ouvert${o>1?"s":""}`);if(bx)parts.push(`${p(bx)} box${bx>1?"es":""} individuel${bx>1?"s":""}`);}
  if(unit.id==="front_office"){const a=n("admission_desks"),bi=n("billing_offices"),w=n("waiting_seats");if(a)parts.push(`${p(a)} guichet${a>1?"s":""} admission`);if(bi)parts.push(`${p(bi)} bureau${bi>1?"x":""} facturation`);if(w)parts.push(`${p(w)} places attente`);}
  if(unit.id==="back_office"){const g=n("general_mgmt"),h=n("hr"),m=n("meeting_rooms");if(g)parts.push(`${p(g)} bureau${g>1?"x":""} direction`);if(h)parts.push(`${p(h)} bureau${h>1?"x":""} RH`);if(m)parts.push(`${p(m)} salle${m>1?"s":""} reunion`);}
  if(unit.id==="support"){const it=[];if(b("sterilization"))it.push("Sterilisation centrale");if(b("kitchen"))it.push("Cuisine");if(b("laundry"))it.push("Buanderie");if(b("morgue"))it.push("Morgue");const d=n("delivery_bays"),c=n("changing_rooms");if(d)it.push(`${p(d)} quai${d>1?"s":""} livraison`);if(c)it.push(`${p(c)} vestiaire${c>1?"s":""}`);if(it.length)parts.push(it.join(", "));}
  if(unit.id==="pharmacy"){const d=n("dispensing"),s=n("storage_rooms"),pr=n("prep_rooms");if(d)parts.push(`${p(d)} guichet${d>1?"s":""} dispensation`);if(s)parts.push(`${p(s)} local${s>1?"ux":""} stockage`);if(pr)parts.push(`${p(pr)} salle${pr>1?"s":""} preparation sterile`);if(b("cytotoxic"))parts.push("salle cytotoxiques");}
  if(unit.id==="transplant"||unit.id==="hematology"){const r=n("single_rooms");if(r){parts.push(`${p(r)} chambre${r>1?"s":""} individuelle${r>1?"s":""} avec sas`);if(b("en_suite"))parts.push("sanitaires privatifs");}}
  return parts.length ? parts.join(", ") + "." : "";
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPUTE SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
function computeSummary(filledData, activeTypes) {
  let totalBeds=0, totalRooms=0, totalArea=0;
  const byType = {};
  activeTypes.forEach(type => {
    let tb=0, tr=0, ta=0;
    const roomDetail = [];
    (UNITS_BY_TYPE[type]||[]).forEach(unit => {
      const vals = filledData[type]?.[unit.id]||{};
      const inst = parseInt(vals.instances)||1;
      unit.fields.forEach(f => {
        const v = vals[f.key];
        const m2 = f.m2 || 16;
        if(f.type==="number") {
          const qty=(parseInt(v)||0)*inst;
          if(f.bedsPerUnit) tb+=qty*f.bedsPerUnit;
          if(f.roomsPerUnit) { tr+=qty; ta+=m2*qty; if(qty>0) roomDetail.push({unit:unit.name,field:f.label,qty,m2,total:m2*qty}); }
          else if(!f.roomsPerUnit && !f.bedsPerUnit) { ta+=m2*qty; }
        } else if(f.type==="checkbox"&&v) {
          tr+=inst; ta+=m2*inst;
          roomDetail.push({unit:unit.name,field:f.label,qty:inst,m2,total:m2*inst});
        }
      });
    });
    totalBeds+=tb; totalRooms+=tr; totalArea+=ta;
    if(tb||tr) byType[type]={beds:tb,rooms:tr,area:Math.round(ta),roomDetail};
  });
  return {totalBeds,totalRooms,totalArea:Math.round(totalArea),byType};
}

// ─────────────────────────────────────────────────────────────────────────────
// DISTRIBUTE TO FLOORS
// ─────────────────────────────────────────────────────────────────────────────
function distributeDepts(byType, numFloors) {
  const entries = Object.entries(byType);
  if(!entries.length) return Array.from({length:numFloors},()=>({}));
  if(numFloors===1) return [byType];
  const PREF={"ADMINISTRATION":0,"AMBULATOIRE":0,"PHARMACIE":0,"LOGISTIQUE":0,"PLATEAU TECHNIQUE":1,"HOSPITALISATION":1,"ONCOLOGIE":2,"HOSPITALISATION GREFFE":2,"HOSPITALISATION HÉMATOLOGIE":2};
  const floors=Array.from({length:numFloors},()=>({}));
  const areas=new Array(numFloors).fill(0);
  const sorted=[...entries].sort((a,b)=>b[1].area-a[1].area);
  for(let fl=0;fl<numFloors&&sorted.length>0;fl++){
    let idx=sorted.findIndex(([t])=>PREF[t]===fl);
    if(idx===-1)idx=0;
    const [type,data]=sorted.splice(idx,1)[0];
    floors[fl][type]=data; areas[fl]+=data.area;
  }
  while(sorted.length>0){const t=areas.indexOf(Math.min(...areas));const [type,data]=sorted.shift();floors[t][type]=data;areas[t]+=data.area;}
  return floors;
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG FLOOR PLAN GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
function genFloorSVG(floorDepts, floorNum, numFloors, bName, bCity) {
  const SC=5.1,OX=342,OY=86;
  const ip=(x,y,z=0)=>[OX+(x-y)*SC*0.866,OY+(x+y)*SC*0.5-z*SC*0.9];
  const pts=arr=>arr.map(([x,y,z=0])=>ip(x,y,z).join(",")).join(" ");
  const P=(arr,f,s="none",sw=0.4)=>`<polygon points="${pts(arr)}" fill="${f}" stroke="${s}" stroke-width="${sw}"/>`;
  const R=(x1,y1,x2,y2,z,f,s="none",sw=0.3)=>P([[x1,y1,z],[x2,y1,z],[x2,y2,z],[x1,y2,z]],f,s,sw);
  const WF=(x1,x2,y,z0,z1,f,s="none",sw=0.7)=>P([[x1,y,z0],[x2,y,z0],[x2,y,z1],[x1,y,z1]],f,s,sw);
  const WR=(x,y1,y2,z0,z1,f,s="none",sw=0.7)=>P([[x,y1,z0],[x,y2,z0],[x,y2,z1],[x,y1,z1]],f,s,sw);
  const LN=(x1,y1,z1,x2,y2,z2,s,sw=0.5)=>{const[ax,ay]=ip(x1,y1,z1),[bx,by]=ip(x2,y2,z2);return`<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="${s}" stroke-width="${sw}"/>`;};
  const CIR=(x,y,z,r,f,s="none",sw=0.3)=>{const[cx,cy]=ip(x,y,z);return`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}" stroke="${s}" stroke-width="${sw}"/>`;};
  const W=72,D=46,WH=3.8,EW=0.55,CY1=20,CY2=24.5,IW=W-2*EW;
  const depts=Object.entries(floorDepts);
  const north=depts.slice(0,Math.ceil(depts.length/2));
  const south=depts.slice(Math.ceil(depts.length/2));
  const nT=north.reduce((a,[,d])=>a+Math.max(d.area,120),0)||1;
  const sT=south.reduce((a,[,d])=>a+Math.max(d.area,120),0)||1;
  const nz=[],sz=[];
  let cx=EW;
  north.forEach(([type,data])=>{const w=Math.max(data.area,120)/nT*IW;nz.push({type,data,x1:cx,y1:EW,x2:cx+w,y2:CY1});cx+=w;});
  cx=EW;
  south.forEach(([type,data])=>{const w=Math.max(data.area,120)/sT*IW;sz.push({type,data,x1:cx,y1:CY2,x2:cx+w,y2:D-EW});cx+=w;});
  let s=`<rect width="820" height="520" fill="#D8E4EE"/>`;
  s+=R(-4,-4,W+4,D+4,-0.3,"rgba(10,22,40,0.14)");
  s+=WF(0,W,0,0,WH,"#2A3B5C","#1A2840",1.5);
  for(let wx=2.5;wx<W-1;wx+=4.2){const ww=Math.min(2.6,W-wx-0.5);s+=WF(wx,wx+ww,0,0.7,WH-0.5,"#B0D4F0","#6A9FC8",0.6);}
  s+=LN(0,0,WH,W,0,WH,"#1A2840",2.2);
  s+=WR(0,0,D,0,WH,"#1E2E50","#111E3A",1.0);
  s+=LN(0,0,WH,0,D,WH,"#111E3A",1.8);
  const drawZone=zone=>{
    const{type,data,x1,y1,x2,y2}=zone;
    const pm=PLAN_META[type]||{floor:"#E8E8E8",wf:"#B0B0B0",label:type,furniture:"chairs"};
    const tm=TYPE_META[type]||{color:"#475569"};
    s+=R(x1,y1,x2,y2,0,pm.floor,"#C8D4DC",0.35);
    const nc=Math.max(1,Math.min(8,Math.round((x2-x1)/4.5))),nr=Math.max(1,Math.min(6,Math.round((y2-y1)/3.8)));
    const cw=(x2-x1)/nc,rh=(y2-y1)/nr;
    for(let c=1;c<nc;c++)s+=LN(x1+c*cw,y1,0,x1+c*cw,y2,0,"#B8C8D4",0.6);
    for(let r=1;r<nr;r++)s+=LN(x1,y1+r*rh,0,x2,y1+r*rh,0,"#B8C8D4",0.6);
    for(let c=0;c<nc;c++)for(let r=0;r<nr;r++){
      const fx=x1+c*cw,fy=y1+r*rh;
      if(pm.furniture==="beds"&&cw>3&&rh>3){s+=R(fx+0.4,fy+0.3,fx+cw-0.4,fy+rh-0.3,0.05,"#F0F0F0","#B8C8D8",0.8);s+=R(fx+0.5,fy+0.4,fx+1.7,fy+rh-0.4,0.1,"#E8EDF8","#9AA8C8",0.7);}
      if(pm.furniture==="chairs"&&cw>3&&rh>3){s+=R(fx+0.5,fy+0.5,fx+cw-0.5,fy+rh*0.5,0.05,"#F0EDE8","#C8B898",0.7);}
      if(pm.furniture==="desks"&&cw>3&&rh>3){s+=R(fx+0.3,fy+0.3,fx+cw-0.3,fy+1.3,0.05,"#E8E0D0","#B8A880",0.7);}
      if(pm.furniture==="shelves"){for(let sh=0;sh<3;sh++)s+=R(fx+0.3,fy+0.3+sh*(rh-0.6)/3,fx+cw-0.3,fy+0.3+(sh+1)*(rh-0.6)/3-0.2,0.05,"#D0C8B8","#A8A090",0.7);}
      if(pm.furniture==="equip"&&cw>3&&rh>3){s+=R(fx+0.6,fy+0.6,fx+cw-0.6,fy+rh-0.6,0.05,"#E8EEF8","#A0B4D0",0.7);s+=R(fx+1.0,fy+0.8,fx+cw-1.0,fy+2.0,0.15,"#203850","#101C38",0.85);}
    }
    const wc="#FFFFFF",we=pm.wf;
    if(y1>EW+0.05)s+=WF(x1,x2,y1,0,WH*0.92,wc,we,0.9);
    if(x1>EW+0.05)s+=WR(x1,y1,y2,0,WH*0.92,wc,we,0.7);
    if(x2<W-EW-0.05)s+=WR(x2,y1,y2,0,WH*0.92,wc,we,0.8);
    s+=WF(x1,x2,y2,0,WH*0.92,wc,we,1.0);
    [[x1+0.8,y1+0.8],[x2-0.8,y1+0.8]].forEach(([px,py])=>{if(px>x1+0.3&&px<x2-0.3&&py<y2-0.5){s+=CIR(px,py,0.12,1.0,"#5C3A1A");s+=CIR(px-0.5,py-0.3,0.25,1.3,"#1A6B3A");s+=CIR(px+0.4,py-0.4,0.25,1.1,"#1F8040");s+=CIR(px,py-0.7,0.25,1.5,"#25A050");}});
    const mx=(x1+x2)/2,my=y2;
    const[lx,ly]=ip(mx,my,WH+0.3);
    s+=`<text x="${lx}" y="${ly}" font-size="8" fill="${tm.color}" text-anchor="middle" font-weight="800" font-family="DM Sans,Helvetica,sans-serif">${pm.label.length>18?pm.label.slice(0,18)+"...":pm.label}</text>`;
    const st=data.beds>0?`${data.beds} lits - ${data.rooms} salles - ${data.area}m2`:`${data.rooms} salles - ${data.area}m2`;
    s+=`<text x="${lx}" y="${ly+10}" font-size="6.5" fill="#4A5568" text-anchor="middle" font-family="DM Sans,Helvetica,sans-serif">${st}</text>`;
  };
  nz.forEach(drawZone);
  s+=R(EW,CY1,W-EW,CY2,0,"#F2F2EE","#C8D4DC",0.5);
  for(let tx=EW;tx<W-EW;tx+=3.5)s+=LN(tx,CY1,0,tx,CY2,0,"#D8D8D4",0.4);
  [4,10,17,25,33,42,52,60,67].filter(px=>px>EW&&px<W-EW).forEach(px=>{const py=CY1+(CY2-CY1)/2;s+=CIR(px,py,0.12,1.1,"#6B4C2A");s+=CIR(px-0.6,py-0.4,0.25,1.6,"#14532D");s+=CIR(px+0.5,py-0.5,0.25,1.4,"#166534");s+=CIR(px,py-0.9,0.25,1.8,"#16A34A");});
  sz.forEach(drawZone);
  s+=WF(EW,W-EW,CY1,0,WH*0.82,"#FAFAFA","#C8C8C8",0.5);
  s+=WF(EW,W-EW,CY2,0,WH*0.82,"#FAFAFA","#C8C8C8",0.7);
  const GL="rgba(160,215,240,0.22)",FR="#1C2E50";
  for(let gx=0;gx<W;gx+=3.6){const gw=Math.min(3.6,W-gx);s+=WF(gx,gx+gw,D,0,WH,GL,"none");const[fx,fy]=ip(gx,D,0),[fx2,fy2]=ip(gx,D,WH);s+=`<line x1="${fx}" y1="${fy}" x2="${fx2}" y2="${fy2}" stroke="${FR}" stroke-width="1.4"/>`;[0.9,2.0,WH-0.7].forEach(gz=>s+=LN(gx,D,gz,gx+gw,D,gz,FR,0.7));}
  const doX=W/2-3;
  s+=WF(doX,doX+6,D,0,WH,"rgba(140,200,230,0.18)","#3060A0",0.8);
  const[ex,ey]=ip(W/2,D,WH*0.45);
  s+=`<text x="${ex}" y="${ey}" font-size="5.5" fill="#1E3060" text-anchor="middle" font-weight="800" font-family="DM Sans,sans-serif">ENTREE PRINCIPALE</text>`;
  s+=LN(0,D,0,W,D,0,FR,2.2);s+=LN(0,D,WH,W,D,WH,FR,2.5);
  for(let gy=0;gy<D;gy+=3.6){const gd=Math.min(3.6,D-gy);s+=WR(W,gy,gy+gd,0,WH,"rgba(150,210,235,0.18)","none");const[rx,ry]=ip(W,gy,0),[rx2,ry2]=ip(W,gy,WH);s+=`<line x1="${rx}" y1="${ry}" x2="${rx2}" y2="${ry2}" stroke="${FR}" stroke-width="1.2"/>`;[0.9,2.0,WH-0.7].forEach(gz=>s+=LN(W,gy,gz,W,gy+gd,gz,FR,0.6));}
  s+=LN(W,0,0,W,D,0,FR,1.8);s+=LN(W,0,WH,W,D,WH,FR,2.0);
  s+=R(0,0,W,D,WH,"rgba(232,238,245,0.5)","none");
  s+=LN(0,0,WH,W,0,WH,FR,1.6);s+=LN(0,0,WH,0,D,WH,"#111C34",1.4);
  s+=WF(0,W,0,WH,WH+0.4,"#D8DCE8","#B0B8CC",0.6);s+=WR(0,0,D,WH,WH+0.4,"#C8CDD8","#A0A8BC",0.5);
  const fll=["Rez-de-Chaussee","1er Etage","2eme Etage","3eme Etage","4eme Etage"];
  const[flx,fly]=ip(W*0.68,-5.5,0);
  s+=`<text x="${flx}" y="${fly+15}" font-size="10" fill="#3B82F6" font-weight="700" text-anchor="middle" font-family="DM Sans,sans-serif"> ${fll[floorNum]||"Etage "+floorNum}</text>`;
  s+=`<text x="${flx}" y="${fly+27}" font-size="8" fill="#64748B" text-anchor="middle" font-family="DM Sans,sans-serif">${bCity||"Maroc"}</text>`;
  if(!depts.length){const[ex2,ey2]=ip(W/2,D/2,0);s+=`<text x="${ex2}" y="${ey2}" font-size="11" fill="#94A3B8" text-anchor="middle">Aucun departement sur cet etage</text>`;}
  return s;
}

// ─────────────────────────────────────────────────────────────────────────────
// ARCH FLOOR PLAN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function ArchFloorPlan({ summary, numFloors, name, city }) {
  const [af, setAf] = useState(0);
  const floors = useMemo(()=>distributeDepts(summary.byType,numFloors),[summary,numFloors]);
  const svg = useMemo(()=>genFloorSVG(floors[af]||{},af,numFloors,name,city),[floors,af,numFloors,name,city]);
  const fl=["RDC","R+1","R+2","R+3","R+4"];
  return(
    <div>
      {numFloors>1&&<div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
        {Array.from({length:numFloors}).map((_,i)=>{
          const has=Object.keys(floors[i]||{}).length>0;
          return<button key={i} onClick={()=>setAf(i)} style={{padding:"8px 18px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:af===i?700:500,fontFamily:"inherit",background:af===i?"#1D4ED8":"white",color:af===i?"white":has?"#1D4ED8":"#94A3B8",border:`1.5px solid ${af===i?"#1D4ED8":has?"#BFDBFE":"#E2E8F0"}`,boxShadow:af===i?"0 2px 8px rgba(29,78,216,0.3)":"none"}}>{fl[i]||"Etage "+i}{has&&<span style={{marginLeft:5,fontSize:10,opacity:0.8}}>({Object.keys(floors[i]).length})</span>}</button>;
        })}
      </div>}
      <div style={{width:"100%",borderRadius:14,border:"1px solid #E2E8F0",overflow:"hidden",boxShadow:"0 4px 32px rgba(0,0,0,.09)"}}>
        <svg width="100%" viewBox="0 0 820 520" preserveAspectRatio="xMidYMid meet" style={{display:"block",background:"#D8E4EE"}} dangerouslySetInnerHTML={{__html:svg}}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function loadScript(src, check, cb) {
  if (check()) { cb(); return; }
  const s = document.createElement("script");
  s.src = src;
  s.onload = () => { if (check()) cb(); else alert("Echec chargement bibliotheque."); };
  s.onerror = () => alert("Impossible de charger la bibliotheque. Verifiez votre connexion.");
  document.head.appendChild(s);
}

function doExcelExport({ name, city, numFloors, numSousSols, parking, terrainSurface, summary, filledData, activeTypes }) {
  const XLSX = window.XLSX;
  const wb = XLSX.utils.book_new();
  const FL = ["RDC","R+1","R+2","R+3","R+4","R+5"];
  const floors = distributeDepts(summary.byType, numFloors);
  const typeFloor = {};
  floors.forEach((fd,fi) => Object.keys(fd).forEach(t => { typeFloor[t] = FL[fi]||"Etage "+fi; }));

  const s1 = [["TYPE / DEPARTEMENT","UNITE FONCTIONNELLE","DESCRIPTION","ETAGE AFFECTE","SURFACE NETTE (m2)"]];
  activeTypes.forEach(type => {
    (UNITS_BY_TYPE[type]||[]).forEach(unit => {
      const vals = filledData?.[type]?.[unit.id];
      if (!vals) return;
      const hasData = unit.fields.some(f => f.type==="number" ? parseInt(vals[f.key])>0 : !!vals[f.key]);
      if (!hasData) return;
      const desc = buildSizingInput(type, unit, vals);
      if (!desc) return;
      const unitArea = summary.byType[type]?.roomDetail?.filter(r=>r.unit===unit.name).reduce((a,r)=>a+r.total,0)||0;
      s1.push([type, unit.name, desc, typeFloor[type]||"RDC", unitArea||""]);
    });
  });
  const ws1 = XLSX.utils.aoa_to_sheet(s1);
  ws1["!cols"] = [{wch:28},{wch:32},{wch:75},{wch:14},{wch:18}];
  XLSX.utils.book_append_sheet(wb, ws1, "Programme Spatial");

  const s2 = [["DEPARTEMENT","UNITE","LOCAL / EQUIPEMENT","QUANTITE","m2 / UNITE","SURFACE TOTALE (m2)","ETAGE"]];
  activeTypes.forEach(type => {
    (summary.byType[type]?.roomDetail||[]).forEach(rd => {
      s2.push([type, rd.unit, rd.field, rd.qty, rd.m2, rd.total, typeFloor[type]||"RDC"]);
    });
  });
  s2.push([]);
  s2.push(["","","","","","TOTAL",summary.totalArea]);
  const ws2 = XLSX.utils.aoa_to_sheet(s2);
  ws2["!cols"] = [{wch:28},{wch:28},{wch:35},{wch:10},{wch:13},{wch:20},{wch:12}];
  XLSX.utils.book_append_sheet(wb, ws2, "Detail Surfaces");

  const s3 = [
    ["PROGRAMME SPATIAL - CLINARCHI"],[""],
    ["Clinique",name||""],["Ville",city||""],
    ["Niveaux",numFloors],["Sous-sols",numSousSols],
    ["Parking",parking==="oui_ss"?"Oui - sous-sol":parking==="oui_ext"?"Oui - exterieur":"Non"],
    ["Surface terrain (m2)",parseFloat(terrainSurface)||""],
    [""],
    ["INDICATEURS CLES",""],
    ["Total lits",summary.totalBeds],["Total salles",summary.totalRooms],
    ["Surface nette (m2)",summary.totalArea],["Surface brute est. (m2)",Math.round(summary.totalArea*1.35)],
    ["Departements actifs",Object.keys(summary.byType).length],[""],
    ["DEPARTEMENT","LITS","SALLES","SURFACE (m2)","% TOTAL","ETAGE"],
    ...Object.entries(summary.byType).map(([t,d])=>[t,d.beds||0,d.rooms,d.area,summary.totalArea?Math.round(d.area/summary.totalArea*100)+"%":"",typeFloor[t]||"RDC"]),
    ["TOTAL",summary.totalBeds,summary.totalRooms,summary.totalArea,"100%",""],
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(s3);
  ws3["!cols"] = [{wch:32},{wch:12},{wch:12},{wch:16},{wch:10},{wch:12}];
  XLSX.utils.book_append_sheet(wb, ws3, "Recapitulatif");

  XLSX.writeFile(wb, `${(name||"clinique").replace(/\s+/g,"_")}_ClinArchi.xlsx`);
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF EXPORT
// ─────────────────────────────────────────────────────────────────────────────
function sanitize(str) {
  if (!str) return "";
  return String(str)
    .replace(/[\u00C0-\u00C5\u00E0-\u00E5]/g,"a")
    .replace(/[\u00C7\u00E7]/g,"c")
    .replace(/[\u00C8-\u00CB\u00E8-\u00EB]/g,"e")
    .replace(/[\u00CC-\u00CF\u00EC-\u00EF]/g,"i")
    .replace(/[\u00D4\u00F4\u00D2\u00D3\u00F2\u00F3]/g,"o")
    .replace(/[\u00D9-\u00DC\u00F9-\u00FC]/g,"u")
    .replace(/[\u00D1\u00F1]/g,"n")
    .replace(/[\u2019\u2018]/g,"'")
    .replace(/[\u2013\u2014]/g,"-")
    .replace(/[\u00AB\u00BB]/g,'"')
    .replace(/[^\x00-\x7F]/g,"");
}

function doPDFExport({ name, city, numFloors, numSousSols, parking, terrainSurface, summary, filledData, activeTypes, report }) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
  const mL=20, mR=20, pW=210, lH=5.5;
  let y=0;

  const safe = str => sanitize(str || "");
  const newPage = () => { doc.addPage(); y=24; };
  const chk = (need=10) => { if(y+need>278) newPage(); };

  const txt = (text, fs=10, style="normal", color=[30,41,59], align="left", xOverride=null) => {
    doc.setFontSize(fs);
    doc.setFont("helvetica", style);
    doc.setTextColor(...color);
    const maxW = pW - mL - mR;
    const x = xOverride !== null ? xOverride : (align === "center" ? pW/2 : align === "right" ? pW - mR : mL);
    const lines = doc.splitTextToSize(safe(text), align==="center"||align==="right" ? maxW : maxW);
    lines.forEach(line => {
      chk(lH * (fs / 10) + 1);
      doc.text(line, x, y, { align });
      y += lH * (fs / 10);
    });
  };

  const sp = (h=4) => { y += h; };
  const rule = (color=[226,232,240], lw=0.3) => {
    doc.setDrawColor(...color); doc.setLineWidth(lw);
    doc.line(mL, y, pW-mR, y); sp(3);
  };

  const sectionHeader = (num, label) => {
    chk(18);
    sp(6);
    doc.setFillColor(15,23,42);
    doc.rect(mL, y-1, pW-mL-mR, 9, "F");
    doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(255,255,255);
    doc.text(`${num}.  ${safe(label).toUpperCase()}`, mL+4, y+5.5);
    y += 12;
  };

  const FL = ["RDC","R+1","R+2","R+3","R+4"];
  const floors = distributeDepts(summary.byType, numFloors);
  const typeFloor = {};
  floors.forEach((fd,fi) => Object.keys(fd).forEach(t => { typeFloor[t] = FL[fi]||"Etage "+fi; }));
  const surfDispo = parseFloat(terrainSurface)||0;
  const surfBrut = Math.round(summary.totalArea*1.35);
  const pctSurf = surfDispo>0 ? Math.round(surfBrut/surfDispo*100) : 0;

  doc.setFillColor(15,23,42);
  doc.rect(0, 0, 210, 6, "F");
  doc.setFillColor(14,165,233);
  doc.rect(0, 6, 60, 2, "F");

  y = 28;

  doc.setFontSize(26); doc.setFont("helvetica","bold"); doc.setTextColor(15,23,42);
  const titleLines = doc.splitTextToSize(safe(name||"Clinique"), pW - mL - mR - 10);
  titleLines.forEach(line => { doc.text(line, mL, y); y += 11; });

  doc.setFontSize(11); doc.setFont("helvetica","normal"); doc.setTextColor(71,85,105);
  doc.text(safe(`${city||"Casablanca"}, Royaume du Maroc`), mL, y); y += 18;

  doc.setDrawColor(226,232,240); doc.setLineWidth(0.4);
  doc.line(mL, y, pW-mR, y); y += 10;

  const metaItems = [
    ["Niveaux", `${numFloors} (${FL.slice(0,numFloors).join(" + ")})`],
    ["Sous-sols", String(numSousSols)],
    ["Parking", parking==="oui_ss" ? "Sous-sol" : parking==="oui_ext" ? "Exterieur" : "Non prevu"],
    ["Surface terrain", surfDispo>0 ? `${surfDispo.toLocaleString("fr-FR")} m2` : "Non renseignee"],
    ["Capacite lits", String(summary.totalBeds)],
    ["Salles fonctionnelles", String(summary.totalRooms)],
    ["Surface nette", `${summary.totalArea.toLocaleString("fr-FR")} m2`],
    ["Surface brute est.", `${surfBrut.toLocaleString("fr-FR")} m2  (coef. x1.35)`],
  ];
  const colW = (pW - mL - mR) / 2;
  metaItems.forEach(([label, value], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const xPos = mL + col * colW;
    const yPos = y + row * 11;
    doc.setFontSize(7.5); doc.setFont("helvetica","normal"); doc.setTextColor(100,116,139);
    doc.text(safe(label).toUpperCase(), xPos, yPos);
    doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(15,23,42);
    doc.text(safe(value), xPos, yPos + 4.5);
  });
  y += Math.ceil(metaItems.length / 2) * 11 + 12;

  const kpis = [
    [String(summary.totalBeds), "Lits", [14,165,233]],
    [String(summary.totalRooms), "Salles", [91,33,182]],
    [`${summary.totalArea.toLocaleString("fr-FR")} m2`, "Surface nette", [5,150,105]],
    [String(Object.keys(summary.byType).length), "Departements", [217,119,6]],
  ];
  const kw = (pW - mL - mR - 9) / 4;
  kpis.forEach(([val,label,rgb], i) => {
    const kx = mL + i * (kw + 3);
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    doc.roundedRect(kx, y, kw, 18, 2, 2, "F");
    doc.setFontSize(13); doc.setFont("helvetica","bold"); doc.setTextColor(255,255,255);
    doc.text(safe(val), kx + kw/2, y + 9, { align:"center" });
    doc.setFontSize(7); doc.setFont("helvetica","normal");
    doc.text(safe(label).toUpperCase(), kx + kw/2, y + 15, { align:"center" });
  });
  y += 26;

  const dateStr = new Date().toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"});
  doc.setFontSize(7.5); doc.setFont("helvetica","normal"); doc.setTextColor(148,163,184);
  doc.text(`Document emis le ${safe(dateStr)}`, mL, y);
  doc.text("ClinArchi - Programmation Spatiale Hospitaliere", pW-mR, y, { align:"right" });
  y += 16;

  sectionHeader(1, "Tableau des surfaces par departement");

  const tCols = [72, 16, 16, 28, 18];
  const tX = [mL, mL+72, mL+88, mL+104, mL+132];
  const tH = ["Departement","Lits","Salles","Surface (m2)","% Total"];
  doc.setFillColor(248,250,252);
  doc.rect(mL, y, pW-mL-mR, 7, "F");
  doc.setDrawColor(226,232,240); doc.setLineWidth(0.3);
  doc.rect(mL, y, pW-mL-mR, 7, "D");
  doc.setFontSize(7.5); doc.setFont("helvetica","bold"); doc.setTextColor(71,85,105);
  tH.forEach((h,i) => doc.text(h, tX[i]+2, y+5));
  y += 8;

  Object.entries(summary.byType).forEach(([type,data],idx) => {
    chk(8);
    const pct = summary.totalArea ? Math.round(data.area/summary.totalArea*100) : 0;
    doc.setFillColor(idx%2===0 ? 255 : 249, idx%2===0 ? 255 : 250, idx%2===0 ? 255 : 252);
    doc.rect(mL, y, pW-mL-mR, 6.5, "F");
    doc.setDrawColor(241,245,249); doc.setLineWidth(0.2);
    doc.line(mL, y+6.5, pW-mR, y+6.5);
    doc.setFontSize(7.5); doc.setFont("helvetica","normal"); doc.setTextColor(30,41,59);
    doc.text(safe(type), tX[0]+2, y+4.5);
    doc.text(String(data.beds||"-"), tX[1]+2, y+4.5);
    doc.text(String(data.rooms), tX[2]+2, y+4.5);
    doc.text(`${data.area.toLocaleString("fr-FR")} m2`, tX[3]+2, y+4.5);
    doc.text(`${pct}%`, tX[4]+2, y+4.5);
    y += 6.5;
  });

  chk(9);
  doc.setFillColor(15,23,42);
  doc.rect(mL, y, pW-mL-mR, 8, "F");
  doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(255,255,255);
  doc.text("TOTAL", tX[0]+2, y+5.5);
  doc.text(String(summary.totalBeds), tX[1]+2, y+5.5);
  doc.text(String(summary.totalRooms), tX[2]+2, y+5.5);
  doc.text(`${summary.totalArea.toLocaleString("fr-FR")} m2`, tX[3]+2, y+5.5);
  doc.text("100%", tX[4]+2, y+5.5);
  y += 12;

  if(surfDispo > 0) {
    chk(10);
    const noteColor = pctSurf>100 ? [220,38,38] : pctSurf>85 ? [217,119,6] : [5,150,105];
    doc.setFillColor(...noteColor.map(c=>Math.round(c*0.12+243)));
    doc.setDrawColor(...noteColor); doc.setLineWidth(0.3);
    doc.roundedRect(mL, y, pW-mL-mR, 9, 1.5, 1.5, "FD");
    doc.setFontSize(8); doc.setFont("helvetica","normal"); doc.setTextColor(...noteColor);
    const noteStatus = pctSurf>100 ? "DEPASSEMENT" : pctSurf>85 ? "ATTENTION" : "CONFORME";
    doc.text(
      safe(`Surface brute estimee : ${surfBrut.toLocaleString("fr-FR")} m2  |  Terrain : ${surfDispo.toLocaleString("fr-FR")} m2  |  Taux : ${pctSurf}%  [${noteStatus}]`),
      mL+4, y+6
    );
    y += 13;
  }

  sectionHeader(2, "Repartition par niveau");

  floors.forEach((fd,fi) => {
    const depts = Object.keys(fd);
    if(!depts.length) return;
    chk(16);
    const area = Object.values(fd).reduce((a,d)=>a+d.area,0);
    doc.setFillColor(248,250,252); doc.setDrawColor(226,232,240); doc.setLineWidth(0.3);
    doc.roundedRect(mL, y, pW-mL-mR, 13, 1.5, 1.5, "FD");
    doc.setFontSize(8.5); doc.setFont("helvetica","bold"); doc.setTextColor(14,165,233);
    doc.text(safe(FL[fi]||"Etage "+fi), mL+4, y+5.5);
    doc.setFontSize(8); doc.setFont("helvetica","normal"); doc.setTextColor(71,85,105);
    doc.text(safe(`${area.toLocaleString("fr-FR")} m2  |  ${depts.length} departement${depts.length>1?"s":""}`), mL+26, y+5.5);
    doc.setFontSize(7.5); doc.setTextColor(100,116,139);
    doc.text(safe(depts.join("  /  ")), mL+4, y+10.5);
    y += 17;
  });

  sectionHeader(3, "Programme fonctionnel detaille");

  activeTypes.forEach(type => {
    const units = UNITS_BY_TYPE[type]||[];
    const hasData = units.some(u => {
      const v = filledData?.[type]?.[u.id];
      return v && u.fields.some(f => f.type==="number" ? parseInt(v[f.key])>0 : !!v[f.key]);
    });
    if(!hasData) return;

    chk(18);
    doc.setFillColor(248,250,252); doc.setDrawColor(203,213,225); doc.setLineWidth(0.3);
    doc.roundedRect(mL, y, pW-mL-mR, 10, 1.5, 1.5, "FD");
    doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(15,23,42);
    doc.text(safe(type), mL+4, y+6.5);
    const td = summary.byType[type];
    if(td) {
      const info = safe(`${td.beds>0?td.beds+" lits  |  ":""}${td.rooms} salles  |  ${td.area.toLocaleString("fr-FR")} m2  |  ${typeFloor[type]||"RDC"}`);
      doc.setFontSize(7.5); doc.setFont("helvetica","normal"); doc.setTextColor(100,116,139);
      doc.text(info, pW-mR-2, y+6.5, { align:"right" });
    }
    y += 13;

    units.forEach(unit => {
      const vals = filledData?.[type]?.[unit.id];
      const desc = buildSizingInput(type, unit, vals||{});
      if(!desc) return;
      chk(16);
      const unitArea = (summary.byType[type]?.roomDetail||[]).filter(rd=>rd.unit===unit.name).reduce((a,rd)=>a+rd.total,0);

      doc.setFontSize(8.5); doc.setFont("helvetica","bold"); doc.setTextColor(30,41,59);
      doc.text(safe("  " + unit.name), mL, y); y += 5;

      if(unitArea > 0) {
        doc.setFontSize(7.5); doc.setFont("helvetica","bold"); doc.setTextColor(14,165,233);
        doc.text(safe(`${unitArea.toLocaleString("fr-FR")} m2`), pW-mR, y-5, { align:"right" });
      }

      doc.setFontSize(7.8); doc.setFont("helvetica","normal"); doc.setTextColor(71,85,105);
      const lines = doc.splitTextToSize(safe(desc), pW - mL - mR - 8);
      lines.forEach(line => { chk(5); doc.text(line, mL+5, y); y += 4.5; });
      y += 3;
    });
    y += 4;
  });

  if(report && report.trim().length > 50) {
    sectionHeader(4, "Analyse et recommandations");
    const clean = report
      .replace(/[^\x00-\x7F\n]/g, c => sanitize(c))
      .replace(/^\s*[=\-\*#_]{3,}\s*$/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    clean.split("\n").forEach(line => {
      const trimmed = line.trim();
      if(!trimmed) { sp(2); return; }
      const isHeading = /^\d+\./.test(trimmed) || (trimmed.length < 70 && trimmed === trimmed.toUpperCase() && trimmed.length > 4);
      chk(isHeading ? 10 : 5);
      if(isHeading) {
        sp(3);
        doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(15,23,42);
        const hLines = doc.splitTextToSize(safe(trimmed), pW-mL-mR);
        hLines.forEach(l => { doc.text(l, mL, y); y += 5; });
        sp(1);
      } else {
        doc.setFontSize(8); doc.setFont("helvetica","normal"); doc.setTextColor(71,85,105);
        const pLines = doc.splitTextToSize(safe(trimmed), pW-mL-mR);
        pLines.forEach(l => { chk(5); doc.text(l, mL, y); y += 4.5; });
      }
    });
  }

  sectionHeader(5, "Normes et references");
  const normes = [
    "Ministere de la Sante du Maroc - Normes des etablissements de soins",
    "Health Building Notes (HBN) - NHS England",
    "Health Technical Memoranda (HTM) - Systemes techniques hospitaliers",
    "ASHRAE Standard 170 - Ventilation des etablissements de sante",
    "EN ISO 14644 - Environnements a atmosphere controlee",
    "OMS - Conception des etablissements de sante",
    "Loi n 34-09 relative au systeme de sante du Maroc",
  ];
  normes.forEach(n => {
    chk(7);
    doc.setFontSize(8.5); doc.setFont("helvetica","normal"); doc.setTextColor(71,85,105);
    doc.text(safe("- " + n), mL + 3, y); y += 5.5;
  });

  const np = doc.internal.getNumberOfPages();
  for(let i=1; i<=np; i++) {
    doc.setPage(i);
    doc.setDrawColor(226,232,240); doc.setLineWidth(0.3);
    doc.line(mL, 284, pW-mR, 284);
    doc.setFillColor(15,23,42);
    doc.rect(0, 291, 210, 6, "F");
    doc.setFontSize(7); doc.setFont("helvetica","normal"); doc.setTextColor(255,255,255);
    doc.text(safe(`ClinArchi  |  ${name||"Clinique"}  -  ${city||"Casablanca"}, Maroc`), mL, 295.5);
    doc.text(`Page ${i} / ${np}`, pW-mR, 295.5, { align:"right" });
  }

  doc.save(`${(name||"clinique").replace(/\s+/g,"_")}_ClinArchi.pdf`);
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const S={
  app:{fontFamily:"'DM Sans','Segoe UI',sans-serif",background:"#FFFFFF",minHeight:"100vh",color:"#1E293B"},
  grid:{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",backgroundImage:"linear-gradient(rgba(56,189,248,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(56,189,248,.07) 1px,transparent 1px)",backgroundSize:"34px 34px"},
  hdr:{position:"sticky",top:0,zIndex:50,background:"rgba(255,255,255,0.96)",backdropFilter:"blur(16px)",borderBottom:"1px solid #E2E8F0",boxShadow:"0 1px 12px rgba(30,58,138,.06)"},
  hdrIn:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap",minHeight:60,padding:"10px 12px"},
  logoBox:{width:38,height:38,borderRadius:10,overflow:"hidden",flexShrink:0},
  logoName:{fontSize:15,fontWeight:800,color:"#0F172A",letterSpacing:"-.03em"},
  logoSub:{fontSize:10,color:"#94A3B8",marginTop:1},
  wrap:{position:"relative",zIndex:1,display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(320px, 1fr))",gap:16,padding:"16px 12px 40px"},
  sidebar:{width:"100%",flexShrink:1},
  main:{width:"100%",minWidth:0},
  card:{background:"#FFF",border:"1px solid #E2E8F0",borderRadius:14,padding:18,marginBottom:12,boxShadow:"0 1px 4px rgba(0,0,0,.04)"},
  lbl:{fontSize:10,fontWeight:700,color:"#94A3B8",letterSpacing:".07em",textTransform:"uppercase",marginBottom:5,display:"block"},
  input:{background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:8,padding:"9px 12px",color:"#0F172A",fontSize:13,outline:"none",width:"100%",transition:"border .15s",boxSizing:"border-box"},
  select:{background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:8,padding:"9px 12px",color:"#0F172A",fontSize:14,outline:"none",width:"100%",cursor:"pointer",maxWidth:"100%"},
  fGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:10},
  genBtn:{width:"100%",padding:"12px 0",borderRadius:10,border:"none",background:"linear-gradient(135deg,#0ea5e9,#1d4ed8)",color:"#FFF",fontSize:13,fontWeight:700,cursor:"pointer",marginTop:14,boxShadow:"0 4px 16px rgba(14,165,233,.3)"},
};

// ─────────────────────────────────────────────────────────────────────────────
// FIELD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function Field({field,value,onChange,accent,light}){
  if(field.type==="checkbox"){
    const checked=!!value;
    return(
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",background:checked?light:"#F8FAFC",border:`1px solid ${checked?accent+"55":"#E2E8F0"}`,borderRadius:8,cursor:"pointer"}} onClick={()=>onChange(!checked)}>
        <div style={{width:15,height:15,borderRadius:4,flexShrink:0,border:`2px solid ${checked?accent:"#CBD5E1"}`,background:checked?accent:"#FFF",display:"flex",alignItems:"center",justifyContent:"center"}}>
          {checked&&<span style={{color:"#FFF",fontSize:9,fontWeight:800}}>✓</span>}
        </div>
        <span style={{fontSize:12,color:checked?"#0F172A":"#94A3B8",userSelect:"none",fontWeight:checked?500:400}}>{field.label}</span>
      </div>
    );
  }
  return(
    <div>
      <label style={S.lbl}>{field.label}</label>
      <input style={S.input} type="number" min={field.min??0} value={value??""} placeholder="0"
        onChange={e=>onChange(e.target.value===""?"":(parseInt(e.target.value)||0))}
        onFocus={e=>{e.target.style.borderColor=accent;e.target.style.background="#FFF";e.target.style.boxShadow=`0 0 0 3px ${accent}18`;}}
        onBlur={e=>{e.target.style.borderColor="#E2E8F0";e.target.style.background="#F8FAFC";e.target.style.boxShadow="none";}}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIT CARD
// ─────────────────────────────────────────────────────────────────────────────
function UnitCard({unit,accent,light,values,onChange}){
  const inst=parseInt(values?.instances)||1;
  let beds=0,rooms=0,area=0;
  unit.fields.forEach(f=>{
    const v=values?.[f.key];
    const m2=f.m2||16;
    if(f.type==="number"){const n=(parseInt(v)||0)*inst;if(f.bedsPerUnit)beds+=n*f.bedsPerUnit;if(f.roomsPerUnit){rooms+=n;area+=m2*n;}}
    else if(f.type==="checkbox"&&v){rooms+=inst;area+=m2*inst;}
  });
  const has=beds>0||rooms>0;
  return(
    <div style={{...S.card,borderLeft:`3px solid ${has?accent:"#E2E8F0"}`}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:700,color:"#0F172A"}}>{unit.name}</div>
        <div style={{display:"flex",gap:5,flexShrink:0}}>
          {beds>0&&<span style={{background:light,color:accent,border:`1px solid ${accent}33`,borderRadius:99,padding:"2px 9px",fontSize:11,fontWeight:700}}>{beds} lit{beds>1?"s":""}</span>}
          {rooms>0&&<span style={{background:"#F1F5F9",color:"#475569",borderRadius:99,padding:"2px 9px",fontSize:11,fontWeight:600}}>{rooms} salle{rooms>1?"s":""}</span>}
          {area>0&&<span style={{background:"#F0FDF4",color:"#059669",borderRadius:99,padding:"2px 9px",fontSize:11,fontWeight:600}}>{area} m²</span>}
        </div>
      </div>
      <div style={S.fGrid}>
        {unit.fields.map(f=>(
          <Field key={f.key} field={f} value={values?.[f.key]??(f.default??"")} onChange={v=>onChange(f.key,v)} accent={accent} light={light}/>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ALERT MODAL
// ─────────────────────────────────────────────────────────────────────────────
function AlertModal({deptName,onConfirm,onCancel}){
  return(
    <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(15,23,42,0.6)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#fff",borderRadius:18,padding:30,maxWidth:380,width:"100%",boxShadow:"0 24px 80px rgba(0,0,0,0.2)"}}>
        <div style={{fontSize:36,textAlign:"center",marginBottom:10}}>⚠️</div>
        <div style={{fontSize:16,fontWeight:800,color:"#0F172A",textAlign:"center",marginBottom:8}}>Supprimer ce departement ?</div>
        <div style={{fontSize:13,color:"#64748B",textAlign:"center",marginBottom:22,lineHeight:1.6}}>
          Desactiver <strong>{deptName}</strong> supprimera toutes les donnees saisies pour ce departement.
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onCancel} style={{flex:1,padding:"11px 0",borderRadius:10,border:"1px solid #E2E8F0",background:"#F8FAFC",color:"#475569",fontSize:13,fontWeight:600,cursor:"pointer"}}>Annuler</button>
          <button onClick={onConfirm} style={{flex:1,padding:"11px 0",borderRadius:10,border:"none",background:"linear-gradient(135deg,#DC2626,#B91C1C)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Supprimer</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HISTORY MODAL
// ─────────────────────────────────────────────────────────────────────────────
function HistoryModal({ onClose, onExportEntry, history }) {
  return(
    <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(15,23,42,0.6)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div style={{background:"#fff",borderRadius:20,padding:26,maxWidth:560,width:"100%",maxHeight:"82vh",overflowY:"auto",boxShadow:"0 24px 80px rgba(0,0,0,0.2)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontSize:17,fontWeight:800,color:"#0F172A"}}>Historique des projets</div>
          <button onClick={onClose} style={{background:"#F1F5F9",border:"none",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:13,color:"#475569"}}>✕</button>
        </div>
        {history.length===0?(
          <div style={{textAlign:"center",padding:"40px 0",color:"#94A3B8",fontSize:14}}>Aucun projet genere pour l'instant.</div>
        ):(
          history.map((entry,i)=>(
            <div key={entry.id||i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:14,padding:"14px 16px",border:"1px solid #E2E8F0",borderRadius:12,marginBottom:8,background:"#FAFBFC"}}>
              <div style={{minWidth:0}}>
                <div style={{fontSize:14,fontWeight:700,color:"#0F172A",marginBottom:3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                  {entry.name || "Projet sans nom"}
                </div>
                <div style={{fontSize:11,color:"#94A3B8"}}>
                  {entry.generated_date || entry.date} {entry.generated_time || entry.time ? `à ${entry.generated_time || entry.time}` : ""}
                </div>
              </div>
              <div style={{display:"flex",gap:6,flexShrink:0}}>
                <button onClick={()=>onExportEntry(entry,"excel")} style={{background:"#F0FDF4",border:"1px solid #BBF7D0",color:"#15803D",borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>Excel</button>
                <button onClick={()=>onExportEntry(entry,"pdf")} style={{background:"#EFF6FF",border:"1px solid #BFDBFE",color:"#1D4ED8",borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>PDF</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RESULTS VIEW
// ─────────────────────────────────────────────────────────────────────────────
function ResultsView({entry, onBack, goHome}){
  const {name,city,numFloors,numSousSols,parking,terrainSurface,summary,filledData,activeTypes,report}=entry;
  const [tab,setTab]=useState("3d");

  const exportData = { name,city,numFloors,numSousSols,parking,terrainSurface,summary,filledData,activeTypes,report };

  const handleExcel=()=>loadScript(
    "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js",
    ()=>!!window.XLSX,
    ()=>doExcelExport(exportData)
  );
  const handlePDF=()=>loadScript(
    "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
    ()=>!!window.jspdf?.jsPDF,
    ()=>doPDFExport(exportData)
  );

  return(
    <div>
      <div style={{marginBottom:22,paddingBottom:18,borderBottom:"1px solid #E2E8F0",display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:14}}>
        <div>
          <div style={{fontSize:26,fontWeight:800,color:"#0F172A",letterSpacing:"-.03em"}}>{name||"Clinique"}</div>
          <div style={{fontSize:13,color:"#64748B",marginTop:3}}>{city}, Maroc · {numFloors} niveau{numFloors>1?"x":""} · {numSousSols} sous-sol{numSousSols!==1?"s":""} · Parking : {parking==="oui_ss"?"Sous-sol":parking==="oui_ext"?"Exterieur":"Non"}</div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button onClick={handleExcel} style={{background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:9,color:"#15803D",padding:"9px 16px",fontSize:13,fontWeight:600,cursor:"pointer"}}>Excel</button>
          <button onClick={handlePDF} style={{background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:9,color:"#1D4ED8",padding:"9px 16px",fontSize:13,fontWeight:600,cursor:"pointer"}}>PDF</button>
          <button onClick={onBack} style={{background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:9,color:"#475569",padding:"9px 16px",fontSize:13,fontWeight:600,cursor:"pointer"}}>Modifier</button>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:10,marginBottom:24}}>
        {[["Lits",summary.totalBeds,"#0ea5e9"],["Salles",summary.totalRooms,"#7c3aed"],["Surface",`${summary.totalArea.toLocaleString("fr-FR")} m²`,"#059669"],["Depts",Object.keys(summary.byType).length,"#d97706"]].map(([l,v,c])=>(
          <div key={l} style={{background:"#fff",border:`1px solid ${c}22`,borderRadius:12,padding:"14px 16px",boxShadow:"0 1px 4px rgba(0,0,0,.05)"}}>
            <div style={{fontSize:10,color:c,fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",marginBottom:5}}>{l}</div>
            <div style={{fontSize:22,fontWeight:800,color:"#0f172a"}}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{display:"flex",borderBottom:"2px solid #E2E8F0",marginBottom:22}}>
        {[["3d","Plan architectural"],["table","Surfaces"],["report","Rapport"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{padding:"10px 22px",background:"none",border:"none",cursor:"pointer",fontSize:13,fontWeight:600,color:tab===k?"#0ea5e9":"#94a3b8",borderBottom:`2px solid ${tab===k?"#0ea5e9":"transparent"}`,marginBottom:-2}}>{l}</button>
        ))}
      </div>

      {tab==="3d"&&(
        <div>
          <ArchFloorPlan summary={summary} numFloors={numFloors} name={name} city={city}/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:10,marginTop:18}}>
            {Object.entries(summary.byType).map(([type,data])=>{
              const m=TYPE_META[type]||{color:"#64748b",light:"#f1f5f9"};
              return(
                <div key={type} style={{background:"#fff",border:"1px solid #E2E8F0",borderLeft:`3px solid ${m.color}`,borderRadius:11,padding:"12px 14px"}}>
                  <div style={{fontSize:11,fontWeight:800,color:m.color,marginBottom:6}}>{type}</div>
                  <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                    {data.beds>0&&<span style={{fontSize:12,fontWeight:600,color:"#334155"}}>{data.beds} <span style={{fontSize:10,color:"#94a3b8"}}>lits</span></span>}
                    <span style={{fontSize:12,fontWeight:600,color:"#334155"}}>{data.rooms} <span style={{fontSize:10,color:"#94a3b8"}}>salles</span></span>
                    <span style={{fontSize:12,fontWeight:700,color:m.color}}>{data.area.toLocaleString("fr-FR")} m²</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab==="table"&&(
        <div>
          <div style={{width:"100%",overflowX:"auto"}}>
            <table style={{minWidth:"600px",width:"100%"}}>
              <thead><tr style={{background:"#F8FAFC"}}>
                {["Departement","Lits","Salles","Surface","% total"].map(h=>(<th key={h} style={{padding:"11px 14px",textAlign:"left",fontSize:10,fontWeight:700,color:"#94A3B8",letterSpacing:".07em",textTransform:"uppercase",borderBottom:"2px solid #E2E8F0"}}>{h}</th>))}
              </tr></thead>
              <tbody>
                {Object.entries(summary.byType).map(([type,data],i)=>{
                  const m=TYPE_META[type]||{color:"#64748b",light:"#f1f5f9"};
                  const pct=summary.totalArea?Math.round(data.area/summary.totalArea*100):0;
                  return(<tr key={type} style={{background:i%2===0?"#fff":"#FAFBFC"}}>
                    <td style={{padding:"10px 14px",borderBottom:"1px solid #F1F5F9"}}><span style={{background:m.light||"#f1f5f9",color:m.color,borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:700}}>{type}</span></td>
                    <td style={{padding:"10px 14px",borderBottom:"1px solid #F1F5F9",fontWeight:600}}>{data.beds||"—"}</td>
                    <td style={{padding:"10px 14px",borderBottom:"1px solid #F1F5F9",fontWeight:600}}>{data.rooms}</td>
                    <td style={{padding:"10px 14px",borderBottom:"1px solid #F1F5F9",fontWeight:700,color:m.color}}>{data.area.toLocaleString("fr-FR")} m²</td>
                    <td style={{padding:"10px 14px",borderBottom:"1px solid #F1F5F9"}}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <div style={{flex:1,height:4,background:"#F1F5F9",borderRadius:99}}><div style={{width:`${pct}%`,height:"100%",background:m.color,borderRadius:99}}/></div>
                        <span style={{fontSize:11,color:"#94a3b8",width:28,textAlign:"right",fontWeight:600}}>{pct}%</span>
                      </div>
                    </td>
                  </tr>);
                })}
              </tbody>
              <tfoot><tr style={{background:"#EFF6FF",borderTop:"2px solid #BFDBFE"}}>
                <td style={{padding:"12px 14px",fontWeight:800,color:"#1D4ED8",fontSize:11,textTransform:"uppercase"}}>TOTAL</td>
                <td style={{padding:"12px 14px",fontWeight:800,color:"#0f172a",fontSize:15}}>{summary.totalBeds}</td>
                <td style={{padding:"12px 14px",fontWeight:800,color:"#0f172a",fontSize:15}}>{summary.totalRooms}</td>
                <td style={{padding:"12px 14px",fontWeight:800,color:"#0ea5e9",fontSize:15}}>{summary.totalArea.toLocaleString("fr-FR")} m²</td>
                <td style={{padding:"12px 14px",color:"#94a3b8"}}>100%</td>
              </tr></tfoot>
            </table>
          </div>
          {Object.entries(summary.byType).map(([type,data])=>{
            if(!data.roomDetail?.length) return null;
            const m=TYPE_META[type]||{color:"#64748b",light:"#f1f5f9"};
            return(
              <div key={type} style={{marginBottom:14}}>
                <div style={{fontSize:12,fontWeight:800,color:m.color,marginBottom:6,padding:"5px 10px",background:m.light,borderRadius:7,display:"inline-flex",alignItems:"center",gap:5}}>{type}</div>
                <div style={{borderRadius:10,border:"1px solid #E2E8F0",overflow:"hidden"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                    <thead><tr style={{background:"#F8FAFC"}}>{["Local","Qte","m2/unite","Surface totale"].map(h=>(<th key={h} style={{padding:"7px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",borderBottom:"1px solid #E2E8F0"}}>{h}</th>))}</tr></thead>
                    <tbody>{data.roomDetail.map((rd,i)=>(<tr key={i} style={{background:i%2===0?"#fff":"#FAFBFC"}}>
                      <td style={{padding:"7px 12px",borderBottom:"1px solid #F1F5F9",color:"#334155"}}>{rd.unit} — {rd.field}</td>
                      <td style={{padding:"7px 12px",borderBottom:"1px solid #F1F5F9",fontWeight:700,color:"#0f172a"}}>{rd.qty}</td>
                      <td style={{padding:"7px 12px",borderBottom:"1px solid #F1F5F9",color:"#64748b"}}>{rd.m2} m²</td>
                      <td style={{padding:"7px 12px",borderBottom:"1px solid #F1F5F9",fontWeight:700,color:m.color}}>{rd.total} m²</td>
                    </tr>))}</tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab==="report"&&(
        <div style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:12,padding:"28px 32px",maxHeight:600,overflowY:"auto",fontFamily:"'Georgia',serif",fontSize:13,color:"#334155",lineHeight:1.9}}>
          {report.split("\n").map((line,i)=>{
            const isSep=line.match(/^[=\-_]{4,}/);
            const isBig=line.match(/^\d+\./)||line.match(/^[A-Z]{4,}/);
            if(isSep) return <hr key={i} style={{border:"none",borderTop:"1px solid #E2E8F0",margin:"16px 0"}}/>;
            if(isBig) return <div key={i} style={{fontSize:13,fontWeight:700,color:"#1D4ED8",marginTop:14,marginBottom:4}}>{line}</div>;
            if(!line.trim()) return <div key={i} style={{height:8}}/>;
            return <p key={i} style={{margin:"4px 0"}}>{line}</p>;
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL REPORT BUILDER
// ─────────────────────────────────────────────────────────────────────────────
function buildLocalReport(name, city, numFloors, numSousSols, parking, terrainSurface, summary) {
  const now=new Date().toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"});
  const FL=["RDC","R+1","R+2","R+3","R+4"];
  const floors=distributeDepts(summary.byType,numFloors);
  const typeFloor={};
  floors.forEach((fd,fi)=>Object.keys(fd).forEach(t=>{typeFloor[t]=FL[fi]||"Etage "+fi;}));
  const surfDispo=parseFloat(terrainSurface)||0;
  const surfBrut=Math.round(summary.totalArea*1.35);
  const pctSurf=surfDispo>0?Math.round(surfBrut/surfDispo*100):0;

  const floorSummary=floors.map((fd,fi)=>{
    const depts=Object.keys(fd);
    if(!depts.length) return null;
    const area=Object.values(fd).reduce((a,d)=>a+d.area,0);
    return `  ${FL[fi]||"Etage "+fi} - ${depts.join(", ")} - ${area.toLocaleString("fr-FR")} m2`;
  }).filter(Boolean).join("\n");

  const deptDesc={
    "HOSPITALISATION":"Les unites d'hospitalisation sont organisees autour de stations de soins centrales. La configuration privilegiee favorise les chambres individuelles pour assurer la confidentialite et le repos du patient. Les circulations propres et souillees sont strictement separees selon les exigences de prevention des infections nosocomiales.",
    "PLATEAU TECHNIQUE":"Le plateau technique regroupe l'ensemble des equipements de diagnostic et d'intervention lourde. Les blocs operatoires sont concus en zones d'acces controle. Les unites de soins intensifs beneficient d'une surveillance continue 24h/24.",
    "AMBULATOIRE":"Le pole ambulatoire constitue la vitrine de l'etablissement. Les consultations sont organisees par specialite pour optimiser les flux et les plannings. Des salles d'attente confortables et eclairees naturellement contribuent a l'humanisation du parcours de soins.",
    "ONCOLOGIE":"Le pole oncologie offre un parcours integre depuis le diagnostic jusqu'au traitement. La radiotherapie et la medecine nucleaire sont implantees au niveau bas pour des raisons de radioprotection.",
    "ADMINISTRATION":"L'administration est positionnee en interface entre l'exterieur et les unites de soins. Le front-office est accessible des l'entree principale.",
    "LOGISTIQUE":"Les locaux logistiques et techniques sont regroupes dans une zone a acces controle. La sterilisation centrale assure le retraitement du materiel chirurgical selon les cycles valides.",
    "PHARMACIE":"La pharmacie a usage interieur centralise toutes les activites pharmaceutiques : dispensation nominative, gestion des dispositifs medicaux steriles et preparation magistrale.",
    "HOSPITALISATION GREFFE":"L'unite de greffe repond aux exigences les plus elevees en maitrise du risque infectieux. Chaque chambre dispose d'un sas de decontamination et d'un traitement d'air HEPA en surpression (ISO 7).",
    "HOSPITALISATION HEMATOLOGIE":"L'unite d'hematologie prend en charge des patients en aplasie medullaire profonde necessitant une protection environnementale stricte. Les chambres sont equipees de sas et d'un traitement d'air HEPA en surpression.",
  };

  const sections=Object.entries(summary.byType).map(([type,data])=>{
    const d=deptDesc[type]||"Departement concu selon les referentiels nationaux et internationaux en vigueur.";
    const etage=typeFloor[type]||"RDC";
    const stats=`${data.beds>0?data.beds+" lits | ":""}${data.rooms} salles | ${data.area.toLocaleString("fr-FR")} m2 | ${etage}`;
    return `${type}\n  ${stats}\n\n  ${d}`;
  }).join("\n\n");

  return `PROGRAMME SPATIAL HOSPITALIER
${(name||"Clinique").toUpperCase()} - ${(city||"Casablanca").toUpperCase()}, MAROC
Emis le ${now}

FICHE SYNTHETIQUE
---------------------------------
Etablissement    ${name||"Clinique"}
Localisation     ${city||"Casablanca"}, Royaume du Maroc
Niveaux          ${numFloors} (${FL.slice(0,numFloors).join(" + ")})
Sous-sols        ${numSousSols}
Parking          ${parking==="oui_ss"?"Oui - sous-sol":parking==="oui_ext"?"Oui - exterieur":"Non prevu"}
${surfDispo>0?`Terrain          ${surfDispo.toLocaleString("fr-FR")} m2  (surface brute ~${surfBrut.toLocaleString("fr-FR")} m2  |  ${pctSurf}% d'occupation)`:""}
Capacite         ${summary.totalBeds} lits
Salles           ${summary.totalRooms} locaux fonctionnels
Surface nette    ${summary.totalArea.toLocaleString("fr-FR")} m2
Surface brute    ${surfBrut.toLocaleString("fr-FR")} m2 (coef. x1.35)
Departements     ${Object.keys(summary.byType).length} poles fonctionnels

ORGANISATION PAR NIVEAU
---------------------------------
${floorSummary}

1. RESUME EXECUTIF
---------------------------------
Le present programme spatial definit l'organisation fonctionnelle et la repartition des surfaces de ${name||"l'etablissement"}, etablissement de sante implante a ${city||"Casablanca"}, Royaume du Maroc.

Avec une capacite de ${summary.totalBeds} lits repartis sur ${numFloors} niveau${numFloors>1?"x":""}, l'etablissement est dimensionne pour repondre aux besoins de sante du bassin de population local. La surface utile totale de ${summary.totalArea.toLocaleString("fr-FR")} m2 est organisee en ${Object.keys(summary.byType).length} poles fonctionnels.

2. DESCRIPTION DES POLES FONCTIONNELS
---------------------------------
${sections}

3. NORMES ET REFERENCES
---------------------------------
- Ministere de la Sante du Maroc - Normes des etablissements de soins
- Health Building Notes (HBN) - NHS England
- Health Technical Memoranda (HTM) - Systemes techniques
- ASHRAE Standard 170 - Ventilation des etablissements de sante
- EN ISO 14644 - Environnements a atmosphere controlee
- Loi n 34-09 relative au systeme de sante du Maroc

Document genere par ClinArchi - ${now}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PROGRAM
// ─────────────────────────────────────────────────────────────────────────────
export default function Program({ goHome }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

 useEffect(() => {
  const onResize = () => setIsMobile(window.innerWidth <= 768);
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
}, []);

useEffect(() => {
  api.getProjects().then(projects => setHistory(projects));
}, []);

  const [activeType,setActiveType]   = useState(ALL_TYPES[0]);
  const [activeTypes,setActiveTypes] = useState([]);
  const [filledData,setFilledData]   = useState({});
  const [name,setName]               = useState("");
  const [city,setCity]               = useState("Casablanca");
  const [numFloors,setNumFloors]     = useState(1);
  const [numSousSols,setNumSousSols] = useState(0);
  const [parking,setParking]         = useState("non");
  const [terrainSurface,setTerrain]  = useState("");
  const [step,setStep]               = useState("input");
  const [results,setResults]         = useState(null);
  const [genStatus,setGenStatus]     = useState("");
  const [progress,setProgress]       = useState(0);
  const [showHistory,setShowHistory] = useState(false);
  const [alertDept,setAlertDept]     = useState(null);
  const [formError,setFormError]     = useState("");
 const [history, setHistory] = useState([]);

  const summary = useMemo(()=>computeSummary(filledData,activeTypes),[filledData,activeTypes]);
  const setField = useCallback((type,uid,key,val)=>{
    setFilledData(p=>({...p,[type]:{...(p[type]||{}),[uid]:{...((p[type]||{})[uid]||{}),[key]:val}}}));
  },[]);

  const deptHasData = type => (UNITS_BY_TYPE[type]||[]).some(unit=>{
    const v=filledData[type]?.[unit.id]||{};
    return unit.fields.some(f=>f.type==="number"?parseInt(v[f.key])>0:!!v[f.key]);
  });

 const toggleType = type => {
  if(activeTypes.includes(type)){
    const hasData = deptHasData(type);
    console.log("toggleType:", type, "hasData:", hasData, "filledData:", filledData[type]);
    if(hasData){ setAlertDept(type); return; }
    setActiveTypes(p=>p.filter(t=>t!==type));
  } else {
    setActiveTypes(p=>[...p,type]);
    setActiveType(type);
  }
};
  const confirmDeactivate = () => {
    if(!alertDept)return;
    setActiveTypes(p=>p.filter(t=>t!==alertDept));
    setFilledData(p=>{const n={...p};delete n[alertDept];return n;});
    setAlertDept(null);
  };

  const meta = TYPE_META[activeType] || { color: "#64748B", light: "#F8FAFC", icon: "🏥" };
  const units = UNITS_BY_TYPE[activeType]||[];
  const typeSummary = summary.byType[activeType]||null;

  const surfDispo=parseFloat(terrainSurface)||0;
  const surfBrut=Math.round(summary.totalArea*1.35);
  const pctSurf=surfDispo>0?Math.round(surfBrut/surfDispo*100):0;
  const surfStatus=surfDispo===0?"none":pctSurf>100?"over":pctSurf>85?"warn":"ok";
  const surfCol=surfStatus==="over"?"#DC2626":surfStatus==="warn"?"#D97706":"#059669";

  const canGenerate = name.trim().length>0 && city.trim().length>0;

  const handleGenerate = async () => {
    setFormError("");
    if(!name.trim()){setFormError("Nom de la clinique obligatoire.");return;}
    if(!city.trim()){setFormError("Ville obligatoire.");return;}

    setStep("generating"); setProgress(0);
    const phases=["Analyse des departements…","Calcul des surfaces…","Organisation par niveaux…","Redaction du rapport…","Finalisation…"];
    let pi=0; setGenStatus(phases[0]);
    const t0=Date.now();
    const iv=setInterval(()=>{
      setProgress(p=>{
        const next=Math.min(p+Math.floor(Math.random()*3)+1,93);
        if(next>=Math.round(((pi+1)/phases.length)*93)&&pi<phases.length-1){pi++;setGenStatus(phases[pi]);}
        return next;
      });
    },130);

   const finish = async report => {
  clearInterval(iv);
  const elapsed = Date.now() - t0;
  if(elapsed < 4500) await new Promise(r => setTimeout(r, 4500 - elapsed));
  setProgress(100);
  setGenStatus("Programme genere !");
  const now = new Date();
  const entry = {
    name, city, numFloors, numSousSols, parking, terrainSurface,
    date: now.toLocaleDateString("fr-FR", {day:"2-digit", month:"2-digit", year:"numeric"}),
    time: now.toLocaleTimeString("fr-FR", {hour:"2-digit", minute:"2-digit"}),
    summary, filledData, activeTypes, report
  };

  // Save silently — don't block results if it fails
  api.saveProject(entry).catch(e => console.error("Save failed:", e));

  setResults(entry);
  setTimeout(() => setStep("results"), 400);
};

 try {
  const d = await api.generateReport({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    messages: [{
      role: "user",
      content: `You are an expert in hospital programming. Write a professional functional report in French for this project. Use ONLY plain ASCII characters.

PROJECT: ${name} - ${city}, Maroc
LEVELS: ${numFloors} (${["RDC","R+1","R+2","R+3","R+4"].slice(0,numFloors).join(", ")})
BASEMENTS: ${numSousSols} | PARKING: ${parking}
CAPACITY: ${summary.totalBeds} beds | ${summary.totalRooms} rooms | ${summary.totalArea} m2
ACTIVE DEPARTMENTS: ${activeTypes.join(", ")}

REQUIRED STRUCTURE:
1. RESUME EXECUTIF
2. ORGANISATION PAR NIVEAU
3. DESCRIPTION DES POLES FONCTIONNELS
4. RECOMMANDATIONS STRATEGIQUES
5. NORMES ET REFERENCES APPLIQUEES`
    }]
  });

  // If API returned an error, use local report instead
  let txt = "";
  if (d && d.content && Array.isArray(d.content)) {
    txt = d.content.map(c => c.text || "").join("");
  }

  await finish(txt.trim() || buildLocalReport(name, city, numFloors, numSousSols, parking, terrainSurface, summary));

} catch(e) {
  console.error("Generate error:", e);
  await finish(buildLocalReport(name, city, numFloors, numSousSols, parking, terrainSurface, summary));
}
  };

  const handleExportFromHistory = (entry, format) => {
    if(format==="excel"){
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js",()=>!!window.XLSX,()=>doExcelExport(entry));
    } else {
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",()=>!!window.jspdf?.jsPDF,()=>doPDFExport(entry));
    }
  };

  // ── GENERATING SCREEN ─────────────────────────────────────────────────────
  if(step==="generating") return(
    <div style={{...S.app,display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}>
      <div style={S.grid}/>
      <div style={{textAlign:"center",maxWidth:400,padding:36,background:"#FFF",borderRadius:20,border:"1px solid #E2E8F0",boxShadow:"0 8px 40px rgba(0,0,0,.1)",position:"relative",zIndex:1}}>
        <div style={{margin:"0 auto 20px",width:60,height:60}}><LogoSVG size={60}/></div>
        <div style={{fontSize:17,fontWeight:800,color:"#0F172A",marginBottom:5}}>Generation du programme</div>
        <div style={{fontSize:12,color:"#64748B",marginBottom:24}}>{name} · {city} · {numFloors} niveau{numFloors>1?"x":""}</div>
        <div style={{background:"#F1F5F9",borderRadius:99,height:5,overflow:"hidden",marginBottom:7}}>
          <div style={{height:"100%",width:`${progress}%`,background:"linear-gradient(90deg,#38bdf8,#1d4ed8)",borderRadius:99,transition:"width .7s ease"}}/>
        </div>
        <div style={{fontSize:12,color:"#0ea5e9",fontWeight:600,marginBottom:10}}>{progress}%</div>
        <div style={{fontSize:12,color:"#94A3B8"}}>{genStatus}</div>
      </div>
    </div>
  );

  // ── RESULTS SCREEN ────────────────────────────────────────────────────────
  if(step==="results") return(
    <div style={S.app}>
      <div style={S.grid}/>
      <header style={S.hdr}><div style={S.hdrIn}>
        <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={goHome}>
          <div style={S.logoBox}><LogoSVG/></div>
          <div><div style={S.logoName}>ClinArchi</div><div style={S.logoSub}>Resultats — {name}</div></div>
        </div>
        <button onClick={goHome} style={{padding:"7px 14px",borderRadius:8,border:"1px solid #E2E8F0",background:"#F8FAFC",color:"#475569",fontSize:12,cursor:"pointer"}}>Retour a l'accueil</button>
      </div></header>
      <div style={{...S.wrap,display:"block",maxWidth:1400}}>
        <ResultsView entry={results} onBack={()=>setStep("input")} goHome={goHome}/>
      </div>
    </div>
  );

  // ── INPUT SCREEN ──────────────────────────────────────────────────────────
  return(
    <div style={S.app}>
      <div style={S.grid}/>
      {alertDept&&<AlertModal deptName={alertDept} onConfirm={confirmDeactivate} onCancel={()=>setAlertDept(null)}/>}
      {showHistory && (
  <HistoryModal
    onClose={() => setShowHistory(false)}
    onExportEntry={handleExportFromHistory}
    history={history}
  />
)}

      <header style={S.hdr}>
        <div style={S.hdrIn}>
          <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={goHome}>
            <div style={S.logoBox}><LogoSVG/></div>
            <div><div style={S.logoName}>ClinArchi</div><div style={S.logoSub}>Programmation Spatiale · {city}</div></div>
          </div>
          <button onClick={goHome} style={{padding:"7px 14px",borderRadius:8,border:"1px solid #E2E8F0",background:"#F8FAFC",color:"#475569",fontSize:12,cursor:"pointer"}}>Accueil</button>
        </div>
      </header>

      <div className="program-page">
        <div className="program-layout">

          {/* ══ SIDEBAR GAUCHE ══ */}
          <div className="program-card">
            <div style={{fontSize:10,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:14}}>Informations du projet</div>

            {/* Nom */}
            <div style={{marginBottom:11,width:"100%",overflow:"hidden"}}>
              <label style={S.lbl}>Nom de la clinique <span style={{color:"#DC2626"}}>*</span></label>
              <input style={{...S.input,borderColor:!name.trim()&&formError?"#DC2626":"#E2E8F0"}} value={name} onChange={e=>setName(e.target.value)} placeholder="ex. Clinique Al Shifa"/>
            </div>

            {/* Ville */}
            <div style={{marginBottom:11,width:"100%",overflow:"hidden"}}>
              <label style={S.lbl}>Ville <span style={{color:"#DC2626"}}>*</span></label>
              <select style={S.select} value={city} onChange={e=>setCity(e.target.value)}>
                {VILLES_MAROC.map(v=><option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            {/* Niveaux */}
            <div style={{marginBottom:11,width:"100%",overflow:"hidden"}}>
              <label style={S.lbl}>Niveaux au-dessus du sol</label>
              <select style={S.select} value={numFloors} onChange={e=>setNumFloors(parseInt(e.target.value))}>
                <option value={1}>RDC uniquement</option>
                <option value={2}>RDC + R+1</option>
                <option value={3}>RDC + R+1 + R+2</option>
                <option value={4}>RDC + R+1 + R+2 + R+3</option>
                <option value={5}>RDC + R+1 + R+2 + R+3 + R+4</option>
              </select>
            </div>

            {/* ✅ SOUS-SOLS — maintenant juste au-dessus du parking */}
            <div style={{marginBottom:11,width:"100%",overflow:"hidden"}}>
              <label style={S.lbl}>Sous-sols</label>
              <select style={S.select} value={numSousSols} onChange={e=>setNumSousSols(parseInt(e.target.value))}>
                <option value={0}>Aucun</option>
                <option value={1}>SS-1</option>
                <option value={2}>SS-1 + SS-2</option>
                <option value={3}>SS-1 + SS-2 + SS-3</option>
              </select>
            </div>

            {/* ✅ PARKING — maintenant juste après sous-sols */}
            <div style={{marginBottom:11}}>
              <label style={S.lbl}>Parking</label>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {[["non","Pas de parking"],["oui_ss","Parking en sous-sol"],["oui_ext","Parking exterieur"]].map(([val,lbl])=>(
                  <label key={val} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,border:`1px solid ${parking===val?"#38bdf855":"#E2E8F0"}`,background:parking===val?"#F0F9FF":"#F8FAFC",cursor:"pointer",fontSize:12,color:parking===val?"#0369A1":"#475569",fontWeight:parking===val?600:400}}>
                    <input type="radio" name="parking" value={val} checked={parking===val} onChange={()=>setParking(val)} style={{accentColor:"#0ea5e9"}}/>
                    {lbl}
                  </label>
                ))}
              </div>
            </div>

            {/* Surface terrain */}
            <div style={{marginBottom:11}}>
              <label style={S.lbl}>Surface terrain (m²) <span style={{fontWeight:400,textTransform:"none",color:"#94A3B8",fontSize:9}}>optionnel</span></label>
              <input style={S.input} type="number" min={0} value={terrainSurface} placeholder="ex. 5000" onChange={e=>setTerrain(e.target.value)}/>
              {surfDispo>0&&summary.totalArea>0&&(
                <div style={{marginTop:6}}>
                  <div style={{height:3,background:"#F1F5F9",borderRadius:99,overflow:"hidden",marginBottom:4}}>
                    <div style={{width:`${Math.min(pctSurf,100)}%`,height:"100%",background:surfCol,borderRadius:99,transition:"width .4s"}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:surfCol,fontWeight:600}}>
                    <span>{pctSurf>100?"Depassement":pctSurf>85?"Attention":"OK"}</span>
                    <span>~{surfBrut.toLocaleString("fr-FR")} m² brut ({pctSurf}%)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Totaux */}
            {(summary.totalBeds>0||summary.totalRooms>0)&&(
              <div style={{background:"linear-gradient(135deg,#F0F9FF,#EFF6FF)",border:"1px solid #BAE6FD",borderRadius:14,padding:18,marginBottom:12}}>
                <div style={{fontSize:10,fontWeight:700,color:"#0369A1",textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Totaux du programme</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {[["Lits",summary.totalBeds,"#1D4ED8"],["Salles",summary.totalRooms,"#5B21B6"],["Surface",`${summary.totalArea.toLocaleString("fr-FR")} m²`,"#065F46"],["Depts",activeTypes.length,"#78350F"]].map(([l,v,c])=>(
                    <div key={l} style={{background:"rgba(255,255,255,0.8)",borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
                      <div style={{fontSize:17,fontWeight:800,color:c}}>{v}</div>
                      <div style={{fontSize:10,color:"#64748B"}}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Départements */}
            <div style={{fontSize:10,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:8,paddingLeft:2}}>
              Departements <span style={{fontWeight:400,textTransform:"none",fontSize:9,color:"#CBD5E1"}}>(cocher pour activer)</span>
            </div>
            {ALL_TYPES.map(type=>{
              const m=TYPE_META[type]||{color:"#64748B",light:"#F1F5F9"};
              const isActive=activeTypes.includes(type);
              const hasFill=deptHasData(type);
              const isSelected=activeType===type&&isActive;
              const sm=summary.byType[type];
              return(
                <div key={type} style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
                  <div onClick={()=>toggleType(type)} style={{width:17,height:17,borderRadius:4,flexShrink:0,border:`2px solid ${isActive?(hasFill?"#059669":m.color):"#CBD5E1"}`,background:isActive?(hasFill?"#059669":m.color):"#FFF",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .15s"}}>
                    {isActive&&<span style={{color:"#FFF",fontSize:9,fontWeight:900}}>✓</span>}
                  </div>
                  <button disabled={!isActive} onClick={()=>isActive&&setActiveType(type)} style={{flex:1,textAlign:"left",background:isSelected?m.light:(hasFill?"#F0FDF4":"#FFF"),border:`1px solid ${isSelected?m.color+"55":(hasFill?"#BBF7D0":"#E2E8F0")}`,borderLeft:`3px solid ${isSelected?m.color:(hasFill?"#059669":"#E2E8F0")}`,borderRadius:8,padding:"8px 11px",cursor:isActive?"pointer":"default",display:"flex",alignItems:"center",gap:8,opacity:isActive?1:0.38,transition:"all .15s"}}>
                    <span style={{fontSize:11,fontWeight:600,color:isSelected?m.color:(hasFill?"#059669":"#475569"),flex:1,lineHeight:1.3}}>{type}</span>
                    {sm&&<div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:1}}>
                      {sm.beds>0&&<span style={{background:m.light,color:m.color,borderRadius:99,padding:"1px 6px",fontSize:9,fontWeight:700}}>{sm.beds} lits</span>}
                      <span style={{background:"#F1F5F9",color:"#475569",borderRadius:99,padding:"1px 6px",fontSize:9,fontWeight:600}}>{sm.rooms} salles</span>
                    </div>}
                  </button>
                </div>
              );
            })}

            {/* Boutons */}
            <button style={{...S.genBtn,opacity:canGenerate?1:0.5}} disabled={!canGenerate} onClick={handleGenerate}>
              Generer le Programme
            </button>
            <button onClick={()=>setShowHistory(true)} style={{width:"100%",padding:"9px 0",borderRadius:10,border:"1px solid #E2E8F0",background:"#F8FAFC",color:"#475569",fontSize:12,fontWeight:600,cursor:"pointer",marginTop:7,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
             Historique ({history.length})
            </button>
            {formError&&<div style={{fontSize:11,color:"#DC2626",textAlign:"center",marginTop:8,fontWeight:600}}>{formError}</div>}
            {!canGenerate&&!formError&&<div style={{fontSize:11,color:"#94A3B8",textAlign:"center",marginTop:8}}>Nom et ville sont obligatoires</div>}
          </div>

          {/* ══ ZONE PRINCIPALE DROITE ══ */}
          <div style={S.main}>
            {/* ✅ EMPTY STATE — maintenant dans la zone droite */}
            {activeTypes.length===0 ? (
              <div style={{...S.card,textAlign:"center",padding:"56px 40px",border:"2px dashed #E2E8F0"}}>
                <div style={{fontSize:44,marginBottom:14}}>🏥</div>
                <div style={{fontSize:17,fontWeight:700,color:"#0F172A",marginBottom:8}}>
                  Activez vos departements
                </div>
                <div style={{fontSize:13,color:"#64748B",lineHeight:1.7}}>
                  Cochez les cases a gauche pour activer les departements
                  <br/>
                  que vous souhaitez inclure dans votre programme spatial.
                </div>
              </div>
            ) : (
              <>
                {/* Header du département actif */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px",background:`linear-gradient(135deg,${meta.light},#FFF)`,border:`1px solid ${meta.color}28`,borderRadius:13,marginBottom:18,flexWrap:"wrap",gap:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:11}}>
                    <div style={{width:40,height:40,borderRadius:10,background:meta.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#FFF",boxShadow:`0 3px 12px ${meta.color}40`}}>
                      {meta.icon || "+"}
                    </div>
                    <div>
                      <div style={{fontSize:15,fontWeight:800,color:"#0F172A"}}>{activeType}</div>
                      <div style={{fontSize:11,color:"#64748B",marginTop:2}}>{units.length} unite{units.length!==1?"s":""}</div>
                    </div>
                  </div>
                  {typeSummary&&(
                    <div style={{display:"flex",gap:7}}>
                      {[
                        typeSummary.beds>0 && [`${typeSummary.beds} lit${typeSummary.beds>1?"s":""}`, meta.color],
                        [`${typeSummary.rooms} salle${typeSummary.rooms>1?"s":""}`, "#475569"],
                        [`${typeSummary.area.toLocaleString("fr-FR")} m²`, meta.color]
                      ].filter(Boolean).map(([v,c])=>(
                        <div key={v} style={{background:"#FFF",border:`1px solid ${c}22`,borderRadius:9,padding:"7px 13px",textAlign:"center",boxShadow:"0 1px 4px rgba(0,0,0,.05)"}}>
                          <div style={{fontSize:15,fontWeight:800,color:c}}>{v}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Unités fonctionnelles */}
                {units.map(unit=>(
                  <UnitCard
                    key={unit.id}
                    unit={unit}
                    accent={meta.color}
                    light={meta.light}
                    values={filledData[activeType]?.[unit.id]||{}}
                    onChange={(k,v)=>setField(activeType,unit.id,k,v)}
                  />
                ))}
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}