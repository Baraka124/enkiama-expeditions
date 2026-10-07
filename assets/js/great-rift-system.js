(function(){
  var data=null;
  var nodes=document.getElementById('rgNodes');
  var panel=document.getElementById('rgPanel');
  var routes=document.getElementById('rgRoutes');
  var factors=document.getElementById('rgFactors');
  var result=document.getElementById('rgResult');
  var answers={};

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(ch){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch];});}

  function renderNode(x){
    if(!x||!panel)return;
    document.querySelectorAll('.rg-node').forEach(function(b){b.classList.toggle('active',b.dataset.slug===x.slug);});
    var status=x.activity_status==='conditional'
      ? '<div><h4>Availability</h4><p>Conditional. Current volcanic, route and local safety conditions must be checked close to travel.</p></div>'
      : '<div><h4>Why it belongs</h4><p>'+esc(x.fit)+'</p></div>';
    panel.innerHTML=
      '<span class="rg-node__type">'+esc(x.role)+'</span>'+
      '<h3>'+esc(x.name)+'</h3>'+
      '<p class="rg-panel__summary">'+esc(x.summary)+'</p>'+
      '<div class="rg-panel__grid">'+
        '<div><h4>Journey value</h4><p>'+esc(x.fit)+'</p></div>'+
        status+
      '</div>';
  }

  function renderNodes(){
    nodes.innerHTML=data.core_places.map(function(x){
      return '<button class="rg-node" data-slug="'+esc(x.slug)+'"><div class="rg-node__top"><span class="rg-node__name">'+esc(x.name)+'</span><span class="rg-node__role">'+esc(x.type)+'</span></div><span class="rg-node__type">'+esc(x.role)+'</span></button>';
    }).join('');
    nodes.querySelectorAll('.rg-node').forEach(function(b){
      b.addEventListener('click',function(){renderNode(data.core_places.find(function(x){return x.slug===b.dataset.slug;}));});
    });
    renderNode(data.core_places[0]);
  }

  function renderRoutes(){
    routes.innerHTML=data.journey_directions.map(function(r){
      return '<article class="rg-route"><span>'+esc(r.days)+'</span><h3>'+esc(r.label)+'</h3><p>'+esc(r.best_for.join(' · '))+'</p><ol>'+r.sequence.map(function(s){return '<li>'+esc(s)+'</li>';}).join('')+'</ol><small>Onward: '+esc(r.onward.join(' · '))+'</small></article>';
    }).join('');
  }

  function renderFactors(){
    factors.innerHTML=data.decision_factors.map(function(f){
      return '<article class="rg-choice"><span class="rg-choice__label">'+esc(f.label)+'</span><strong>'+esc(f.label)+'</strong><p>'+esc(f.note)+'</p></article>';
    }).join('');
  }

  function recommendation(){
    if(!answers.time||!answers.pull||!answers.comfort)return;
    var title,copy,href,label;
    if(answers.time==='one'){
      title='Do not force Natron into this route.';
      copy='With only one transfer day, the Rift is more likely to become a long road segment than a destination. Keep the journey cleaner unless Natron itself is the priority.';
      href='compose.html';label='Return to the wider composer →';
    }else if(answers.comfort==='avoid'&&answers.time!=='four'){
      title='Consider a softer Rift edge.';
      copy='Your interest fits the region, but limited tolerance for rougher road time makes a full Natron corridor less convincing. Ngorongoro, Manyara or the Kilimanjaro foothills may preserve the context with easier logistics.';
      href='ngorongoro.html';label='Explore the highlands instead →';
    }else if(answers.pull==='lengai'){
      title='Build around Natron, not only the climb.';
      copy='Lengai is an active volcano, so any ascent remains conditional. A stronger plan gives Lake Natron and the Rift their own time even if climbing is ruled out close to travel.';
      href='#corridor';label='Review the Lengai context →';
    }else if(answers.time==='four'){
      title='The Rift earns a real chapter.';
      copy='Four or more days allows Engaruka, Natron and the human landscape to work as destinations rather than transfer stops. This is where the corridor becomes one of the journey’s defining changes of rhythm.';
      href='trip.html?slug=july-five-travellers-2026';label='See how Natron worked in July 2026 →';
    }else{
      title='A 2–3 day Natron chapter can make sense.';
      copy='Your available time is enough if the route is built deliberately and current road conditions support it. Keep the itinerary selective rather than trying to add every Rift stop.';
      href='#corridor';label='Compare the corridor nodes →';
    }
    result.innerHTML='<span class="rg-kicker">First direction</span><h3>'+esc(title)+'</h3><p>'+esc(copy)+'</p><a href="'+href+'">'+esc(label)+'</a>';
  }

  document.querySelectorAll('.rg-q').forEach(function(q){
    var key=q.dataset.k;
    q.querySelectorAll('button').forEach(function(b){
      b.addEventListener('click',function(){
        answers[key]=b.dataset.v;
        q.querySelectorAll('button').forEach(function(x){x.classList.toggle('active',x===b);});
        recommendation();
      });
    });
  });

  fetch('data/great-rift.json',{cache:'no-store'})
    .then(function(r){if(!r.ok)throw new Error('Great Rift data unavailable');return r.json();})
    .then(function(d){data=d;renderNodes();renderRoutes();renderFactors();})
    .catch(function(){
      if(nodes)nodes.innerHTML='<p style="padding:1rem;font-size:12px">Great Rift content could not be loaded.</p>';
    });
})();