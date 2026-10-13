(function(){
  var bar=document.getElementById('ehBar')||document.querySelector('.exp-nav');
  var overlay=document.getElementById('ehOverlay');
  if(!bar)return;

  if(!document.getElementById('kilimanjaro-reading-header-style')){
    var style=document.createElement('style');
    style.id='kilimanjaro-reading-header-style';
    style.textContent=
      '.eh-bar,.exp-nav{will-change:transform;}'+
      '.eh-bar.km-yield,.exp-nav.km-yield{transform:translateY(calc(-100% - 12px))!important;pointer-events:none;}'+
      '@media(max-height:520px) and (orientation:landscape){.eh-bar,.exp-nav{position:absolute!important;transform:none!important;}}'+
      '@media(prefers-reduced-motion:reduce){.eh-bar,.exp-nav{transition:none!important;}}';
    document.head.appendChild(style);
  }

  var shortLandscape=window.matchMedia&&window.matchMedia('(max-height:520px) and (orientation:landscape)');
  var lastY=window.scrollY||0;
  var ticking=false;
  var anchorLandingLocked=false;

  function update(){
    var y=window.scrollY||0;
    var delta=y-lastY;
    var menuOpen=overlay&&overlay.classList.contains('open');

    if(anchorLandingLocked){
      bar.classList.remove('km-yield');
    }else if(shortLandscape&&shortLandscape.matches){
      bar.classList.remove('km-yield');
    }else if(menuOpen||y<90){
      bar.classList.remove('km-yield');
    }else if(delta>4){
      bar.classList.add('km-yield');
    }else if(delta<-4){
      bar.classList.remove('km-yield');
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

  bar.addEventListener('focusin',function(){bar.classList.remove('km-yield');});

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
