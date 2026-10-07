(function(){
  var data=null;
  var nav=document.getElementById('nySystemNav');
  var panel=document.getElementById('nySystemPanel');
  var tabs=document.getElementById('nySeasonTabs');
  var seasonPanel=document.getElementById('nySeasonPanel');
  var stay=document.getElementById('nyStayGrid');
  var activities=document.getElementById('nyActivities');
  var fit=document.getElementById('nyFitGrid');
  var routes=document.getElementById('nyRoutes');
  var result=document.getElementById('nyResult');
  var answers={};

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(ch){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch];});}
  function getSystem(slug){return data.systems.find(function(x){return x.slug===slug;});}

  function renderSystem(x){
    if(!x||!panel)return;
    document.querySelectorAll('.ny-system').forEach(function(b){b.classList.toggle('active',b.dataset.slug===x.slug);});
    panel.innerHTML=
      '<span class="ny-system__type">'+esc(x.role)+'</span>'+
      '<h3>'+esc(x.name)+'</h3>'+
      '<p class="ny-system-panel__summary">'+esc(x.summary)+'</p>'+
      '<div class="ny-system-stats">'+
        '<div class="ny-system-stat"><span>Strongest window</span><strong>'+esc(x.strongest_window)+'</strong></div>'+
        '<div class="ny-system-stat"><span>Wildlife</span><strong>'+esc(x.wildlife)+'</strong></div>'+
        '<div class="ny-system-stat"><span>Crowd profile</span><strong>'+esc(x.crowd_profile)+'</strong></div>'+
      '</div>'+
      '<div class="ny-system-grid">'+
        '<div><h4>How it feels</h4><p>'+esc(x.experience)+'</p></div>'+
        '<div><h4>Trade-off</h4><p>'+esc(x.tradeoff)+'</p></div>'+
        '<div><h4>Best for</h4><p>'+esc(x.best_for.join(' · '))+'</p></div>'+
        '<div><h4>Enkiama stance</h4><p>Use this system when it changes how the safari is experienced, not as an activity checkbox.</p></div>'+
      '</div>';
  }

  function renderNav(){
    nav.innerHTML=data.systems.map(function(x){
      return '<button class="ny-system" data-slug="'+esc(x.slug)+'"><div class="ny-system__top"><span class="ny-system__name">'+esc(x.name)+'</span><span class="ny-system__window">'+esc(x.strongest_window)+'</span></div><div class="ny-system__meta">'+esc(x.role)+'</div></button>';
    }).join('');
    nav.querySelectorAll('.ny-system').forEach(function(b){b.addEventListener('click',function(){renderSystem(getSystem(b.dataset.slug));});});
    renderSystem(getSystem('rufiji-river'));
  }

  function renderSeason(s){
    document.querySelectorAll('.ny-season-tabs button').forEach(function(b){b.classList.toggle('active',b.dataset.key===s.key);});
    seasonPanel.innerHTML=
      '<div class="ny-season-panel__left"><span class="ny-season__label">'+esc(s.months)+'</span><h3>'+esc(s.ecology)+'</h3></div>'+
      '<div class="ny-season-panel__right"><span class="ny-season__label">Planning note</span><p>'+esc(s.planning_note)+'</p></div>';
  }

  function renderSeasons(){
    tabs.innerHTML=data.seasonal_calendar.map(function(s){return '<button data-key="'+esc(s.key)+'">'+esc(s.months)+'</button>';}).join('');
    tabs.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){renderSeason(data.seasonal_calendar.find(function(s){return s.key===b.dataset.key;}));});});
    renderSeason(data.seasonal_calendar[1]);
  }

  function renderDepth(){
    stay.innerHTML=data.stay_logic.map(function(s){
      return '<article class="ny-stay-card"><span>'+esc(s.stance)+'</span><strong>'+esc(s.nights)+'</strong><p>'+esc(s.note)+'</p></article>';
    }).join('');
    activities.innerHTML=data.activities.map(function(a){
      return '<article><span class="ny-kicker">'+esc(a.status)+'</span><strong>'+esc(a.name)+'</strong><p>'+esc(a.note)+'</p></article>';
    }).join('');
  }

  function renderFit(){
    fit.innerHTML=data.traveller_fit.map(function(f){
      return '<article class="ny-fit-card"><span class="ny-fit__label">'+esc(f.fit)+'</span><strong>'+esc(f.type)+'</strong><p>'+esc(f.note)+'</p><small>'+esc(f.fit)+'</small></article>';
    }).join('');
  }

  function renderRoutes(){
    routes.innerHTML=data.route_shapes.map(function(r){
      return '<article class="ny-route"><span class="ny-kicker">'+esc(r.label)+'</span><h3>'+esc(r.label)+'</h3><p>'+esc(r.note)+'</p><ol>'+r.sequence.map(function(s){return '<li>'+esc(s)+'</li>';}).join('')+'</ol><small>'+esc(r.best_for.join(' · '))+'</small></article>';
    }).join('');
  }

  function recommendation(){
    if(!answers.nights||!answers.priority||!answers.experience||!answers.onward)return;
    var nights=Number(answers.nights),title='',copy='',href='#systems',label='Review the Nyerere systems →';

    if(nights===2){
      title='Two nights is compressed.';
      copy='You can technically fit a boat trip and one full wildlife day, but Nyerere’s activity diversity will be underused. Unless access is unusually efficient, three nights is the stronger minimum.';
    }else if(nights===3){
      title='Three nights is the practical minimum.';
      copy='You can combine game drives with a meaningful river or walking component without turning the entire stay into logistics.';
    }else if(nights===4){
      title='Four nights is the strongest first Nyerere shape.';
      copy='Four nights lets boating, driving and walking coexist as equal parts of the safari rather than one activity becoming a token extra.';
    }else{
      title='Nyerere can become the core safari.';
      copy='Five or more nights supports multiple activity types, different ecological zones or a camp split without rushing.';
    }

    if(answers.priority==='boat'){
      copy+=' Your strongest reason to choose Nyerere is the Rufiji system itself; camp and river access should therefore drive accommodation choice.';
    }else if(answers.priority==='walking'){
      copy+=' Walking can justify Nyerere strongly, but exact programmes remain camp-, guide-, age- and season-dependent.';
    }else if(answers.priority==='wildlife'){
      copy+=' If your priority is purely wildlife density rather than activity diversity, compare Nyerere carefully with Ruaha or the northern circuit.';
    }else{
      copy+=' Mixed activity is where Nyerere is most distinct from Tanzania’s vehicle-dominated safari routes.';
    }

    if(answers.experience==='repeat'){
      copy+=' Repeat-safari travellers are especially well matched because boats and walking change the grammar of the safari.';
    }else if(answers.experience==='first'){
      copy+=' For a first safari, this works best when you actively prefer variety of movement over migration-focused iconography.';
    }

    if(answers.onward==='ruaha'){
      copy+=' Pairing with Ruaha creates the strongest southern contrast: river and activity diversity here, dry-country predator systems there.';
      href='ruaha.html';label='Continue into Ruaha →';
    }else if(answers.onward==='zanzibar'){
      copy+=' Nyerere + Zanzibar is one of the cleanest safari-to-coast compositions in southern Tanzania.';
      href='zanzibar.html';label='Continue to Zanzibar →';
    }else if(answers.onward==='depart'){
      copy+=' If you depart through Dar, Nyerere can function as the complete safari rather than a component of a longer circuit.';
    }

    result.innerHTML=
      '<span class="ny-kicker">First direction</span>'+
      '<h3>'+esc(title)+'</h3>'+
      '<p>'+esc(copy)+'</p>'+
      '<p>Boat routes, walking availability, camp operation and flight schedules must still be checked close to travel.</p>'+
      '<a href="'+href+'">'+esc(label)+'</a>';
  }

  document.querySelectorAll('.ny-q').forEach(function(q){
    var key=q.dataset.k;
    q.querySelectorAll('button').forEach(function(b){
      b.addEventListener('click',function(){
        answers[key]=b.dataset.v;
        q.querySelectorAll('button').forEach(function(x){x.classList.toggle('active',x===b);});
        recommendation();
      });
    });
  });

  fetch('data/nyerere.json',{cache:'no-store'})
    .then(function(r){if(!r.ok)throw new Error('Nyerere data unavailable');return r.json();})
    .then(function(d){data=d;renderNav();renderSeasons();renderDepth();renderFit();renderRoutes();})
    .catch(function(){if(nav)nav.innerHTML='<p style="padding:1rem;font-size:12px">Nyerere content could not be loaded.</p>';});
})();