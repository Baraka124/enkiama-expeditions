(function(){
  var data=null;
  var regionNav=document.getElementById('sgRegionNav');
  var regionPanel=document.getElementById('sgRegionPanel');
  var seasonTabs=document.getElementById('sgSeasonTabs');
  var seasonPanel=document.getElementById('sgSeasonPanel');
  var stayGrid=document.getElementById('sgStayGrid');
  var access=document.getElementById('sgAccess');
  var journeys=document.getElementById('sgJourneys');
  var result=document.getElementById('sgResult');
  var answers={};

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(ch){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch];});}
  function getRegion(slug){return data.regions.find(function(r){return r.slug===slug;});}

  function renderRegion(r){
    if(!r||!regionPanel)return;
    document.querySelectorAll('.sg-region').forEach(function(b){b.classList.toggle('active',b.dataset.slug===r.slug);});
    regionPanel.innerHTML=
      '<span class="sg-region__type">'+esc(r.stance)+'</span>'+
      '<h3>'+esc(r.name)+'</h3>'+
      '<p class="sg-region-panel__geo">'+esc(r.geography)+'</p>'+
      '<div class="sg-region-stats">'+
        '<div class="sg-region-stat"><span>Strongest window</span><strong>'+esc(r.strongest_window)+'</strong></div>'+
        '<div class="sg-region-stat"><span>Migration role</span><strong>'+esc(r.migration_role)+'</strong></div>'+
        '<div class="sg-region-stat"><span>Crowd profile</span><strong>'+esc(r.crowd_profile)+'</strong></div>'+
      '</div>'+
      '<div class="sg-region-grid">'+
        '<div><h4>Why it works</h4><p>'+esc(r.resident_strength)+'</p></div>'+
        '<div><h4>Trade-off</h4><p>'+esc(r.tradeoff)+'</p></div>'+
        '<div><h4>Stay strategy</h4><p>'+esc(r.stay_strategy)+'</p></div>'+
        '<div><h4>Best for</h4><p>'+esc(r.best_for.join(' · '))+'</p></div>'+
      '</div>'+
      '<div class="sg-region-link"><a href="#season">Check the seasonal window →</a></div>';
  }

  function renderRegionNav(){
    regionNav.innerHTML=data.regions.map(function(r){
      return '<button class="sg-region" data-slug="'+esc(r.slug)+'"><div class="sg-region__top"><span class="sg-region__name">'+esc(r.name)+'</span><span class="sg-region__window">'+esc(r.strongest_window)+'</span></div><div class="sg-region__meta">'+esc(r.migration_role)+'</div></button>';
    }).join('');
    regionNav.querySelectorAll('.sg-region').forEach(function(b){
      b.addEventListener('click',function(){renderRegion(getRegion(b.dataset.slug));});
    });
    renderRegion(getRegion('central'));
  }

  function renderSeason(s){
    document.querySelectorAll('.sg-season-tabs button').forEach(function(b){b.classList.toggle('active',b.dataset.key===s.key);});
    seasonPanel.innerHTML=
      '<div class="sg-season-panel__left"><span class="sg-season__label">'+esc(s.months)+'</span><h3>'+esc(s.likely_focus)+'</h3><p>'+esc(s.ecological_story)+'</p></div>'+
      '<div class="sg-season-panel__right"><span class="sg-season__label">Planning note</span><p>'+esc(s.planning_note)+'</p><p class="sg-season-note">Use this as ecological guidance, not a timetable. Rainfall can move the herds earlier, later or more widely than a calendar suggests.</p></div>';
  }

  function renderSeasons(){
    seasonTabs.innerHTML=data.seasonal_calendar.map(function(s){return '<button data-key="'+esc(s.key)+'">'+esc(s.months)+'</button>';}).join('');
    seasonTabs.querySelectorAll('button').forEach(function(b){
      b.addEventListener('click',function(){renderSeason(data.seasonal_calendar.find(function(s){return s.key===b.dataset.key;}));});
    });
    renderSeason(data.seasonal_calendar[0]);
  }

  function renderPlanning(){
    stayGrid.innerHTML=data.stay_logic.map(function(s){
      return '<article class="sg-plan"><span>'+esc(s.stance)+'</span><strong>'+esc(s.nights)+'</strong><p>'+esc(s.note)+'</p></article>';
    }).join('');
    access.innerHTML=data.access_logic.map(function(a){
      return '<article><span class="sg-kicker">'+esc(a.best_for)+'</span><strong>'+esc(a.mode)+'</strong><p>'+esc(a.note)+'</p></article>';
    }).join('');
  }

  function renderJourneys(){
    journeys.innerHTML=data.operated_evidence.map(function(j){
      return '<a class="sg-journey" href="'+esc(j.href)+'"><span class="sg-journey__label">'+esc(j.label)+'</span><h3>'+esc(j.title)+'</h3><p>'+esc(j.insight)+'</p><small>Open operated journey →</small></a>';
    }).join('');
  }

  function scoreRegion(r){
    var s=0,period=answers.period,nights=Number(answers.nights||0),priority=answers.priority,crowds=answers.crowds;
    if(period==='jan-mar'){if(r.slug==='south')s+=9;if(r.slug==='central')s+=3;if(r.slug==='east')s+=3;}
    if(period==='apr-may'){if(r.slug==='central')s+=5;if(r.slug==='west')s+=4;if(r.slug==='south')s+=3;if(r.slug==='east')s+=3;}
    if(period==='jun'){if(r.slug==='west')s+=8;if(r.slug==='central')s+=4;if(r.slug==='north')s+=2;}
    if(period==='jul-oct'){if(r.slug==='north')s+=9;if(r.slug==='central')s+=4;if(r.slug==='west')s+=2;}
    if(period==='nov-dec'){if(r.slug==='central')s+=5;if(r.slug==='south')s+=5;if(r.slug==='east')s+=3;}

    if(priority==='migration'){
      if(period==='jan-mar'&&r.slug==='south')s+=6;
      if(period==='jun'&&r.slug==='west')s+=6;
      if(period==='jul-oct'&&r.slug==='north')s+=6;
      if(period==='nov-dec'&&(r.slug==='south'||r.slug==='central'))s+=4;
    }
    if(priority==='predators'){if(r.slug==='central')s+=7;if(r.slug==='east')s+=6;if(r.slug==='south')s+=4;}
    if(priority==='quiet'){if(r.slug==='east')s+=7;if(r.slug==='west')s+=5;if(r.slug==='north')s+=3;if(r.slug==='central')s-=4;}
    if(priority==='balanced'){if(r.slug==='central')s+=8;if(r.slug==='north')s+=3;if(r.slug==='south')s+=3;}

    if(crowds==='avoid'){if(r.slug==='east')s+=5;if(r.slug==='west')s+=4;if(r.slug==='central')s-=4;if(r.slug==='north'&&period==='jul-oct')s-=2;}
    if(crowds==='some'){if(r.slug==='east'||r.slug==='west')s+=2;}
    if(crowds==='fine'){if(r.slug==='central')s+=2;}

    if(nights<=2){if(r.slug==='central')s+=4;if(r.slug==='north'||r.slug==='west')s-=2;}
    if(nights===3){if(r.slug==='central')s+=3;if(r.slug==='south'||r.slug==='north')s+=2;}
    if(nights===4){if(r.slug==='south'||r.slug==='north'||r.slug==='west'||r.slug==='east')s+=2;}
    if(nights>=5){if(r.slug!=='central')s+=3;}

    return s;
  }

  function recommendation(){
    if(!data||!answers.period||!answers.nights||!answers.priority||!answers.crowds)return;
    var ranked=data.regions.map(function(r){return {r:r,s:scoreRegion(r)};}).sort(function(a,b){return b.s-a.s;});
    var top=ranked[0].r,alt=ranked[1].r;
    var nights=Number(answers.nights);
    var strategy=nights<=2
      ? 'Keep the Serengeti to one region. Two nights is already compressed, so do not split camps.'
      : nights===3
        ? 'Three nights works best as one regional base with two full wildlife days.'
        : nights===4
          ? 'Four nights gives you room to slow down; split regions only if the transfer genuinely adds ecological value.'
          : 'Five or more nights can support a two-region Serengeti without turning the safari into a sequence of transfers.';
    var caution=answers.priority==='migration'
      ? 'Migration positioning improves probability, not certainty. The journey should remain worthwhile if the herds shift or no crossing happens.'
      : 'This recommendation prioritises the wildlife experience you chose rather than forcing the migration into the centre of the trip.';
    result.innerHTML=
      '<span class="sg-kicker">First direction</span>'+
      '<h3>'+esc(top.name)+'</h3>'+
      '<p><strong>Why:</strong> '+esc(top.best_for.join(' · '))+'. '+esc(strategy)+'</p>'+
      '<p><strong>Compare with '+esc(alt.name)+':</strong> '+esc(alt.tradeoff)+'</p>'+
      '<p>'+esc(caution)+'</p>'+
      '<a href="#regions" id="sgOpenRegion">Open '+esc(top.name)+' in the region reader →</a>';
    var a=document.getElementById('sgOpenRegion');
    if(a)a.addEventListener('click',function(){renderRegion(top);});
  }

  document.querySelectorAll('.sg-q').forEach(function(q){
    var key=q.dataset.k;
    q.querySelectorAll('button').forEach(function(b){
      b.addEventListener('click',function(){
        answers[key]=b.dataset.v;
        q.querySelectorAll('button').forEach(function(x){x.classList.toggle('active',x===b);});
        recommendation();
      });
    });
  });

  fetch('data/serengeti.json',{cache:'no-store'})
    .then(function(r){if(!r.ok)throw new Error('Serengeti data unavailable');return r.json();})
    .then(function(d){data=d;renderRegionNav();renderSeasons();renderPlanning();renderJourneys();})
    .catch(function(){if(regionNav)regionNav.innerHTML='<p style="padding:1rem;font-size:12px">Serengeti content could not be loaded.</p>';});
})();