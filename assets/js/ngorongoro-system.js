(function(){
  var data=null;
  var contextNav=document.getElementById('ngContextNav');
  var contextPanel=document.getElementById('ngContextPanel');
  var routes=document.getElementById('ngRoutes');
  var factors=document.getElementById('ngFactors');
  var journeys=document.getElementById('ngJourneys');
  var result=document.getElementById('ngResult');
  var answers={};

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(ch){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch];});}
  function getContext(slug){return data.contexts.find(function(x){return x.slug===slug;});}

  function renderContext(x){
    if(!x||!contextPanel)return;
    document.querySelectorAll('.ng-context').forEach(function(b){b.classList.toggle('active',b.dataset.slug===x.slug);});
    contextPanel.innerHTML=
      '<span class="ng-context__type">'+esc(x.role)+'</span>'+
      '<h3>'+esc(x.name)+'</h3>'+
      '<p class="ng-context-panel__summary">'+esc(x.summary)+'</p>'+
      '<div class="ng-context-stats">'+
        '<div class="ng-context-stat"><span>Strongest use</span><strong>'+esc(x.strongest_use)+'</strong></div>'+
        '<div class="ng-context-stat"><span>Experience</span><strong>'+esc(x.experience)+'</strong></div>'+
        '<div class="ng-context-stat"><span>Planning</span><strong>'+esc(x.planning)+'</strong></div>'+
      '</div>'+
      '<div class="ng-context-grid">'+
        '<div><h4>Wildlife / landscape</h4><p>'+esc(x.wildlife)+'</p></div>'+
        '<div><h4>Trade-off</h4><p>'+esc(x.tradeoff)+'</p></div>'+
        '<div><h4>Best for</h4><p>'+esc(x.best_for.join(' · '))+'</p></div>'+
        '<div><h4>Enkiama stance</h4><p>Use this context only when it genuinely improves the route. More Ngorongoro is not automatically better Ngorongoro.</p></div>'+
      '</div>';
  }

  function renderContextNav(){
    contextNav.innerHTML=data.contexts.map(function(x){
      return '<button class="ng-context" data-slug="'+esc(x.slug)+'"><div class="ng-context__top"><span class="ng-context__name">'+esc(x.name)+'</span><span class="ng-context__use">'+esc(x.strongest_use)+'</span></div><div class="ng-context__meta">'+esc(x.role)+'</div></button>';
    }).join('');
    contextNav.querySelectorAll('.ng-context').forEach(function(b){
      b.addEventListener('click',function(){renderContext(getContext(b.dataset.slug));});
    });
    renderContext(getContext('crater-floor'));
  }

  function renderRoutes(){
    routes.innerHTML=data.route_shapes.map(function(r){
      return '<article class="ng-route"><span class="ng-route__label">'+esc(r.minimum_shape)+'</span><h3>'+esc(r.label)+'</h3><p>'+esc(r.note)+'</p><ol>'+r.sequence.map(function(s){return '<li>'+esc(s)+'</li>';}).join('')+'</ol><small>'+esc(r.best_for.join(' · '))+'</small></article>';
    }).join('');
  }

  function renderFactors(){
    factors.innerHTML=data.planning_factors.map(function(f){
      return '<article class="ng-choice"><span class="ng-choice__label">'+esc(f.label)+'</span><strong>'+esc(f.label)+'</strong><p>'+esc(f.note)+'</p></article>';
    }).join('');
  }

  function renderJourneys(){
    journeys.innerHTML=data.operated_evidence.map(function(j){
      return '<a class="ng-journey" href="'+esc(j.href)+'"><span class="ng-journey__label">'+esc(j.label)+'</span><h3>'+esc(j.title)+'</h3><p>'+esc(j.insight)+'</p><small>Open operated journey →</small></a>';
    }).join('');
  }

  function recommendation(){
    if(!answers.time||!answers.priority||!answers.onward)return;
    var title='',copy='',href='#contexts',label='Review the Ngorongoro contexts →';

    if(answers.time==='1'){
      title='Keep Ngorongoro focused.';
      copy='With one night, one well-timed crater descent is usually the strongest use of the area. Protect the next destination rather than squeezing in a token highland stop.';
      if(answers.priority!=='wildlife'){
        copy+=' Your interest goes beyond the crater, but the available time is too compressed to do that context justice.';
      }
    }else if(answers.time==='2'){
      if(answers.priority==='walking'){
        title='Crater + one highland layer.';
        copy='Two nights can support one crater descent plus a carefully chosen Olmoti, Empakaai or highland context, subject to current access and ranger requirements.';
      }else if(answers.priority==='history'){
        title='Crater + deep-time context.';
        copy='Two nights can pair the crater with Olduvai or another properly interpreted archaeological layer if the onward route supports it.';
      }else if(answers.priority==='culture'){
        title='Crater + lived landscape context.';
        copy='Two nights can create room to understand the wider conservation area beyond wildlife, but any community encounter should be locally arranged and current to the social context.';
      }else{
        title='One descent, then keep moving.';
        copy='Two nights is enough to enjoy the rim, descend once and preserve a calm onward route. A second crater day is rarely the first place we would spend the extra time.';
      }
    }else{
      if(answers.priority==='walking'){
        title='Make Ngorongoro a highland chapter.';
        copy='Three or more nights can justify crater, rim and a proper volcanic-highland walking component rather than treating Olmoti or Empakaai as an afterthought.';
      }else if(answers.priority==='history'){
        title='Build a conservation + archaeology chapter.';
        copy='Three or more nights gives enough room for wildlife and deep-time context without reducing Olduvai or Laetoli to a quick roadside reference.';
      }else if(answers.priority==='culture'){
        title='Use the wider conservation area, not only the floor.';
        copy='The extra time is most valuable when it helps read Ngorongoro as a lived, multiple-use landscape rather than simply adding more crater hours.';
      }else{
        title='Use the extra nights for contrast.';
        copy='With three or more nights, we would normally broaden the experience into rim, highlands or onward landscape rather than repeat the crater.';
      }
    }

    if(answers.onward==='serengeti'){
      copy+=' Because you continue to Serengeti, preserve the westward flow and avoid additions that create unnecessary backtracking.';
      href='serengeti.html';label='Continue into Serengeti →';
    }else if(answers.onward==='rift'){
      copy+=' Your onward direction makes the northern highlands and Rift connection strategically more interesting than a standard circuit return.';
      href='great-rift.html';label='Continue into the Great Rift →';
    }else if(answers.onward==='south'){
      copy+=' A southward return can make Karatu, Manyara or Tarangire more useful than extending deeper into the northern highlands.';
      href='manyara.html';label='Continue toward Lake Manyara →';
    }

    result.innerHTML=
      '<span class="ng-kicker">First direction</span>'+
      '<h3>'+esc(title)+'</h3>'+
      '<p>'+esc(copy)+'</p>'+
      '<p>Current NCAA access, ranger and site rules should still be checked close to travel.</p>'+
      '<a href="'+href+'">'+esc(label)+'</a>';
  }

  document.querySelectorAll('.ng-q').forEach(function(q){
    var key=q.dataset.k;
    q.querySelectorAll('button').forEach(function(b){
      b.addEventListener('click',function(){
        answers[key]=b.dataset.v;
        q.querySelectorAll('button').forEach(function(x){x.classList.toggle('active',x===b);});
        recommendation();
      });
    });
  });

  fetch('data/ngorongoro.json',{cache:'no-store'})
    .then(function(r){if(!r.ok)throw new Error('Ngorongoro data unavailable');return r.json();})
    .then(function(d){data=d;renderContextNav();renderRoutes();renderFactors();renderJourneys();})
    .catch(function(){if(contextNav)contextNav.innerHTML='<p style="padding:1rem;font-size:12px">Ngorongoro content could not be loaded.</p>';});
})();