(function(){
  'use strict';
  var KEY='enkiama.journey.draft';
  var LEGACY_KEY='enkiama.composition';

  function safeParse(value){try{return value?JSON.parse(value):null;}catch(e){return null;}}
  function normalize(input){
    if(!input||typeof input!=='object')return null;
    var prefs=input.preferences&&typeof input.preferences==='object'?input.preferences:{};
    var labels=input.labels&&typeof input.labels==='object'?input.labels:{};
    var route=Array.isArray(input.route)?input.route.filter(Boolean).map(String):[];
    if(!route.length)return null;
    return {
      schema:'enkiama.journey.draft.v1',
      version:1,
      updated_at:new Date().toISOString(),
      source:input.source||'compose',
      preferences:{
        pull:prefs.pull||null,time:prefs.time||null,season:prefs.season||null,
        pace:prefs.pace||null,coast:prefs.coast||null,who:prefs.who||null
      },
      labels:{
        pull:labels.pull||null,time:labels.time||null,season:labels.season||null,
        pace:labels.pace||null,coast:labels.coast||null,who:labels.who||null
      },
      route:route,
      message:input.message||'',
      example_slug:input.example_slug||null
    };
  }
  function write(input){
    var draft=normalize(input);
    if(!draft)return null;
    try{
      sessionStorage.setItem(KEY,JSON.stringify(draft));
      sessionStorage.setItem(LEGACY_KEY,JSON.stringify(draft));
    }catch(e){}
    return draft;
  }
  function read(){
    var draft=safeParse(sessionStorage.getItem(KEY));
    if(draft&&draft.schema==='enkiama.journey.draft.v1')return normalize(draft);
    var legacy=safeParse(sessionStorage.getItem(LEGACY_KEY));
    if(legacy&&Array.isArray(legacy.route))return write(legacy);
    return null;
  }
  function clear(){
    try{sessionStorage.removeItem(KEY);sessionStorage.removeItem(LEGACY_KEY);}catch(e){}
  }
  function summary(draft){
    draft=draft||read();
    if(!draft)return '';
    var lines=['JOURNEY_DRAFT_V1'];
    if(draft.route.length)lines.push('Route: '+draft.route.join(' → '));
    var meta=[
      draft.labels.pull,draft.labels.time,draft.labels.season,
      draft.labels.pace,draft.labels.coast,draft.labels.who
    ].filter(Boolean);
    if(meta.length)lines.push('Preferences: '+meta.join('; '));
    if(draft.message)lines.push('Traveller note: '+draft.message);
    return lines.join('\n');
  }

  window.EnkiamaJourneyDraft={read:read,write:write,clear:clear,summary:summary,normalize:normalize};
})();