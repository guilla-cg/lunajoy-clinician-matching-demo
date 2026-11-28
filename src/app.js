import React, { createElement as h, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const STATES = [['CA','California'],['NY','New York'],['TX','Texas'],['FL','Florida'],['WA','Washington'],['CO','Colorado'],['AZ','Arizona']];
const LANGUAGES = ['English','Spanish','Mandarin','Hindi'];
const INSURANCES = ['Aetna','Blue Cross Blue Shield','Cigna','UnitedHealthcare'];
const NEEDS = [['anxiety','Anxiety'],['depression','Depression'],['trauma','Trauma & PTSD'],['perinatal','Pregnancy & postpartum'],['couples','Relationships']];

function SelectField({ label, value, onChange, options, hint }) {
  return h('div', { className:'field' },
    h('label', null, label),
    h('select', { value, onChange:e=>onChange(e.target.value) }, options.map(([key,name])=>h('option',{value:key,key},name))),
    hint ? h('span',{className:'field-hint'},hint) : null
  );
}

function Toggle({ value, onChange, items }) {
  return h('div',{className:'segmented',role:'group'},items.map(([key,label])=>h('button',{type:'button',key,className:value===key?'active':'',onClick:()=>onChange(key)},label)));
}

function CheckGroup({ values, onChange, items, legend }) {
  const toggle = (value) => onChange(values.includes(value) ? values.filter(v=>v!==value) : [...values,value]);
  return h('fieldset',{className:'field',style:{border:0,padding:0,margin:'0 0 16px'}},
    h('legend',{className:'legend'},legend),
    h('div',{className:'check-row'},items.map(([value,label])=>h('label',{className:'check-chip',key:value},h('input',{type:'checkbox',checked:values.includes(value),onChange:()=>toggle(value)}),h('span',null,label))))
  );
}

function initials(name){ return name.replace('Dr. ','').split(' ').slice(0,2).map(part=>part[0]).join('').toUpperCase(); }

function ClinicianCard({ match, index }) {
  const [expanded,setExpanded]=useState(false);
  const nameParts=match.fullName.split(' ');
  return h('article',{className:'clinician-card'},
    h('div',{className:'card-top'},
      h('div',{className:'person'},h('div',{className:`avatar a${index%3}`},initials(match.fullName)),h('div',null,h('h3',null,match.fullName),h('p',null,match.credentials))),
      h('div',{className:'score'},h('strong',null,`${match.score}%`),h('span',null,'preference fit'))
    ),
    h('div',{className:'bar','aria-label':`${match.score}% preference fit`},h('span',{style:{width:`${match.score}%`}})),
    h('div',{className:'badges'},(match.specialties.length ? match.specialties.slice(0,3).map(v=>v.split('-').map(x=>x[0].toUpperCase()+x.slice(1)).join(' ')) : ['Medication management']).map(v=>h('span',{className:'badge',key:v},v))),
    h('div',{className:'availability'},h('span',{className:'dot'}),`${match.nextAvailability.day} · ${match.nextAvailability.time}`),
    h('div',{className:'reasons'},match.explanation.map((reason,i)=>h('span',{className:'reason',key:i},reason))),
    h('div',{className:'card-foot'},h('span',{className:'overlap'},match.overlappingAttributes.join(' · ')||'Available in your state'),h('button',{className:'profile-button',onClick:()=>setExpanded(!expanded),'aria-expanded':expanded},expanded?'Hide details':'Why this match?')),
    expanded?h('p',{className:'disclaimer',style:{margin:'9px 0 0'}},`${nameParts[0]} is licensed in your state and offers ${match.appointmentTypes.join(' and ')}. This demo ranks preferences; it does not assess clinical suitability.`):null
  );
}

function App(){
  const [appointmentType,setAppointmentType]=useState('therapy');
  const [state,setState]=useState('CA');
  const [language,setLanguage]=useState('English');
  const [insuranceProvider,setInsurance]=useState('Aetna');
  const [genderPreference,setGender]=useState('');
  const [clinicalNeeds,setNeeds]=useState(['anxiety']);
  const [preferredTimeSlots,setTimes]=useState(['evening']);
  const [urgency,setUrgency]=useState('flexible');
  const [results,setResults]=useState(null);
  const [message,setMessage]=useState(null);
  const [loading,setLoading]=useState(false);

  async function submit(e){
    e.preventDefault();setLoading(true);setMessage(null);
    const patient={state,language,gender_preference:genderPreference,insurance_provider:insuranceProvider,appointment_type:appointmentType,clinical_needs:appointmentType==='therapy'?clinicalNeeds:[],preferred_time_slots:preferredTimeSlots,urgency_level:urgency};
    try{
      const response=await fetch('/match',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(patient)});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||'Something went wrong. Please try again.');
      setResults(data.results);setMessage(data.message);
    }catch(err){setResults(null);setMessage('The matching service is unavailable right now. Please try again in a moment.');}
    finally{setLoading(false);document.getElementById('results-title')?.scrollIntoView({behavior:'smooth',block:'nearest'});}
  }

  return h('div',{className:'shell'},
    h('header',{className:'topbar'},h('div',{className:'brand'},h('span',{className:'brandmark','aria-hidden':true},'l'),h('span',null,'LunaJoy')),h('div',{className:'top-meta'},h('span',{className:'demo-pill'},'Product demo'),h('span',{className:'secure'},'✳  Your care, thoughtfully matched'))),
    h('section',{className:'hero'},h('div',null,h('div',{className:'eyebrow'},'A more personal way to find care'),h('h1',null,'Find a clinician who fits your life.'),h('p',null,'Tell us what matters to you. We’ll help you explore licensed clinicians whose availability, coverage and experience align with your preferences.')),h('div',{className:'hero-note'},h('span',{className:'sparkle'},'✳'),h('span',null,'A few details · Better-fit options'))),
    h('main',{className:'main'},
      h('section',{className:'panel form-panel','aria-labelledby':'intake-title'},
        h('div',{className:'panel-heading'},h('div',null,h('h2',{id:'intake-title'},'Your care preferences'),h('p',null,'Start with what matters most to you.')),h('span',{className:'step'},'01 / 01')),
        h('form',{onSubmit:submit},
          h('div',{className:'field'},h('span',{className:'legend'},'What kind of care are you looking for?'),h(Toggle,{value:appointmentType,onChange:setAppointmentType,items:[['therapy','Therapy'],['medication','Medication']]})),
          h(SelectField,{label:'Where do you live?',value:state,onChange:setState,options:STATES.map(([key,name])=>[key,name])}),
          h(SelectField,{label:'Preferred language',value:language,onChange:setLanguage,options:LANGUAGES.map(x=>[x,x])}),
          h(SelectField,{label:'Insurance provider',value:insuranceProvider,onChange:setInsurance,options:INSURANCES.map(x=>[x,x]),hint:'We’ll prioritize clinicians who accept your plan.'}),
          appointmentType==='therapy'?h(CheckGroup,{legend:'What would you like support with?',values:clinicalNeeds,onChange:setNeeds,items:NEEDS}):null,
          h('div',{className:'field'},h('span',{className:'legend'},'Clinician gender preference'),h(Toggle,{value:genderPreference,onChange:setGender,items:[['','No preference'],['female','Female'],['male','Male'],['nonbinary','Nonbinary']]})),
          h(CheckGroup,{legend:'When would you prefer to meet?',values:preferredTimeSlots,onChange:setTimes,items:[['morning','Morning'],['evening','Evening']]}),
          h('div',{className:'field'},h('span',{className:'legend'},'How soon would you like to start?'),h(Toggle,{value:urgency,onChange:setUrgency,items:[['immediate','As soon as possible'],['flexible','I’m flexible']]})),
          h('div',{className:'divider'}),
          h('button',{className:'submit',type:'submit',disabled:loading},loading?'Finding your matches…':h(React.Fragment,null,'See my matches',h('span',{className:'arrow'},'→'))),
          h('p',{className:'privacy'},'This demo uses sample clinician profiles. No personal health details are needed.')
        )
      ),
      h('section',{className:'panel results-panel','aria-labelledby':'results-title'},
        h('div',{className:'results-head'},h('div',null,h('h2',{id:'results-title'},'Clinicians for you'),h('p',null,results?`${results.length} licensed option${results.length===1?'':'s'} to explore`:'Your tailored options will show up here.')),h('span',{className:'sort-note'},'BEST FIT FIRST')),
        !results&&!loading&&!message?h('div',{className:'empty-state'},h('div',null,h('div',{className:'empty-art','aria-hidden':true},'☼'),h('h3',null,'Your next step starts here'),h('p',null,'Share a few preferences and we’ll surface clinicians who can meet you where you are.'))):null,
        message&&!results?h('div',{className:'no-results'},h('h3',null,'We couldn’t load matches'),h('p',null,message)):null,
        loading?h('div',{className:'empty-state loading'},h('div',null,h('div',{className:'empty-art','aria-hidden':true},'✳'),h('h3',null,'Finding the right fit'),h('p',null,'Looking across availability, coverage and your preferences…'))):null,
        results?.length?h('div',{className:'match-list'},results.map((match,index)=>h(ClinicianCard,{match,index,key:match.id}))):null,
        results&&!results.length?h('div',{className:'no-results'},h('h3',null,'Let’s find another way forward'),h('p',null,message||'No clinician met the state and appointment requirements. Try adjusting a preference, or reach out to care navigation for help.')):null,
        results?.length?h('p',{className:'disclaimer'},'Scores summarize how closely sample profiles align with your preferences. They are not a clinical assessment or a recommendation about treatment.'):null,
        message&&results?.length===0?null:null
      )
    ),
    h('footer',{className:'footnote'},'LunaJoy · Care that sees the whole you · Demonstration experience')
  );
}

createRoot(document.getElementById('root')).render(h(App));
