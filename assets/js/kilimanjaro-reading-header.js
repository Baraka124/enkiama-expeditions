(function(){
  var bar=document.getElementById('ehBar');
  var overlay=document.getElementById('ehOverlay');
  if(!bar)return;

  if(!document.getElementById('kilimanjaro-reading-header-style')){
    var style=document.createElement('style');
    style.id='kilimanjaro-reading-header-style';
    style.textContent=
      '.eh-bar{will-change:transform;}'+
      '.eh-bar.km-yield{transform:translateY(calc(-100% - 12px))!important;pointer-events:none;}'+
      '@media(max-height:520px) and (orientation:landscape){.eh-bar{position:absolute!important;transform:none!important;}}'+
      '@media(prefers-reduced-motion:reduce){.eh-bar{transition:none!important;}}';
    document.head.appendChild(style);
  }

  var shortLandscape=window.matchMedia&&window.matchMedia('(max-height:520px) and (orientation:landscape)');
  var lastY=window.scrollY||0;
  var ticking=false;

  function update(){
    var y=window.scrollY||0;
    var delta=y-lastY;
    var menuOpen=overlay&&overlay.classList.contains('open');

    if(shortLandscape&&shortLandscape.matches){
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
})();
