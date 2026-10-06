/* Enkiama public journey content repository.
   Static JSON today; Supabase RPC can replace it without changing the UI. */
(function(){
  var STATIC_URL='data/journeys.json';
  var cache=null;

  function staticLoad(){
    if(cache) return Promise.resolve(cache);
    return fetch(STATIC_URL,{headers:{'Accept':'application/json'}})
      .then(function(r){if(!r.ok) throw new Error('Journey catalog '+r.status); return r.json();})
      .then(function(data){cache=data; return data;});
  }

  function supabaseLoad(){
    if(!window.Enkiama || !window.Enkiama.rpc || window.ENKIAMA_USE_SUPABASE_JOURNEYS!==true) return Promise.reject(new Error('Supabase journey source disabled'));
    return window.Enkiama.rpc('get_public_journey_catalog',{}).then(function(data){
      if(!data) throw new Error('Empty journey catalog');
      var normalized=Array.isArray(data)?{version:1,journeys:data}:data;
      cache=normalized;
      return normalized;
    });
  }

  function loadCatalog(){
    if(cache) return Promise.resolve(cache);
    if(window.ENKIAMA_USE_SUPABASE_JOURNEYS===true){
      return supabaseLoad().catch(function(err){
        if(window.console&&console.warn) console.warn('Enkiama journeys: Supabase unavailable, using static catalog',err);
        return staticLoad();
      });
    }
    return staticLoad();
  }

  function getBySlug(slug){
    return loadCatalog().then(function(cat){
      return (cat.journeys||[]).find(function(j){return j.slug===slug;})||null;
    });
  }

  function scoreJourney(j,p){
    var m=j.match_profile||{},score=0,reasons=[];
    function hit(key,weight){
      var v=p&&p[key];
      if(!v) return;
      var allowed=m[key]||[];
      if(allowed.indexOf(v)>-1){score+=weight;reasons.push(key);}
    }
    hit('pull',4);hit('coast',4);hit('who',3);hit('pace',2);hit('time',2);hit('season',1);
    if(j.featured)score+=0.25;
    return {journey:j,score:score,reasons:reasons};
  }

  function recommend(preferences){
    return loadCatalog().then(function(cat){
      var ranked=(cat.journeys||[]).map(function(j){return scoreJourney(j,preferences||{});})
        .sort(function(a,b){return b.score-a.score;});
      return ranked[0]||null;
    });
  }

  function related(slug,limit){
    return loadCatalog().then(function(cat){
      return (cat.journeys||[]).filter(function(j){return j.slug!==slug;}).slice(0,limit||2);
    });
  }

  function recordComposition(payload){
    if(window.ENKIAMA_CAPTURE_COMPOSITIONS!==true || !window.Enkiama || !window.Enkiama.rpc){
      return Promise.resolve({stored:false,mode:'local-only'});
    }
    return window.Enkiama.rpc('record_public_composition',{p_payload:payload||{}})
      .then(function(id){return {stored:true,id:id};})
      .catch(function(err){
        if(window.console&&console.warn) console.warn('Enkiama journeys: composition not stored',err);
        return {stored:false,error:true};
      });
  }

  window.EnkiamaJourneys={
    loadCatalog:loadCatalog,
    getBySlug:getBySlug,
    recommend:recommend,
    related:related,
    recordComposition:recordComposition
  };
})();