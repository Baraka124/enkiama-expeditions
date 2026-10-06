(function(){
  var catalogue=null;
  var nav=document.getElementById('kmRouteNav');
  var panel=document.getElementById('kmRoutePanel');
  var result=document.getElementById('kmResult');
  var answers={};

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(ch){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch];});}
  function find(slug){return catalogue&&catalogue.routes.find(function(r){return r.slug===slug;});}
  function renderRoute(r){
    if(!r||!panel)return;
    document.querySelectorAll('.km-route').forEach(function(b){b.classList.toggle('active',b.dataset.slug===r.slug);});
    panel.innerHTML=
      '<span class="km-route__tag">'+esc(r.badge)+'</span>'+
      '<h3>'+esc(r.name)+'</h3>'+
      '<p class="km-route__summary">'+esc(r.summary)+'</p>'+
      '<div class="km-route__stats">'+
        '<div class="km-route__stat"><span>Recommended</span><strong>'+esc(r.recommended_days)+' days</strong></div>'+
        '<div class="km-route__stat"><span>Approach</span><strong>'+esc(r.approach)+'</strong></div>'+
        '<div class="km-route__stat"><span>Acclimatisation</span><strong>'+esc(r.acclimatisation)+'</strong></div>'+
        '<div class="km-route__stat"><span>Overnight</span><strong>'+esc(r.overnight)+'</strong></div>'+
      '</div>'+
      '<div class="km-route__why">'+
        '<div><h4>Why Enkiama would choose it</h4><p>'+esc(r.why_enkiama)+'</p></div>'+
        '<div><h4>Trade-off</h4><p>'+esc(r.caution)+'</p></div>'+
      '</div>'+
      '<div class="km-route__stages"><p class="km-route__stages-label">Typical route sequence</p><div class="km-route__line">'+r.stages.map(function(s){return '<span>'+esc(s)+'</span>';}).join('')+'</div><p style="margin-top:1.5rem"><a href="kilimanjaro-route.html?route='+encodeURIComponent(r.slug)+'" style="font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:inherit">Open full '+esc(r.name)+' dossier →</a></p></div>';
  }
  function renderNav(){
    nav.innerHTML=catalogue.routes.map(function(r){
      return '<button class="km-route" data-slug="'+esc(r.slug)+'"><div class="km-route__top"><span class="km-route__name">'+esc(r.name)+'</span><span class="km-route__days">'+esc(r.recommended_days)+' days</span></div><div class="km-route__meta">'+esc(r.badge)+' · '+esc(r.acclimatisation)+'</div></button>';
    }).join('');
    nav.querySelectorAll('.km-route').forEach(function(b){b.addEventListener('click',function(){renderRoute(find(b.dataset.slug));});});
    renderRoute(find('lemosho'));
  }

  function score(r){
    var s=0;
    var days=Number(answers.days||0);
    if(days){
      if(r.recommended_days===days)s+=6;
      else if(Math.abs(r.recommended_days-days)===1)s+=2;
      else s-=3;
    }
    if(answers.priority==='acclimatisation'){
      if(r.slug==='northern-circuit')s+=7;if(r.slug==='lemosho')s+=6;if(r.slug==='machame')s+=3;if(r.slug==='umbwe'||r.slug==='shira')s-=4;
    }
    if(answers.priority==='scenery'){
      if(r.slug==='lemosho')s+=7;if(r.slug==='northern-circuit')s+=6;if(r.slug==='machame')s+=5;
    }
    if(answers.priority==='quiet'){
      if(r.slug==='northern-circuit')s+=8;if(r.slug==='rongai')s+=6;if(r.slug==='lemosho')s+=3;if(r.slug==='machame'||r.slug==='marangu')s-=3;
    }
    if(answers.priority==='classic'){
      if(r.slug==='machame')s+=8;if(r.slug==='lemosho')s+=4;if(r.slug==='marangu')s+=2;
    }
    if(answers.camp==='huts'){ if(r.slug==='marangu')s+=12; else s-=4; }
    if(answers.camp==='camping' && r.slug==='marangu')s-=5;
    if(answers.experience==='first'){
      if(['lemosho','northern-circuit','machame','rongai'].includes(r.slug))s+=3;
      if(['shira','umbwe'].includes(r.slug))s-=8;
    }
    if(answers.experience==='experienced'){
      if(['northern-circuit','shira','umbwe'].includes(r.slug))s+=2;
    }
    if(r.stance==='preferred')s+=2;
    if(r.stance==='recommended')s+=1;
    if(r.stance==='specialist' && answers.experience!=='experienced')s-=8;
    return s;
  }
  function updateResult(){
    if(!catalogue||Object.keys(answers).length<4)return;
    var ranked=catalogue.routes.map(function(r){return {r:r,s:score(r)};}).sort(function(a,b){return b.s-a.s;});
    var top=ranked[0].r,alt=ranked[1].r;
    var reasons=[];
    if(Number(answers.days)===top.recommended_days)reasons.push('your available mountain days match its preferred pacing');
    if(answers.priority==='acclimatisation')reasons.push('you prioritised acclimatisation');
    if(answers.priority==='quiet')reasons.push('you asked for a quieter trail');
    if(answers.priority==='scenery')reasons.push('you prioritised scenery');
    if(answers.priority==='classic')reasons.push('you asked for a classic route');
    if(answers.camp==='huts'&&top.slug==='marangu')reasons.push('you prefer huts rather than camping');
    if(answers.experience==='first'&&['lemosho','northern-circuit','machame','rongai'].includes(top.slug))reasons.push('its profile is more suitable for a first high-altitude trek than our specialist lines');
    if(!reasons.length)reasons.push('it gives the strongest overall match across your answers');
    result.innerHTML='<span class="km-eye">First direction</span><h3>'+esc(top.recommended_days)+'-day '+esc(top.name)+'</h3><p><strong>Why:</strong> '+esc(reasons.join('; '))+'.</p><p>'+esc(top.fit)+'</p><p><strong>Compare with '+esc(alt.name)+':</strong> '+esc(alt.fit)+'</p><p>This is a route-direction result, not a fitness or medical clearance.</p><a href="kilimanjaro-route.html?route='+encodeURIComponent(top.slug)+'">Open the '+esc(top.name)+' dossier →</a> <a href="#routes" id="kmSeeRoute" style="margin-left:1rem">Compare in atlas →</a>';
    var a=document.getElementById('kmSeeRoute');if(a)a.addEventListener('click',function(){renderRoute(top);});
  }

  document.querySelectorAll('.km-question').forEach(function(q){
    var key=q.dataset.key;
    q.querySelectorAll('button').forEach(function(b){
      b.addEventListener('click',function(){
        answers[key]=b.dataset.v;
        q.querySelectorAll('button').forEach(function(x){x.classList.toggle('active',x===b);});
        updateResult();
      });
    });
  });

  fetch('data/kilimanjaro-routes.json',{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('route catalogue unavailable');return r.json();}).then(function(data){catalogue=data;renderNav();}).catch(function(){
    if(nav)nav.innerHTML='<p style="padding:1rem;font-size:12px">Route catalogue could not be loaded.</p>';
  });
})();