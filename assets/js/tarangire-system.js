(function(){
  var data=null;
  var landNav=document.getElementById('tgLandNav');
  var landPanel=document.getElementById('tgLandPanel');
  var seasonTabs=document.getElementById('tgSeasonTabs');
  var seasonPanel=document.getElementById('tgSeasonPanel');
  var stayGrid=document.getElementById('tgStayGrid');
  var activities=document.getElementById('tgActivities');
  var journeys=document.getElementById('tgJourneys');
  var result=document.getElementById('tgResult');
  var answers={};

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(ch){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch];});}
  function getLand(slug){return data.landscapes.find(function(x){return x.slug===slug;});}

  function renderLand(x){
    if(!x||!landPanel)return;
    document.querySelectorAll('.tg-land').forEach(function(b){b.classList.toggle('active',b.dataset.slug===x.slug);});
    landPanel.innerHTML=
      '<span class="tg-land__type">'+esc(x.role)+'</span>'+
      '<h3>'+esc(x.name)+'</h3>'+
      '<p class="tg-land-panel__summary">'+esc(x.summary)+'</p>'+
      '<div class="tg-land-stats">'+
        '<div class="tg-land-stat"><span>Strongest window</span><strong>'+esc(x.strongest_window)+'</strong></div>'+
        '<div class="tg-land-stat"><span>Wildlife pattern</span><strong>'+esc(x.wildlife)+'</strong></div>'+
        '<div class="tg-land-stat"><span>Crowd profile</span><strong>'+esc(x.crowd_profile)+'</strong></div>'+
      '</div>'+
      '<div class="tg-land-grid">'+
        '<div><h4>How it feels</h4><p>'+esc(x.experience)+'</p></div>'+
        '<div><h4>Trade-off</h4><p>'+esc(x.tradeoff)+'</p></div>'+
        '<div><h4>Best for</h4><p>'+esc(x.best_for.join(' · '))+'</p></div>'+
        '<div><h4>Planning stance</h4><p>Use this landscape when route time and camp position make it practical, rather than forcing every Tarangire visit to cover the same loops.</p></div>'+
      '</div>';
  }

  function renderLandNav(){
    landNav.innerHTML=data.landscapes.map(function(x){
      return '<button class="tg-land" data-slug="'+esc(x.slug)+'"><div class="tg-land__top"><span class="tg-land__name">'+esc(x.name)+'</span><span class="tg-land__window">'+esc(x.strongest_window)+'</span></div><div class="tg-land__meta">'+esc(x.role)+'</div></button>';
    }).join('');
    landNav.querySelectorAll('.tg-land').forEach(function(b){
      b.addEventListener('click',function(){renderLand(getLand(b.dataset.slug));});
    });
    renderLand(getLand('river-corridor'));
  }

  function renderSeason(s){
    document.querySelectorAll('.tg-season-tabs button').forEach(function(b){b.classList.toggle('active',b.dataset.key===s.key);});
    seasonPanel.innerHTML=
      '<div class="tg-season-panel__left"><span class="tg-season__label">'+esc(s.months)+'</span><h3>'+esc(s.landscape)+'</h3><p>'+esc(s.wildlife_pattern)+'</p></div>'+
      '<div class="tg-season-panel__right"><span class="tg-season__label">Planning note</span><p>'+esc(s.planning_note)+'</p></div>';
  }

  function renderSeasons(){
    seasonTabs.innerHTML=data.seasonal_calendar.map(function(s){return '<button data-key="'+esc(s.key)+'">'+esc(s.months)+'</button>';}).join('');
    seasonTabs.querySelectorAll('button').forEach(function(b){
      b.addEventListener('click',function(){renderSeason(data.seasonal_calendar.find(function(s){return s.key===b.dataset.key;}));});
    });
    renderSeason(data.seasonal_calendar[2]);
  }

  function renderStayActivities(){
    stayGrid.innerHTML=data.stay_logic.map(function(s){
      return '<article class="tg-stay-card"><span>'+esc(s.stance)+'</span><strong>'+esc(s.nights)+'</strong><p>'+esc(s.note)+'</p></article>';
    }).join('');
    activities.innerHTML=data.activities.map(function(a){
      return '<article><span class="tg-kicker">'+esc(a.status)+'</span><strong>'+esc(a.name)+'</strong><p>'+esc(a.note)+'</p></article>';
    }).join('');
  }

  function renderJourneys(){
    journeys.innerHTML=data.operated_evidence.map(function(j){
      return '<a class="tg-journey" href="'+esc(j.href)+'"><span class="tg-journey__label">'+esc(j.label)+'</span><h3>'+esc(j.title)+'</h3><p>'+esc(j.insight)+'</p><small>Open operated journey →</small></a>';
    }).join('');
  }

  function recommendation(){
    if(!answers.period||!answers.time||!answers.priority)return;
    var title,copy,href='#landscapes',label='Review the Tarangire landscapes →';
    var dry=answers.period==='jun-jul'||answers.period==='aug-oct';
    var green=answers.period==='mar-may'||answers.period==='nov-dec';

    if(answers.time==='day'){
      title='Keep Tarangire focused.';
      copy='A day trip can work, especially as part of a short northern circuit, but keep expectations to the northern park and river/baobab country rather than trying to represent all of Tarangire.';
    }else if(answers.time==='1'){
      title='One night materially improves the park.';
      copy='An evening and early morning already changes Tarangire from a transfer stop into a wildlife chapter. Stay close enough to use those hours rather than spending them on the road.';
    }else if(answers.time==='2'){
      title='Two nights is the strongest default.';
      copy='Two nights gives enough time for repeated river or swamp periods and makes Silale or quieter loops more realistic without overloading the itinerary.';
    }else{
      title='Tarangire can become a destination in its own right.';
      copy='Three or more nights makes deeper southern areas, birding, slower wildlife watching and authorised walking or night-drive options more practical.';
    }

    if(dry&&answers.priority==='elephants'){
      title='Build around the dry-season river system.';
      copy+=' Your dates and elephant priority align strongly with the classic dry-season Tarangire pattern around the river, pools and swamps.';
    }
    if(answers.priority==='birding'){
      copy+=' Birding remains a serious reason to visit outside peak dry-season mammal concentration, particularly around wetland habitats and greener months.';
    }
    if(answers.priority==='quiet'&&answers.time==='3'){
      copy+=' With enough time, look beyond the busiest northern river loops toward Silale or the south, subject to road and camp position.';
    }
    if(green&&answers.priority==='elephants'){
      copy+=' Wildlife can be more dispersed in greener months, so do not expect the same elephant concentration pattern as August–October.';
    }

    result.innerHTML=
      '<span class="tg-kicker">First direction</span>'+
      '<h3>'+esc(title)+'</h3>'+
      '<p>'+esc(copy)+'</p>'+
      '<p>This is route guidance, not a wildlife guarantee. Exact conditions still depend on rainfall, water and current road access.</p>'+
      '<a href="'+href+'">'+esc(label)+'</a>';
  }

  document.querySelectorAll('.tg-q').forEach(function(q){
    var key=q.dataset.k;
    q.querySelectorAll('button').forEach(function(b){
      b.addEventListener('click',function(){
        answers[key]=b.dataset.v;
        q.querySelectorAll('button').forEach(function(x){x.classList.toggle('active',x===b);});
        recommendation();
      });
    });
  });

  fetch('data/tarangire.json',{cache:'no-store'})
    .then(function(r){if(!r.ok)throw new Error('Tarangire data unavailable');return r.json();})
    .then(function(d){data=d;renderLandNav();renderSeasons();renderStayActivities();renderJourneys();})
    .catch(function(){if(landNav)landNav.innerHTML='<p style="padding:1rem;font-size:12px">Tarangire content could not be loaded.</p>';});
})();