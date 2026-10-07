(function(){
  'use strict';

  var DATA_URL='data/enkiama-live.json';
  var root=document.querySelector('.ev');
  if(!root) return;

  function qs(name){return new URLSearchParams(location.search).get(name);}
  function safe(v){return String(v==null?'':v);}
  function esc(v){return safe(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}

  function gradeClass(grade){
    if(grade==='A') return 'full';
    if(grade==='B') return 'frame';
    return 'sheet';
  }

  function buildScene(moment,index,total){
    var media=(moment.media||[]);
    var cls='ev-scene '+(moment.layout||gradeClass(media[0]&&media[0].grade));
    if(index===0) cls+=' active';
    var attrs=' data-chapter="'+esc('Enkiama Live · '+(moment.place||'Journey'))+'"'+
      ' data-kicker="'+esc(moment.kicker||'')+'"'+
      ' data-title="'+esc(moment.title||'')+'"'+
      ' data-note="'+esc(moment.note||'')+'"'+
      ' data-meta="'+esc(moment.place||'Enkiama Live')+'"';
    if(moment.route) attrs+=' data-route="'+esc(moment.route)+'"';
    if(moment.evidence) attrs+=' data-evidence="'+esc(moment.evidence)+'"';
    if(moment.fieldGuide) attrs+=' data-field-guide="'+esc(moment.fieldGuide)+'"';

    var html='<section class="'+cls+'"'+attrs+'>';
    if(moment.layout==='sheet'){
      html+='<div class="ev-contact" aria-hidden="true">';
      media.slice(0,3).forEach(function(m){
        html+='<figure><img src="'+esc(m.src)+'" alt=""><figcaption>'+esc(m.caption||'')+'</figcaption></figure>';
      });
      html+='</div>';
    }else if(media[0]){
      html+='<div class="ev-media" style="background-image:url(\''+esc(media[0].src)+'\')" aria-hidden="true"></div>';
    }
    if(moment.layout==='route'){
      html+='<div class="ev-atlas" aria-hidden="true"><svg viewBox="0 0 1000 120" preserveAspectRatio="none"><path d="M30,83 C170,24 270,28 365,60 S565,100 690,69 S835,40 968,27"></path><circle cx="30" cy="83" r="4"></circle><circle cx="255" cy="38" r="4"></circle><circle cx="445" cy="82" r="4"></circle><circle cx="690" cy="69" r="4"></circle><circle cx="968" cy="27" r="4"></circle></svg></div>';
    }
    html+='</section>';
    return html;
  }

  function buildStory(story){
    var moments=(story.moments||[]).filter(function(m){return m.visibility==='public';});
    if(!moments.length) return false;
    var first=root.querySelector('.ev-scene');
    if(!first) return false;
    var scenes=[].slice.call(root.querySelectorAll('.ev-scene'));
    scenes.forEach(function(s){s.remove();});
    var marker=root.querySelector('.ev-top');
    marker.insertAdjacentHTML('beforebegin',moments.map(buildScene).join(''));
    document.documentElement.dataset.liveStory=story.id;
    return true;
  }

  function renderIndex(data){
    var panel=document.getElementById('evLivePanel');
    if(!panel) return;
    var stories=(data.stories||[]).filter(function(s){return s.visibility==='public';});
    var html='<div class="ev-live-panel__head"><span>Enkiama Live</span><button type="button" id="evLiveClose" aria-label="Close Live index">×</button></div>';
    html+='<div class="ev-live-panel__channels">';
    (data.channels||[]).forEach(function(c){
      html+='<button type="button" class="ev-live-channel" data-channel="'+esc(c.id)+'"><strong>'+esc(c.label)+'</strong><span>'+esc(c.description)+'</span></button>';
    });
    html+='</div><div class="ev-live-panel__stories">';
    stories.forEach(function(s){
      html+='<a href="?story='+encodeURIComponent(s.slug||s.id)+'"><span>'+esc(s.status)+'</span><strong>'+esc(s.title)+'</strong><small>'+esc((s.route||[]).join(' → '))+'</small></a>';
    });
    html+='</div>';
    panel.innerHTML=html;
    var close=document.getElementById('evLiveClose');
    if(close) close.addEventListener('click',function(){panel.classList.remove('open');});
  }

  function renderFieldGuide(data,id){
    var guide=data.fieldGuides&&data.fieldGuides[id];
    var panel=document.getElementById('evFieldGuide');
    if(!guide||!panel) return;
    panel.innerHTML='<div class="ev-field__head"><span>'+esc(guide.title)+'</span><button type="button" id="evFieldClose" aria-label="Close field guide">×</button></div>'+
      '<div class="ev-field__items">'+guide.items.map(function(item){
        return '<article><span>'+esc(item.kind)+'</span><strong>'+esc(item.name)+'</strong><p>'+esc(item.fact)+'</p></article>';
      }).join('')+'</div>';
    panel.classList.add('open');
    var close=document.getElementById('evFieldClose');
    if(close) close.addEventListener('click',function(){panel.classList.remove('open');});
  }

  function bindLive(data){
    renderIndex(data);
    var trigger=document.getElementById('evLiveOpen');
    var panel=document.getElementById('evLivePanel');
    if(trigger&&panel) trigger.addEventListener('click',function(){panel.classList.toggle('open');});

    document.addEventListener('click',function(e){
      var btn=e.target.closest('[data-field-guide]');
      if(btn) renderFieldGuide(data,btn.getAttribute('data-field-guide'));
    });
  }

  fetch(DATA_URL).then(function(r){if(!r.ok) throw new Error('live data unavailable'); return r.json();}).then(function(data){
    var storyKey=qs('story');
    if(storyKey){
      var story=(data.stories||[]).find(function(s){return s.id===storyKey||s.slug===storyKey;});
      if(story) buildStory(story);
    }
    window.EnkiamaLiveData=data;
    bindLive(data);
    document.dispatchEvent(new CustomEvent('enkiama-live-ready',{detail:{story:storyKey||null}}));
  }).catch(function(){ /* static cinematic fallback remains fully functional */ });
})();