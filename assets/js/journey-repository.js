/* Enkiama public journey content repository.
   Static JSON today; Supabase RPC can replace it without changing the UI. */
(function(){
  var STATIC_URL='data/journeys.json';
  var MEDIA_URL='data/journey-media.json';
  var cache=null;

  function normalizeMedia(journey,mediaSpec){
    mediaSpec=mediaSpec||{};
    journey.hero_media=mediaSpec.hero||{
      primary:{
        src:journey.hero_image||'assets/images/hero-dawn.webp',
        alt:journey.title||'Tanzania journey',
        focal_point:'50% 50%',
        caption:'',
        source_type:'legacy'
      }
    };
    (journey.chapters||[]).forEach(function(ch,i){
      var spec=(mediaSpec.chapters||[])[i]||{};
      ch.layout=spec.layout||ch.layout||'split';
      ch.media={
        primary:spec.primary||{
          src:ch.image||journey.hero_media.primary.src,
          alt:ch.title||ch.place||journey.title,
          focal_point:'50% 50%',
          caption:'',
          source_type:'legacy'
        }
      };
      if(spec.secondary) ch.media.secondary=spec.secondary;
    });
    return journey;
  }

  function mergeMedia(catalog,manifest){
    var map=(manifest&&manifest.journeys)||{};
    (catalog.journeys||[]).forEach(function(j){normalizeMedia(j,map[j.slug]);});
    catalog.media_version=(manifest&&manifest.version)||0;
    return catalog;
  }

  function staticLoad(){
    if(cache) return Promise.resolve(cache);
    return Promise.all([
      fetch(STATIC_URL,{headers:{'Accept':'application/json'}}).then(function(r){if(!r.ok) throw new Error('Journey catalog '+r.status); return r.json();}),
      fetch(MEDIA_URL,{headers:{'Accept':'application/json'}}).then(function(r){return r.ok?r.json():{version:0,journeys:{}};}).catch(function(){return {version:0,journeys:{}};})
    ]).then(function(parts){cache=mergeMedia(parts[0],parts[1]);return cache;});
  }

  function supabaseLoad(){
    if(!window.Enkiama || !window.Enkiama.rpc || window.ENKIAMA_USE_SUPABASE_JOURNEYS!==true) return Promise.reject(new Error('Supabase journey source disabled'));
    return window.Enkiama.rpc('get_public_journey_catalog',{}).then(function(data){
      if(!data) throw new Error('Empty journey catalog');
      var normalized=Array.isArray(data)?{version:1,journeys:data}:data;
      (normalized.journeys||[]).forEach(function(j){normalizeMedia(j,j.media_manifest||null);});
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