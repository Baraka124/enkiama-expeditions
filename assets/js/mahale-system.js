(function(){
  var data=null;
  var nav=document.getElementById('mhSystemNav');
  var panel=document.getElementById('mhSystemPanel');
  var tabs=document.getElementById('mhSeasonTabs');
  var seasonPanel=document.getElementById('mhSeasonPanel');
  var stay=document.getElementById('mhStayGrid');
  var access=document.getElementById('mhAccess');
  var health=document.getElementById('mhHealthGrid');
  var fit=document.getElementById('mhFitGrid');
  var routes=document.getElementById('mhRoutes');
  var result=document.getElementById('mhResult');
  var answers={};

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(ch){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch];});}
  function getSystem(slug){return data.systems.find(function(x){return x.slug===slug;});}

  function renderSystem(x){
    if(!x||!panel)return;
    document.querySelectorAll('.mh-system').forEach(function(b){b.classList.toggle('active',b.dataset.slug===x.slug);});
    panel.innerHTML=
      '<span class="mh-system__type">'+esc(x.role)+'</span>'+
      '<h3>'+esc(x.name)+'</h3>'+
      '<p class="mh-system-panel__summary">'+esc(x.summary)+'</p>'+
      '<div class="mh-system-stats">'+
        '<div class="mh-system-stat"><span>Strongest window</span><strong>'+esc(x.strongest_window)+'</strong></div>'+
        '<div class="mh-system-stat"><span>Wildlife / ecology</span><strong>'+esc(x.wildlife)+'</strong></div>'+
        '<div class="mh-system-stat"><span>Planning</span><strong>'+esc(x.planning)+'</strong></div>'+
      '</div>'+
      '<div class="mh-system-grid">'+
        '<div><h4>How it feels</h4><p>'+esc(x.experience)+'</p></div>'+
        '<div><h4>Trade-off</h4><p>'+esc(x.tradeoff)+'</p></div>'+
        '<div><h4>Best for</h4><p>'+esc(x.best_for.join(' · '))+'</p></div>'+
        '<div><h4>Enkiama stance</h4><p>Use this element only when the stay has enough time to let it matter; Mahale should not be reduced to one chimp trek and a departure.</p></div>'+
      '</div>';
  }

  function renderNav(){
    nav.innerHTML=data.systems.map(function(x){
      return '<button class="mh-system" data-slug="'+esc(x.slug)+'"><div class="mh-system__top"><span class="mh-system__name">'+esc(x.name)+'</span><span class="mh-system__window">'+esc(x.strongest_window)+'</span></div><div class="mh-system__meta">'+esc(x.role)+'</div></button>';
    }).join('');
    nav.querySelectorAll('.mh-system').forEach(function(b){b.addEventListener('click',function(){renderSystem(getSystem(b.dataset.slug));});});
    renderSystem(getSystem('chimpanzee-trekking'));
  }

  function renderSeason(s){
    document.querySelectorAll('.mh-season-tabs button').forEach(function(b){b.classList.toggle('active',b.dataset.key===s.key);});
    seasonPanel.innerHTML=
      '<div class="mh-season-panel__left"><span class="mh-season__label">'+esc(s.months)+'</span><h3>'+esc(s.ecology)+'</h3></div>'+
      '<div class="mh-season-panel__right"><span class="mh-season__label">Planning note</span><p>'+esc(s.planning_note)+'</p></div>';
  }

  function renderSeasons(){
    tabs.innerHTML=data.seasonal_calendar.map(function(s){return '<button data-key="'+esc(s.key)+'">'+esc(s.months)+'</button>';}).join('');
    tabs.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){renderSeason(data.seasonal_calendar.find(function(s){return s.key===b.dataset.key;}));});});
    renderSeason(data.seasonal_calendar[0]);
  }

  function renderDepth(){
    stay.innerHTML=data.stay_logic.map(function(s){
      return '<article class="mh-stay-card"><span>'+esc(s.stance)+'</span><strong>'+esc(s.nights)+'</strong><p>'+esc(s.note)+'</p></article>';
    }).join('');
    access.innerHTML=data.access_logic.map(function(a){
      return '<article><span class="mh-kicker">'+esc(a.stance)+'</span><strong>'+esc(a.mode)+'</strong><p>'+esc(a.note)+'</p></article>';
    }).join('');
  }

  function renderHealth(){
    health.innerHTML=data.health_protocol.map(function(h){
      return '<article class="mh-health-card"><span class="mh-health__label">'+esc(h.item)+'</span><strong>'+esc(h.rule)+'</strong><p>'+esc(h.reason)+'</p></article>';
    }).join('');
  }

  function renderFit(){
    fit.innerHTML=data.traveller_fit.map(function(f){
      return '<article class="mh-fit-card"><span class="mh-fit__label">'+esc(f.fit)+'</span><strong>'+esc(f.type)+'</strong><p>'+esc(f.note)+'</p><small>'+esc(f.fit)+'</small></article>';
    }).join('');
  }

  function renderRoutes(){
    routes.innerHTML=data.route_shapes.map(function(r){
      return '<article class="mh-route"><span class="mh-kicker">'+esc(r.label)+'</span><h3>'+esc(r.label)+'</h3><p>'+esc(r.note)+'</p><ol>'+r.sequence.map(function(s){return '<li>'+esc(s)+'</li>';}).join('')+'</ol><small>'+esc(r.best_for.join(' · '))+'</small></article>';
    }).join('');
  }

  function recommendation(){
    if(!answers.nights||!answers.fitness||!answers.priority||!answers.experience)return;
    var nights=Number(answers.nights),title='',copy='',href='#systems',label='Review the Mahale systems →';

    if(nights===2){
      title='Mahale does not belong in this itinerary.';
      copy='Two nights leaves too little margin for remote access, chimpanzee variability and lake time. The expedition effort is too high for the time available.';
      href='compose.html';label='Rebuild the journey in Compose →';
    }else if(nights===3){
      title='Three nights is the minimum credible Mahale stay.';
      copy='Keep chimp trekking as the clear priority and avoid trying to add every mountain or lake activity.';
    }else if(nights===4){
      title='Four nights is the strongest first Mahale shape.';
      copy='Four nights gives enough margin for more than one trekking opportunity and lets Lake Tanganyika become a real part of the expedition.';
    }else{
      title='Now Mahale can become a full expedition chapter.';
      copy='Five or more nights creates room for chimp trekking, lake time, hiking and recovery without every day depending on one objective.';
    }

    if(answers.fitness==='avoid'){
      title='Mahale may be the wrong fit.';
      copy='Steep, humid forest trekking is central to the chimpanzee experience. If that is something you actively want to avoid, the access effort is difficult to justify.';
      href='compose.html';label='Compare another Tanzania route →';
    }else if(answers.fitness==='moderate'){
      copy+=' Trek difficulty changes daily, so the itinerary should keep expectations realistic rather than promising an easy track.';
    }

    if(answers.priority==='chimps'){
      copy+=' Chimpanzees should drive the planning, but sightings and trekking duration remain uncertain.';
    }else if(answers.priority==='lake'){
      copy+=' Your priority fits Mahale particularly well because the lake is one of the few places where a primate expedition can genuinely slow down after trekking.';
    }else if(answers.priority==='hiking'){
      copy+=' Longer mountain hikes need additional time beyond standard chimp trekking and should be planned with current trail conditions.';
    }else{
      copy+=' Mahale’s strongest value is the total contrast between savanna safari, forest primates and Lake Tanganyika.';
    }

    if(answers.experience==='repeat'){
      copy+=' As a repeat Tanzania traveller, the ecological contrast is likely to be more valuable than another conventional wildlife circuit.';
    }else if(answers.experience==='first'){
      copy+=' For a first Tanzania journey, Mahale works only if primates and remoteness are genuine priorities—not as an add-on to every major northern destination.';
    }

    result.innerHTML=
      '<span class="mh-kicker">First direction</span>'+
      '<h3>'+esc(title)+'</h3>'+
      '<p>'+esc(copy)+'</p>'+
      '<p>If you develop cold or flu symptoms, chimp trekking should be skipped. Current ranger, viewing, access and lodge rules must be checked close to travel.</p>'+
      '<a href="'+href+'">'+esc(label)+'</a>';
  }

  document.querySelectorAll('.mh-q').forEach(function(q){
    var key=q.dataset.k;
    q.querySelectorAll('button').forEach(function(b){
      b.addEventListener('click',function(){
        answers[key]=b.dataset.v;
        q.querySelectorAll('button').forEach(function(x){x.classList.toggle('active',x===b);});
        recommendation();
      });
    });
  });

  fetch('data/mahale.json',{cache:'no-store'})
    .then(function(r){if(!r.ok)throw new Error('Mahale data unavailable');return r.json();})
    .then(function(d){data=d;renderNav();renderSeasons();renderDepth();renderHealth();renderFit();renderRoutes();})
    .catch(function(){if(nav)nav.innerHTML='<p style="padding:1rem;font-size:12px">Mahale content could not be loaded.</p>';});
})();