(function(){
  var data=null;
  var nav=document.getElementById('zzZoneNav');
  var panel=document.getElementById('zzZonePanel');
  var tabs=document.getElementById('zzSeasonTabs');
  var seasonPanel=document.getElementById('zzSeasonPanel');
  var stay=document.getElementById('zzStayGrid');
  var activities=document.getElementById('zzActivities');
  var fit=document.getElementById('zzFitGrid');
  var routes=document.getElementById('zzRoutes');
  var result=document.getElementById('zzResult');
  var answers={};

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(ch){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch];});}
  function getZone(slug){return data.zones.find(function(x){return x.slug===slug;});}

  function renderZone(x){
    if(!x||!panel)return;
    document.querySelectorAll('.zz-zone').forEach(function(b){b.classList.toggle('active',b.dataset.slug===x.slug);});
    panel.innerHTML=
      '<span class="zz-zone__type">'+esc(x.role)+'</span>'+
      '<h3>'+esc(x.name)+'</h3>'+
      '<p class="zz-zone-panel__summary">'+esc(x.summary)+'</p>'+
      '<div class="zz-zone-stats">'+
        '<div class="zz-zone-stat"><span>Strongest use</span><strong>'+esc(x.strongest_use)+'</strong></div>'+
        '<div class="zz-zone-stat"><span>Swimming</span><strong>'+esc(x.swimming)+'</strong></div>'+
        '<div class="zz-zone-stat"><span>Tides</span><strong>'+esc(x.tides)+'</strong></div>'+
      '</div>'+
      '<div class="zz-zone-grid">'+
        '<div><h4>Atmosphere</h4><p>'+esc(x.atmosphere)+'</p></div>'+
        '<div><h4>Trade-off</h4><p>'+esc(x.tradeoff)+'</p></div>'+
        '<div><h4>Best for</h4><p>'+esc(x.best_for.join(' · '))+'</p></div>'+
        '<div><h4>Enkiama stance</h4><p>Choose the coast around the day you want to have, then choose the property. The hotel should not decide the coastline for you.</p></div>'+
      '</div>';
  }

  function renderNav(){
    nav.innerHTML=data.zones.map(function(x){
      return '<button class="zz-zone" data-slug="'+esc(x.slug)+'"><div class="zz-zone__top"><span class="zz-zone__name">'+esc(x.name)+'</span><span class="zz-zone__use">'+esc(x.strongest_use)+'</span></div><div class="zz-zone__meta">'+esc(x.role)+'</div></button>';
    }).join('');
    nav.querySelectorAll('.zz-zone').forEach(function(b){b.addEventListener('click',function(){renderZone(getZone(b.dataset.slug));});});
    renderZone(getZone('north'));
  }

  function renderSeason(s){
    document.querySelectorAll('.zz-season-tabs button').forEach(function(b){b.classList.toggle('active',b.dataset.key===s.key);});
    seasonPanel.innerHTML=
      '<div class="zz-season-panel__left"><span class="zz-season__label">'+esc(s.months)+'</span><h3>'+esc(s.climate)+'</h3></div>'+
      '<div class="zz-season-panel__right"><span class="zz-season__label">Planning note</span><p>'+esc(s.planning_note)+'</p></div>';
  }

  function renderSeasons(){
    tabs.innerHTML=data.seasonal_calendar.map(function(s){return '<button data-key="'+esc(s.key)+'">'+esc(s.months)+'</button>';}).join('');
    tabs.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){renderSeason(data.seasonal_calendar.find(function(s){return s.key===b.dataset.key;}));});});
    renderSeason(data.seasonal_calendar[2]);
  }

  function renderDepth(){
    stay.innerHTML=data.stay_logic.map(function(s){
      return '<article class="zz-stay-card"><span>'+esc(s.stance)+'</span><strong>'+esc(s.nights)+'</strong><p>'+esc(s.note)+'</p></article>';
    }).join('');
    activities.innerHTML=data.activities.map(function(a){
      return '<article><span class="zz-kicker">'+esc(a.status)+'</span><strong>'+esc(a.name)+'</strong><p>'+esc(a.note)+'</p></article>';
    }).join('');
  }

  function renderFit(){
    fit.innerHTML=data.traveller_fit.map(function(f){
      return '<article class="zz-fit-card"><span class="zz-fit__label">'+esc(f.fit)+'</span><strong>'+esc(f.type)+'</strong><p>'+esc(f.note)+'</p><small>'+esc(f.fit)+'</small></article>';
    }).join('');
  }

  function renderRoutes(){
    routes.innerHTML=data.route_shapes.map(function(r){
      return '<article class="zz-route"><span class="zz-kicker">'+esc(r.label)+'</span><h3>'+esc(r.label)+'</h3><p>'+esc(r.note)+'</p><ol>'+r.sequence.map(function(s){return '<li>'+esc(s)+'</li>';}).join('')+'</ol><small>'+esc(r.best_for.join(' · '))+'</small></article>';
    }).join('');
  }

  function recommendation(){
    if(!answers.swim||!answers.tide||!answers.vibe||!answers.nights)return;
    var scores={north:0,'north-east':0,'east-southeast':0,'south-southwest':0,'stone-town-west':0};
    var nights=Number(answers.nights);

    if(answers.swim==='high'){scores.north+=7;scores['north-east']+=3;scores['east-southeast']-=2;}
    if(answers.swim==='some'){scores.north+=3;scores['north-east']+=3;scores['east-southeast']+=2;}
    if(answers.swim==='low'){scores['south-southwest']+=3;scores['stone-town-west']+=2;}

    if(answers.tide==='avoid'){scores.north+=6;scores['north-east']+=1;scores['east-southeast']-=5;}
    if(answers.tide==='fine'){scores['north-east']+=3;scores['east-southeast']+=3;}
    if(answers.tide==='love'){scores['east-southeast']+=7;scores['north-east']+=2;}

    if(answers.vibe==='quiet'){scores['north-east']+=5;scores['south-southwest']+=6;scores.north-=2;}
    if(answers.vibe==='social'){scores.north+=7;scores['east-southeast']+=3;scores['stone-town-west']+=3;}
    if(answers.vibe==='marine'){scores['north-east']+=7;scores.north+=3;scores['east-southeast']+=2;}
    if(answers.vibe==='culture'){scores['stone-town-west']+=10;}

    var ranked=Object.keys(scores).map(function(k){return {slug:k,score:scores[k]};}).sort(function(a,b){return b.score-a.score;});
    var top=getZone(ranked[0].slug);
    var alt=getZone(ranked[1].slug);
    var title=top.name;
    var copy='Your answers point first toward '+top.name+'. '+top.summary+' ';
    if(nights<=2){
      if(answers.vibe==='culture'){
        copy+='With only two nights, keep Zanzibar focused on Stone Town or one single beach base rather than splitting the island.';
      }else{
        copy+='With only two nights, choose one coast and avoid using precious recovery time on hotel changes.';
      }
    }else if(nights===3){
      copy+='Three nights works best as one beach base, or a very short Stone Town + beach split if the urban chapter matters strongly.';
    }else if(nights===4){
      copy+='Four nights is enough for a deliberate Stone Town + beach sequence or a slower single-coast stay.';
    }else{
      copy+='Five or more nights gives enough room for two genuinely different island contexts without turning the stay into transfers.';
    }

    var routeHref='#zones',routeLabel='Review '+top.name+' →';
    if(answers.vibe==='culture'&&nights>=3){
      title='Stone Town first, then '+(top.slug==='stone-town-west'?alt.name:top.name)+'.';
      copy+=' Culture is central for you, so Stone Town should be a proper chapter rather than a day trip.';
      routeHref='stonetown.html';routeLabel='Open Stone Town →';
    } else if(top.slug==='north'){
      copy+=' This is the strongest fit if easy swimming matters more than maximum quiet.';
    } else if(top.slug==='east-southeast'){
      copy+=' Your answers suggest you will enjoy the tide as part of the beach rhythm rather than experience it as a limitation.';
    } else if(top.slug==='north-east'){
      copy+=' This is a strong compromise between marine access, quieter atmosphere and beach time.';
    } else if(top.slug==='south-southwest'){
      copy+=' The quieter coast fits your priorities, but exact swimming conditions should be checked property by property.';
    }

    result.innerHTML=
      '<span class="zz-kicker">First direction</span>'+
      '<h3>'+esc(title)+'</h3>'+
      '<p>'+esc(copy)+'</p>'+
      '<p><strong>Compare with '+esc(alt.name)+':</strong> '+esc(alt.tradeoff)+'</p>'+
      '<p>Tides, marine conditions and seasonal operator availability still need to be checked for the exact property and dates.</p>'+
      '<a href="'+routeHref+'" id="zzOpenZone">'+esc(routeLabel)+'</a>';
    var a=document.getElementById('zzOpenZone');
    if(a&&routeHref==='#zones')a.addEventListener('click',function(){renderZone(top);});
  }

  document.querySelectorAll('.zz-q').forEach(function(q){
    var key=q.dataset.k;
    q.querySelectorAll('button').forEach(function(b){
      b.addEventListener('click',function(){
        answers[key]=b.dataset.v;
        q.querySelectorAll('button').forEach(function(x){x.classList.toggle('active',x===b);});
        recommendation();
      });
    });
  });

  fetch('data/zanzibar.json',{cache:'no-store'})
    .then(function(r){if(!r.ok)throw new Error('Zanzibar data unavailable');return r.json();})
    .then(function(d){data=d;renderNav();renderSeasons();renderDepth();renderFit();renderRoutes();})
    .catch(function(){if(nav)nav.innerHTML='<p style="padding:1rem;font-size:12px">Zanzibar content could not be loaded.</p>';});
})();