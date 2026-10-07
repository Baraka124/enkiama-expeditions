(function(){
  var data=null;
  var nav=document.getElementById('rhSystemNav');
  var panel=document.getElementById('rhSystemPanel');
  var tabs=document.getElementById('rhSeasonTabs');
  var seasonPanel=document.getElementById('rhSeasonPanel');
  var stay=document.getElementById('rhStayGrid');
  var access=document.getElementById('rhAccess');
  var fit=document.getElementById('rhFitGrid');
  var routes=document.getElementById('rhRoutes');
  var result=document.getElementById('rhResult');
  var answers={};

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(ch){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch];});}
  function getSystem(slug){return data.systems.find(function(x){return x.slug===slug;});}

  function renderSystem(x){
    if(!x||!panel)return;
    document.querySelectorAll('.rh-system').forEach(function(b){b.classList.toggle('active',b.dataset.slug===x.slug);});
    panel.innerHTML=
      '<span class="rh-system__type">'+esc(x.role)+'</span>'+
      '<h3>'+esc(x.name)+'</h3>'+
      '<p class="rh-system-panel__summary">'+esc(x.summary)+'</p>'+
      '<div class="rh-system-stats">'+
        '<div class="rh-system-stat"><span>Strongest window</span><strong>'+esc(x.strongest_window)+'</strong></div>'+
        '<div class="rh-system-stat"><span>Wildlife</span><strong>'+esc(x.wildlife)+'</strong></div>'+
        '<div class="rh-system-stat"><span>Crowd profile</span><strong>'+esc(x.crowd_profile)+'</strong></div>'+
      '</div>'+
      '<div class="rh-system-grid">'+
        '<div><h4>How it feels</h4><p>'+esc(x.experience)+'</p></div>'+
        '<div><h4>Trade-off</h4><p>'+esc(x.tradeoff)+'</p></div>'+
        '<div><h4>Best for</h4><p>'+esc(x.best_for.join(' · '))+'</p></div>'+
        '<div><h4>Enkiama stance</h4><p>Use this landscape only when stay length and camp position make it meaningful; Ruaha should not be reduced to one generic game-drive circuit.</p></div>'+
      '</div>';
  }

  function renderNav(){
    nav.innerHTML=data.systems.map(function(x){
      return '<button class="rh-system" data-slug="'+esc(x.slug)+'"><div class="rh-system__top"><span class="rh-system__name">'+esc(x.name)+'</span><span class="rh-system__window">'+esc(x.strongest_window)+'</span></div><div class="rh-system__meta">'+esc(x.role)+'</div></button>';
    }).join('');
    nav.querySelectorAll('.rh-system').forEach(function(b){b.addEventListener('click',function(){renderSystem(getSystem(b.dataset.slug));});});
    renderSystem(getSystem('great-ruaha'));
  }

  function renderSeason(s){
    document.querySelectorAll('.rh-season-tabs button').forEach(function(b){b.classList.toggle('active',b.dataset.key===s.key);});
    seasonPanel.innerHTML=
      '<div class="rh-season-panel__left"><span class="rh-season__label">'+esc(s.months)+'</span><h3>'+esc(s.ecology)+'</h3></div>'+
      '<div class="rh-season-panel__right"><span class="rh-season__label">Planning note</span><p>'+esc(s.planning_note)+'</p></div>';
  }

  function renderSeasons(){
    tabs.innerHTML=data.seasonal_calendar.map(function(s){return '<button data-key="'+esc(s.key)+'">'+esc(s.months)+'</button>';}).join('');
    tabs.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){renderSeason(data.seasonal_calendar.find(function(s){return s.key===b.dataset.key;}));});});
    renderSeason(data.seasonal_calendar[1]);
  }

  function renderDepth(){
    stay.innerHTML=data.stay_logic.map(function(s){
      return '<article class="rh-stay-card"><span>'+esc(s.stance)+'</span><strong>'+esc(s.nights)+'</strong><p>'+esc(s.note)+'</p></article>';
    }).join('');
    access.innerHTML=data.access_logic.map(function(a){
      return '<article><span class="rh-kicker">'+esc(a.stance)+'</span><strong>'+esc(a.mode)+'</strong><p>'+esc(a.note)+'</p></article>';
    }).join('');
  }

  function renderFit(){
    fit.innerHTML=data.traveller_fit.map(function(f){
      return '<article class="rh-fit-card"><span class="rh-fit__label">'+esc(f.fit)+'</span><strong>'+esc(f.type)+'</strong><p>'+esc(f.note)+'</p><small>'+esc(f.fit)+'</small></article>';
    }).join('');
  }

  function renderRoutes(){
    routes.innerHTML=data.route_shapes.map(function(r){
      return '<article class="rh-route"><span class="rh-kicker">'+esc(r.label)+'</span><h3>'+esc(r.label)+'</h3><p>'+esc(r.note)+'</p><ol>'+r.sequence.map(function(s){return '<li>'+esc(s)+'</li>';}).join('')+'</ol><small>'+esc(r.best_for.join(' · '))+'</small></article>';
    }).join('');
  }

  function recommendation(){
    if(!answers.nights||!answers.experience||!answers.period||!answers.priority)return;
    var nights=Number(answers.nights),title='',copy='',href='#systems',label='Review the Ruaha systems →';

    if(nights===2){
      title='Ruaha is probably not worth the travel effort.';
      copy='Two nights can work operationally, but it gives too little time for a park this large and remote. Unless Ruaha is the entire point of the trip, we would usually spend those nights somewhere that does not consume as much transfer effort.';
      href='compose.html';label='Rebuild the route in Compose →';
    }else if(nights===3){
      title='Three nights is the minimum we would take seriously.';
      copy='Keep the safari in one well-positioned area and resist the temptation to split camps. Let guiding depth compensate for limited time.';
    }else if(nights===4){
      title='Four nights is the strongest first Ruaha shape.';
      copy='Four nights gives enough time for game drives, slower river reading and at least one alternative activity where the chosen camp and season allow it.';
    }else{
      title='Now Ruaha can become the safari.';
      copy='Five or more nights makes walking, two camp areas or a deeper south/west composition credible without turning the trip into a chain of transfers.';
    }

    if(answers.experience==='repeat'){
      copy+=' Your repeat-safari profile is especially well matched to Ruaha because the value lies in habitat, guiding and space rather than iconic-name collecting.';
    }else if(answers.experience==='first'){
      copy+=' For a first safari, Ruaha is excellent only if you genuinely prefer wilderness depth over a classic northern-circuit introduction.';
    }

    if(answers.priority==='walking'){
      copy+=' Walking can be one of Ruaha’s strongest reasons to travel, but only where camp, guide and season support it.';
    }else if(answers.priority==='predators'){
      copy+=' Predator country is a major strength, but exact lion, leopard or wild-dog sightings remain unpredictable.';
    }else if(answers.priority==='quiet'){
      copy+=' Lower vehicle density is part of the appeal, but the page deliberately avoids promising “nobody else around”.';
    }else if(answers.priority==='species'){
      copy+=' Kudu, sable, roan and miombo habitat make Ruaha especially rewarding for travellers interested in species mix rather than only headline mammals.';
    }

    if(answers.period==='nov-jan'||answers.period==='feb-early-mar'){
      copy+=' Your greener-season dates mean less dry-season concentration and more value from landscape, birding and lower traffic.';
    }

    result.innerHTML=
      '<span class="rh-kicker">First direction</span>'+
      '<h3>'+esc(title)+'</h3>'+
      '<p>'+esc(copy)+'</p>'+
      '<p>Flight schedules, camp openings and activity availability remain season-dependent.</p>'+
      '<a href="'+href+'">'+esc(label)+'</a>';
  }

  document.querySelectorAll('.rh-q').forEach(function(q){
    var key=q.dataset.k;
    q.querySelectorAll('button').forEach(function(b){
      b.addEventListener('click',function(){
        answers[key]=b.dataset.v;
        q.querySelectorAll('button').forEach(function(x){x.classList.toggle('active',x===b);});
        recommendation();
      });
    });
  });

  fetch('data/ruaha.json',{cache:'no-store'})
    .then(function(r){if(!r.ok)throw new Error('Ruaha data unavailable');return r.json();})
    .then(function(d){data=d;renderNav();renderSeasons();renderDepth();renderFit();renderRoutes();})
    .catch(function(){if(nav)nav.innerHTML='<p style="padding:1rem;font-size:12px">Ruaha content could not be loaded.</p>';});
})();