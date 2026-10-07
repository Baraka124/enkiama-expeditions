(function(){
  var data=null;
  var nav=document.getElementById('stLayerNav');
  var panel=document.getElementById('stLayerPanel');
  var timeGrid=document.getElementById('stTimeGrid');
  var modes=document.getElementById('stModes');
  var routes=document.getElementById('stRoutes');
  var result=document.getElementById('stResult');
  var answers={};

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(ch){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch];});}
  function getLayer(slug){return data.city_layers.find(function(x){return x.slug===slug;});}

  function renderLayer(x){
    if(!x||!panel)return;
    document.querySelectorAll('.st-layer').forEach(function(b){b.classList.toggle('active',b.dataset.slug===x.slug);});
    panel.innerHTML=
      '<span class="st-layer__type">'+esc(x.role)+'</span>'+
      '<h3>'+esc(x.name)+'</h3>'+
      '<p class="st-layer-panel__summary">'+esc(x.summary)+'</p>'+
      '<div class="st-layer-stats">'+
        '<div class="st-layer-stat"><span>Strongest use</span><strong>'+esc(x.strongest_use)+'</strong></div>'+
        '<div class="st-layer-stat"><span>What to notice</span><strong>'+esc(x.what_to_notice)+'</strong></div>'+
        '<div class="st-layer-stat"><span>Experience</span><strong>'+esc(x.experience)+'</strong></div>'+
      '</div>'+
      '<div class="st-layer-grid">'+
        '<div><h4>Best for</h4><p>'+esc(x.best_for.join(' · '))+'</p></div>'+
        '<div><h4>Trade-off</h4><p>'+esc(x.tradeoff)+'</p></div>'+
        '<div><h4>Guide value</h4><p>Use local interpretation when history, architecture or memory needs context. Then leave enough unstructured time for the city to become more than a guided route.</p></div>'+
        '<div><h4>Enkiama stance</h4><p>Do not turn this layer into a checklist of monuments. Its value comes from how it changes the reading of the whole city.</p></div>'+
      '</div>';
  }

  function renderNav(){
    nav.innerHTML=data.city_layers.map(function(x){
      return '<button class="st-layer" data-slug="'+esc(x.slug)+'"><div class="st-layer__top"><span class="st-layer__name">'+esc(x.name)+'</span><span class="st-layer__use">'+esc(x.strongest_use)+'</span></div><div class="st-layer__meta">'+esc(x.role)+'</div></button>';
    }).join('');
    nav.querySelectorAll('.st-layer').forEach(function(b){b.addEventListener('click',function(){renderLayer(getLayer(b.dataset.slug));});});
    renderLayer(getLayer('urban-fabric'));
  }

  function renderTimeModes(){
    timeGrid.innerHTML=data.time_shapes.map(function(t){
      return '<article class="st-time-card"><span>'+esc(t.stance)+'</span><strong>'+esc(t.shape)+'</strong><p>'+esc(t.note)+'</p></article>';
    }).join('');
    modes.innerHTML=data.visit_modes.map(function(m){
      return '<article><span class="st-kicker">'+esc(m.status)+'</span><strong>'+esc(m.name)+'</strong><p>'+esc(m.note)+'</p></article>';
    }).join('');
  }

  function renderRoutes(){
    routes.innerHTML=data.route_shapes.map(function(r){
      return '<article class="st-route"><span class="st-kicker">'+esc(r.label)+'</span><h3>'+esc(r.label)+'</h3><p>'+esc(r.note)+'</p><ol>'+r.sequence.map(function(s){return '<li>'+esc(s)+'</li>';}).join('')+'</ol><small>'+esc(r.best_for.join(' · '))+'</small></article>';
    }).join('');
  }

  function recommendation(){
    if(!answers.time||!answers.interest||!answers.guide||!answers.onward)return;
    var title='',copy='',href='#layers',label='Review the Stone Town layers →';

    if(answers.time==='hours'){
      title='Keep it focused.';
      copy='Three to four hours can support one strong guided theme, but not the whole city. Choose either history/architecture or a lighter orientation and avoid pretending the visit is complete.';
    }else if(answers.time==='1'){
      title='One night is the strongest default.';
      copy='One overnight creates room for a guided walk plus evening public life and independent wandering. This is the best general shape before moving to the coast.';
    }else if(answers.time==='2'){
      title='Two nights gives Stone Town real depth.';
      copy='Two nights lets you separate architecture/history from food, markets and unstructured city time instead of compressing everything into one long guided day.';
    }else{
      title='Three or more nights only if the city itself matters.';
      copy='Additional time should be earned by genuine interests in architecture, food, photography, urban history or research rather than treated as an automatic upgrade.';
    }

    if(answers.interest==='history'){
      copy+=' Historical interpretation should include Indian Ocean trade, slavery and abolition with factual restraint and local guidance.';
    }else if(answers.interest==='architecture'){
      copy+=' Architecture is strongest when doors, houses, shopfronts and materials are read as evidence of exchange and urban life rather than decorative folklore.';
    }else if(answers.interest==='food'){
      copy+=' Give the evening real space; Stone Town becomes noticeably different after the heat drops and public life moves toward the seafront.';
    }else{
      copy+=' A lighter orientation is valid if Stone Town is only meant to give context before the beach.';
    }

    if(answers.guide==='guided'){
      copy+=' Use a knowledgeable local guide first, but keep at least some unstructured time afterwards so the city does not become only a narrated route.';
    }else if(answers.guide==='mix'){
      copy+=' Guide + wander is the strongest default: interpretation first, then independent time once the city has context.';
    }else{
      copy+=' Independent wandering can be rewarding, but the historical and architectural layers will be much thinner without local interpretation.';
    }

    if(answers.onward==='north'){
      copy+=' Moving next to the north creates a clean urban-to-easy-swimming contrast.';
      href='zanzibar.html#zones';label='Compare the north coast →';
    }else if(answers.onward==='east'){
      copy+=' Moving next to the east/south-east creates a sharper contrast between dense city fabric and open, tide-led beach.';
      href='zanzibar.html#zones';label='Compare the east coast →';
    }else if(answers.onward==='depart'||answers.onward==='none'){
      copy+=' Because there is no beach transition to absorb the city, protect enough time for Stone Town to stand on its own rather than become a transfer stop.';
    }

    result.innerHTML=
      '<span class="st-kicker">First direction</span>'+
      '<h3>'+esc(title)+'</h3>'+
      '<p>'+esc(copy)+'</p>'+
      '<p>Major-site access and conservation work can change, so specific interiors should be checked close to travel rather than hard-coded into the itinerary.</p>'+
      '<a href="'+href+'">'+esc(label)+'</a>';
  }

  document.querySelectorAll('.st-q').forEach(function(q){
    var key=q.dataset.k;
    q.querySelectorAll('button').forEach(function(b){
      b.addEventListener('click',function(){
        answers[key]=b.dataset.v;
        q.querySelectorAll('button').forEach(function(x){x.classList.toggle('active',x===b);});
        recommendation();
      });
    });
  });

  fetch('data/stonetown.json',{cache:'no-store'})
    .then(function(r){if(!r.ok)throw new Error('Stone Town data unavailable');return r.json();})
    .then(function(d){data=d;renderNav();renderTimeModes();renderRoutes();})
    .catch(function(){if(nav)nav.innerHTML='<p style="padding:1rem;font-size:12px">Stone Town content could not be loaded.</p>';});
})();