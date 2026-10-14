(function(){
  var catalogue=null;
  var nav=document.getElementById('kmRouteNav');
  var panel=document.getElementById('kmRoutePanel');
  var result=document.getElementById('kmResult');
  var answers={};
  var requestedRoute=new URLSearchParams(location.search).get('route');

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(ch){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch];});}
  function find(slug){return catalogue&&catalogue.routes.find(function(r){return r.slug===slug;});}
  function routeShape(r){
    var trace=(r.stage_trace&&r.stage_trace.length?r.stage_trace:r.stages.map(function(label){return {label:label,phase:'stage'};}));
    if(trace.length<=7)return trace;
    var chosen=[];
    function add(stage){if(stage&&!chosen.includes(stage))chosen.push(stage);}
    add(trace[0]);
    add(trace.find(function(s){return s.phase==='high-point';}));
    var camps=trace.filter(function(s){return s.phase==='camp';});
    add(camps[Math.floor((camps.length-1)/2)]);
    add(trace.find(function(s){return s.phase==='summit-camp';}));
    add(trace.find(function(s){return s.phase==='summit';}));
    add(trace.find(function(s){return s.phase==='descent';}));
    add(trace[trace.length-1]);
    return chosen.filter(Boolean);
  }

  function renderRoute(r){
    if(!r||!panel)return;
    document.querySelectorAll('.km-route').forEach(function(b){b.classList.toggle('active',b.dataset.slug===r.slug);});
    var shape=routeShape(r);
    panel.innerHTML=
      '<div class="km-route__identity">'+
        '<span class="km-route__tag">'+esc(r.badge)+'</span>'+
        '<h3>'+esc(r.name)+'</h3>'+
        '<p class="km-route__summary">'+esc(r.summary)+'</p>'+
        '<p class="km-route__dossier-link"><a href="kilimanjaro-route.html?route='+encodeURIComponent(r.slug)+'">Open full '+esc(r.name)+' dossier →</a></p>'+
      '</div>'+
      '<div class="km-route__detail">'+
        '<div class="km-route__stats">'+
          '<div class="km-route__stat"><span>Recommended</span><strong>'+esc(r.recommended_days)+' days</strong></div>'+
          '<div class="km-route__stat"><span>Approach</span><strong>'+esc(r.approach)+'</strong></div>'+
          '<div class="km-route__stat"><span>Acclimatisation</span><strong>'+esc(r.acclimatisation)+'</strong></div>'+
          '<div class="km-route__stat"><span>Overnight</span><strong>'+esc(r.overnight)+'</strong></div>'+
        '</div>'+
        '<div class="km-route__why">'+
          '<div><h4>Why Enkiama would choose it</h4><p>'+esc(r.why_enkiama)+'</p></div>'+
          '<div><h4>Trade-off</h4><p>'+esc(r.caution)+'</p></div>'+
        '</div>'+
        '<div class="km-route__shape"><p class="km-route__stages-label">Mountain shape</p><div class="km-route__shape-grid">'+
          ['opening','traverse','convergence','summit','descent'].map(function(key){
            var part=r.mountain_shape&&r.mountain_shape[key];
            return part?'<div class="km-route__shape-part" data-shape="'+esc(key)+'"><span>'+esc(key)+'</span><strong>'+esc(part.label)+'</strong></div>':'';
          }).join('')+
        '</div></div>'+
        '<div class="km-route__stages"><p class="km-route__stages-label">Route shape · selected milestones</p><div class="km-route__line" style="--km-trace-count:'+shape.length+'">'+shape.map(function(s){return '<span data-phase="'+esc(s.phase||'stage')+'">'+esc(s.label)+'</span>';}).join('')+'</div><p class="km-route__trace-note">The full day-by-day sequence remains in the route dossier.</p></div>'+
        '<div class="km-route__compare">'+
          '<p class="km-route__stages-label">Compare next</p>'+
          '<div class="km-route__compare-links">'+(r.comparison_peers||[]).map(function(peer){var p=find(peer.slug);return p?'<a href="kilimanjaro-route.html?route='+encodeURIComponent(p.slug)+'">'+esc(p.name)+'</a>':'';}).join('')+'</div>'+
        '</div>'+
      '</div>';
  }
  function renderNav(){
    var primary=catalogue.routes.filter(function(r){return ['preferred','recommended'].includes(r.stance);});
    var specific=catalogue.routes.filter(function(r){return !['preferred','recommended'].includes(r.stance);});
    function button(r){
      return '<button class="km-route" data-slug="'+esc(r.slug)+'"><span class="km-route__name">'+esc(r.name)+'</span><span class="km-route__days">'+esc(r.recommended_days)+' days</span><span class="km-route__meta">'+esc(r.badge)+'</span></button>';
    }
    nav.innerHTML=
      '<div class="km-route-group km-route-group--primary"><div class="km-route-group__head"><span>Start comparison here</span><small>Preferred / recommended</small></div><div class="km-route-group__list">'+primary.map(button).join('')+'</div></div>'+
      '<div class="km-route-group km-route-group--specific"><div class="km-route-group__head"><span>Specific-fit routes</span><small>Different reasons to choose</small></div><div class="km-route-group__list">'+specific.map(button).join('')+'</div></div>';
    nav.querySelectorAll('.km-route').forEach(function(b){b.addEventListener('click',function(){
      var selected=find(b.dataset.slug);
      renderRoute(selected);
      if(selected){
        try{sessionStorage.setItem('enkiama.kilimanjaro.route',selected.slug);}catch(e){}
        var url=new URL(location.href);
        url.searchParams.set('route',selected.slug);
        history.replaceState(null,'',url.pathname+url.search+url.hash);
      }
    });});
    var initial=find(requestedRoute);
    if(!initial){
      try{initial=find(sessionStorage.getItem('enkiama.kilimanjaro.route'));}catch(e){}
    }
    renderRoute(initial||find('lemosho'));
  }

  function score(r){
    var s=0;
    var days=Number(answers.days||0);
    if(days){
      if(r.recommended_days===days)s+=6;
      else if(Math.abs(r.recommended_days-days)===1)s+=2;
      else s-=3;
    }
    if(answers.priority==='acclimatisation'){
      if(r.slug==='northern-circuit')s+=7;if(r.slug==='lemosho')s+=6;if(r.slug==='machame')s+=3;if(r.slug==='umbwe'||r.slug==='shira')s-=4;
    }
    if(answers.priority==='scenery'){
      if(r.slug==='lemosho')s+=7;if(r.slug==='northern-circuit')s+=6;if(r.slug==='machame')s+=5;
    }
    if(answers.priority==='quiet'){
      if(r.slug==='northern-circuit')s+=8;if(r.slug==='rongai')s+=6;if(r.slug==='lemosho')s+=3;if(r.slug==='machame'||r.slug==='marangu')s-=3;
    }
    if(answers.priority==='classic'){
      if(r.slug==='machame')s+=8;if(r.slug==='lemosho')s+=4;if(r.slug==='marangu')s+=2;
    }
    if(answers.camp==='huts'){ if(r.slug==='marangu')s+=12; else s-=4; }
    if(answers.camp==='camping' && r.slug==='marangu')s-=5;
    if(answers.experience==='first'){
      if(['lemosho','northern-circuit','machame','rongai'].includes(r.slug))s+=3;
      if(['shira','umbwe'].includes(r.slug))s-=8;
    }
    if(answers.experience==='experienced'){
      if(['northern-circuit','shira','umbwe'].includes(r.slug))s+=2;
    }
    if(r.stance==='preferred')s+=2;
    if(r.stance==='recommended')s+=1;
    if(r.stance==='specialist' && answers.experience!=='experienced')s-=8;
    return s;
  }
  function labelFor(key,value){
    var labels={
      days:{'7':'7 mountain days','8':'8 mountain days','9':'9+ mountain days'},
      priority:{acclimatisation:'Acclimatisation',scenery:'Scenery',quiet:'Quieter trail',classic:'Classic route'},
      experience:{first:'First high-altitude trek',some:'Some high-altitude experience',experienced:'Experienced at altitude'},
      camp:{camping:'Camping',huts:'Prefer huts',either:'Either overnight format'}
    };
    return labels[key]&&labels[key][value]?labels[key][value]:value;
  }
  function persistDirection(top,alt,reasons){
    var state={
      version:1,
      type:'kilimanjaro_route_direction',
      created_at:new Date().toISOString(),
      answers:{
        days:answers.days,
        priority:answers.priority,
        experience:answers.experience,
        camp:answers.camp
      },
      labels:{
        days:labelFor('days',answers.days),
        priority:labelFor('priority',answers.priority),
        experience:labelFor('experience',answers.experience),
        camp:labelFor('camp',answers.camp)
      },
      recommended:{
        slug:top.slug,
        name:top.name,
        days:top.recommended_days,
        stance:top.stance,
        fit:top.fit,
        caution:top.caution
      },
      alternative:{
        slug:alt.slug,
        name:alt.name,
        days:alt.recommended_days,
        stance:alt.stance
      },
      reasons:reasons.slice(),
      medical_boundary:'Route direction only; not a fitness assessment or medical clearance.'
    };
    try{sessionStorage.setItem('enkiama.kilimanjaro.direction',JSON.stringify(state));}catch(e){}
    return state;
  }
  function updateResult(){
    if(!catalogue||Object.keys(answers).length<4)return;
    var ranked=catalogue.routes.map(function(r){return {r:r,s:score(r)};}).sort(function(a,b){return b.s-a.s;});
    var top=ranked[0].r,alt=ranked[1].r;
    var reasons=[];
    if(Number(answers.days)===top.recommended_days)reasons.push('your available mountain days match its preferred pacing');
    if(answers.priority==='acclimatisation')reasons.push('you prioritised acclimatisation');
    if(answers.priority==='quiet')reasons.push('you asked for a quieter trail');
    if(answers.priority==='scenery')reasons.push('you prioritised scenery');
    if(answers.priority==='classic')reasons.push('you asked for a classic route');
    if(answers.camp==='huts'&&top.slug==='marangu')reasons.push('you prefer huts rather than camping');
    if(answers.experience==='first'&&['lemosho','northern-circuit','machame','rongai'].includes(top.slug))reasons.push('its profile is more suitable for a first high-altitude trek than our specialist lines');
    if(!reasons.length)reasons.push('it gives the strongest overall match across your answers');
    persistDirection(top,alt,reasons);

    result.innerHTML=
      '<span class="km-eye">First direction</span>'+
      '<div class="km-result__decision">'+
        '<div class="km-result__route">'+
          '<h3>'+esc(top.recommended_days)+'-day '+esc(top.name)+'</h3>'+
          '<p>'+esc(top.fit)+'</p>'+
        '</div>'+
        '<div class="km-result__facts">'+
          '<div><span>Mountain time</span><strong>'+esc(labelFor('days',answers.days))+'</strong></div>'+
          '<div><span>Priority</span><strong>'+esc(labelFor('priority',answers.priority))+'</strong></div>'+
          '<div><span>Altitude experience</span><strong>'+esc(labelFor('experience',answers.experience))+'</strong></div>'+
          '<div><span>Overnight</span><strong>'+esc(labelFor('camp',answers.camp))+'</strong></div>'+
        '</div>'+
      '</div>'+
      '<div class="km-result__reason">'+
        '<p><strong>Why this direction:</strong> '+esc(reasons.join('; '))+'.</p>'+
        '<p><strong>Trade-off:</strong> '+esc(top.caution)+'</p>'+
        '<p><strong>Compare with '+esc(alt.name)+':</strong> '+esc(alt.fit)+'</p>'+
      '</div>'+
      '<div class="km-result__actions">'+
        '<a class="km-result__continue" href="begin.html?kilimanjaro=direction">Continue this mountain conversation →</a>'+
        '<a class="km-result__secondary" href="kilimanjaro-route.html?route='+encodeURIComponent(top.slug)+'">Full '+esc(top.name)+' dossier →</a>'+
        '<a class="km-result__secondary" href="#routes" id="kmSeeRoute">Compare in atlas →</a>'+
      '</div>'+
      '<p class="km-result__boundary">Route direction only. Season and party format are intentionally not scored here yet, and this is not a fitness assessment or medical clearance.</p>';
    var a=document.getElementById('kmSeeRoute');if(a)a.addEventListener('click',function(){
      renderRoute(top);
      try{sessionStorage.setItem('enkiama.kilimanjaro.route',top.slug);}catch(e){}
      var url=new URL(location.href);
      url.searchParams.set('route',top.slug);
      history.replaceState(null,'',url.pathname+url.search+'#routes');
    });
  }

  document.querySelectorAll('[data-route-focus]').forEach(function(button){
    button.addEventListener('click',function(){
      var route=find(button.dataset.routeFocus);
      if(!route)return;
      renderRoute(route);
      try{sessionStorage.setItem('enkiama.kilimanjaro.route',route.slug);}catch(e){}
      var url=new URL(location.href);
      url.searchParams.set('route',route.slug);
      history.replaceState(null,'',url.pathname+url.search+'#routes');
      var panel=document.getElementById('kmRoutePanel');
      if(panel)panel.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    });
  });

  document.querySelectorAll('.km-question').forEach(function(q){
    var key=q.dataset.key;
    q.querySelectorAll('button').forEach(function(b){
      b.addEventListener('click',function(){
        answers[key]=b.dataset.v;
        q.querySelectorAll('button').forEach(function(x){x.classList.toggle('active',x===b);});
        updateResult();
      });
    });
  });

  fetch('data/kilimanjaro-routes.json',{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('route catalogue unavailable');return r.json();}).then(function(data){catalogue=data;renderNav();}).catch(function(){
    if(nav)nav.innerHTML='<p style="padding:1rem;font-size:12px">Route catalogue could not be loaded.</p>';
  });
})();