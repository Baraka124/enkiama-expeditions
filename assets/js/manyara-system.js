(function(){
  var data=null;
  var habitatNav=document.getElementById('myHabitatNav');
  var habitatPanel=document.getElementById('myHabitatPanel');
  var seasonTabs=document.getElementById('mySeasonTabs');
  var seasonPanel=document.getElementById('mySeasonPanel');
  var depthGrid=document.getElementById('myDepthGrid');
  var activities=document.getElementById('myActivities');
  var routes=document.getElementById('myRoutes');
  var result=document.getElementById('myResult');
  var answers={};

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(ch){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch];});}
  function getHabitat(slug){return data.habitats.find(function(x){return x.slug===slug;});}

  function renderHabitat(x){
    if(!x||!habitatPanel)return;
    document.querySelectorAll('.my-habitat').forEach(function(b){b.classList.toggle('active',b.dataset.slug===x.slug);});
    habitatPanel.innerHTML=
      '<span class="my-habitat__type">'+esc(x.role)+'</span>'+
      '<h3>'+esc(x.name)+'</h3>'+
      '<p class="my-habitat-panel__summary">'+esc(x.summary)+'</p>'+
      '<div class="my-habitat-stats">'+
        '<div class="my-habitat-stat"><span>Strongest use</span><strong>'+esc(x.strongest_use)+'</strong></div>'+
        '<div class="my-habitat-stat"><span>Wildlife</span><strong>'+esc(x.wildlife)+'</strong></div>'+
        '<div class="my-habitat-stat"><span>Crowd profile</span><strong>'+esc(x.crowd_profile)+'</strong></div>'+
      '</div>'+
      '<div class="my-habitat-grid">'+
        '<div><h4>How it feels</h4><p>'+esc(x.experience)+'</p></div>'+
        '<div><h4>Trade-off</h4><p>'+esc(x.tradeoff)+'</p></div>'+
        '<div><h4>Best for</h4><p>'+esc(x.best_for.join(' · '))+'</p></div>'+
        '<div><h4>Enkiama stance</h4><p>Use this habitat when it adds a real change of pace or ecology, not simply because Manyara appears on a standard circuit map.</p></div>'+
      '</div>';
  }

  function renderHabitatNav(){
    habitatNav.innerHTML=data.habitats.map(function(x){
      return '<button class="my-habitat" data-slug="'+esc(x.slug)+'"><div class="my-habitat__top"><span class="my-habitat__name">'+esc(x.name)+'</span><span class="my-habitat__use">'+esc(x.strongest_use)+'</span></div><div class="my-habitat__meta">'+esc(x.role)+'</div></button>';
    }).join('');
    habitatNav.querySelectorAll('.my-habitat').forEach(function(b){
      b.addEventListener('click',function(){renderHabitat(getHabitat(b.dataset.slug));});
    });
    renderHabitat(getHabitat('groundwater-forest'));
  }

  function renderSeason(s){
    document.querySelectorAll('.my-season-tabs button').forEach(function(b){b.classList.toggle('active',b.dataset.key===s.key);});
    seasonPanel.innerHTML=
      '<div class="my-season-panel__left"><span class="my-season__label">'+esc(s.months)+'</span><h3>'+esc(s.ecology)+'</h3></div>'+
      '<div class="my-season-panel__right"><span class="my-season__label">Planning note</span><p>'+esc(s.planning_note)+'</p><p style="margin-top:1.2rem">Flamingo presence, shoreline conditions and visibility change with water levels; tree-climbing lions are never a guaranteed feature.</p></div>';
  }

  function renderSeasons(){
    seasonTabs.innerHTML=data.seasonal_calendar.map(function(s){return '<button data-key="'+esc(s.key)+'">'+esc(s.months)+'</button>';}).join('');
    seasonTabs.querySelectorAll('button').forEach(function(b){
      b.addEventListener('click',function(){renderSeason(data.seasonal_calendar.find(function(s){return s.key===b.dataset.key;}));});
    });
    renderSeason(data.seasonal_calendar[2]);
  }

  function renderDepth(){
    depthGrid.innerHTML=data.stay_logic.map(function(s){
      return '<article class="my-depth-card"><span>'+esc(s.stance)+'</span><strong>'+esc(s.shape)+'</strong><p>'+esc(s.note)+'</p></article>';
    }).join('');
    activities.innerHTML=data.activities.map(function(a){
      return '<article><span class="my-kicker">'+esc(a.status)+'</span><strong>'+esc(a.name)+'</strong><p>'+esc(a.note)+'</p></article>';
    }).join('');
  }

  function renderRoutes(){
    routes.innerHTML=data.route_roles.map(function(r){
      return '<article class="my-route"><span class="my-kicker">'+esc(r.label)+'</span><h3>'+esc(r.label)+'</h3><p>'+esc(r.note)+'</p><ol>'+r.sequence.map(function(s){return '<li>'+esc(s)+'</li>';}).join('')+'</ol><small>'+esc(r.best_for.join(' · '))+'</small></article>';
    }).join('');
  }

  function recommendation(){
    if(!answers.time||!answers.priority||!answers.onward)return;
    var title='',copy='',href='#habitats',label='Review the Manyara habitats →';

    if(answers.time==='half'){
      if(answers.priority==='birding'||answers.priority==='rift'){
        title='Keep it precise, not rushed.';
        copy='A half day can still work if you know exactly why Manyara is there: forest/lake ecology or Rift context. Avoid trying to cover the whole park.';
      }else{
        title='Manyara may be optional.';
        copy='With only half a day and a general wildlife priority, Tarangire or Ngorongoro may give the route more value. Manyara does not need to be included by default.';
      }
    }else if(answers.time==='full'){
      title='A full day is the strongest default.';
      copy='One full day is enough to read the forest, open habitats and lake edge without turning Manyara into a token transit stop.';
    }else if(answers.time==='1'){
      title='Use Manyara as a Rift chapter.';
      copy='One night nearby becomes valuable when the park is paired with Mto wa Mbu, birding, canopy-walk access or a slower transition into the highlands.';
    }else{
      title='Only stay two nights if the wider basin matters.';
      copy='Two nights is not automatically better. It earns its place when Manyara, Mto wa Mbu and Rift context are themselves part of the journey rather than filler between larger parks.';
    }

    if(answers.priority==='birding'){
      copy+=' Birding is one of the strongest reasons to choose Manyara independently of large-mammal density.';
    }else if(answers.priority==='rift'){
      copy+=' Your priority aligns with Manyara’s strongest strategic role: making the Rift Valley transition physically legible.';
    }else if(answers.priority==='culture'){
      copy+=' The value expands beyond the park into Mto wa Mbu and the surrounding basin, so a pure game-drive treatment would underserve your interest.';
    }

    if(answers.onward==='ngorongoro'){
      copy+=' Because you continue to Ngorongoro, Manyara works best as a lower-elevation ecological contrast before the climb into the highlands.';
      href='ngorongoro.html';label='Continue into Ngorongoro →';
    }else if(answers.onward==='tarangire'){
      copy+=' With Tarangire next, protect the distinction between compact forest/lake ecology and Tarangire’s larger river-and-woodland system.';
      href='tarangire.html';label='Continue into Tarangire →';
    }else if(answers.onward==='rift'){
      copy+=' Your onward direction makes Manyara useful as the beginning of a larger Rift narrative rather than an isolated park visit.';
      href='great-rift.html';label='Continue into the Great Rift →';
    }

    result.innerHTML=
      '<span class="my-kicker">First direction</span>'+
      '<h3>'+esc(title)+'</h3>'+
      '<p>'+esc(copy)+'</p>'+
      '<p>Tree-climbing lions, flamingo concentrations and activity availability remain condition-dependent.</p>'+
      '<a href="'+href+'">'+esc(label)+'</a>';
  }

  document.querySelectorAll('.my-q').forEach(function(q){
    var key=q.dataset.k;
    q.querySelectorAll('button').forEach(function(b){
      b.addEventListener('click',function(){
        answers[key]=b.dataset.v;
        q.querySelectorAll('button').forEach(function(x){x.classList.toggle('active',x===b);});
        recommendation();
      });
    });
  });

  fetch('data/manyara.json',{cache:'no-store'})
    .then(function(r){if(!r.ok)throw new Error('Manyara data unavailable');return r.json();})
    .then(function(d){data=d;renderHabitatNav();renderSeasons();renderDepth();renderRoutes();})
    .catch(function(){if(habitatNav)habitatNav.innerHTML='<p style="padding:1rem;font-size:12px">Lake Manyara content could not be loaded.</p>';});
})();