(function(){
  var bar=document.getElementById('ehBar')||document.querySelector('.exp-nav')||document.querySelector('.route-nav');
  var overlay=document.getElementById('ehOverlay');
  if(!bar)return;

  if(!document.getElementById('kilimanjaro-reading-header-style')){
    var style=document.createElement('style');
    style.id='kilimanjaro-reading-header-style';
    style.textContent=
      '.eh-bar,.exp-nav,.route-nav{will-change:transform;transform:translate3d(0,0,0);transition:transform .28s cubic-bezier(.16,1,.3,1);}'+
      '.eh-bar.km-yield,.exp-nav.km-yield,.route-nav.km-yield{transform:translate3d(0,calc(-100% - 12px),0)!important;pointer-events:none;}'+
      '@media(max-height:520px) and (orientation:landscape){.eh-bar,.exp-nav,.route-nav{position:absolute!important;transform:none!important;}}'+
      '@media(prefers-reduced-motion:reduce){.eh-bar,.exp-nav,.route-nav{transition:none!important;}}';
    document.head.appendChild(style);
  }

  var shortLandscape=window.matchMedia&&window.matchMedia('(max-height:520px) and (orientation:landscape)');
  var lastY=window.scrollY||0;
  var ticking=false;
  var anchorLandingLocked=false;
  var intent=0;
  var INTENT_THRESHOLD=28;

  function update(){
    var y=window.scrollY||0;
    var delta=y-lastY;
    var menuOpen=overlay&&overlay.classList.contains('open');

    if(Math.abs(delta)>1){
      if((intent>0&&delta<0)||(intent<0&&delta>0))intent=0;
      intent+=delta;
      intent=Math.max(-INTENT_THRESHOLD*2,Math.min(INTENT_THRESHOLD*2,intent));
    }

    if(anchorLandingLocked){
      bar.classList.remove('km-yield');intent=0;
    }else if(shortLandscape&&shortLandscape.matches){
      bar.classList.remove('km-yield');intent=0;
    }else if(menuOpen||y<110){
      bar.classList.remove('km-yield');intent=0;
    }else if(intent>=INTENT_THRESHOLD){
      bar.classList.add('km-yield');intent=0;
    }else if(intent<=-INTENT_THRESHOLD){
      bar.classList.remove('km-yield');intent=0;
    }
    lastY=y;
    ticking=false;
  }

  window.addEventListener('scroll',function(){
    if(!ticking){
      ticking=true;
      requestAnimationFrame(update);
    }
  },{passive:true});

  bar.addEventListener('focusin',function(){bar.classList.remove('km-yield');intent=0;});

  if(overlay){
    new MutationObserver(function(){
      if(overlay.classList.contains('open'))bar.classList.remove('km-yield');
    }).observe(overlay,{attributes:true,attributeFilter:['class']});
  }

  if(shortLandscape&&shortLandscape.addEventListener){
    shortLandscape.addEventListener('change',update);
  }

  /* 28A: make direct/hash returns land as complete editorial sections.
     CSS scroll-margin handles normal navigation; this settles initial/hashchange
     after layout and fonts have finished moving the document. */
  function phase28aAnchorLanding(){
    if(!location.hash)return;
    var id=decodeURIComponent(location.hash.slice(1));
    if(!['routes','formats','standard','operations','evidence','mountain-composer'].includes(id))return;
    var target=document.getElementById(id);
    if(!target)return;
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        var shortMode=shortLandscape&&shortLandscape.matches;
        var reserve=shortMode?24:Math.min(Math.max(bar.getBoundingClientRect().height+24,82),124);
        var top=target.getBoundingClientRect().top+(window.scrollY||0)-reserve;
        anchorLandingLocked=true;
        window.scrollTo({top:Math.max(0,top),behavior:'auto'});
        lastY=window.scrollY||0;
        bar.classList.remove('km-yield');
      });
    });
  }

  function releaseAnchorLandingLock(){
    anchorLandingLocked=false;
  }
  window.addEventListener('wheel',releaseAnchorLandingLock,{passive:true});
  window.addEventListener('touchstart',releaseAnchorLandingLock,{passive:true});
  window.addEventListener('pointerdown',releaseAnchorLandingLock,{passive:true});
  window.addEventListener('keydown',releaseAnchorLandingLock);

  window.addEventListener('hashchange',phase28aAnchorLanding);
  if(document.readyState==='complete')phase28aAnchorLanding();
  else window.addEventListener('load',phase28aAnchorLanding,{once:true});
})();
