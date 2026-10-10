(function(){
  fetch('data/tanzania.json')
    .then(r=>r.json())
    .then(d=>{
      const host=document.getElementById('tzSystems');
      if(!host) return;
      host.innerHTML=d.systems.map((x,i)=>{
        const best=x.best_for.join(' · ');
        const n=String(i+1).padStart(2,'0');
        return '<a class="tz-system-entry tz-system-entry--'+x.slug+'" data-system="'+x.slug+'" href="'+x.href+'">'+
          '<span class="tz-system-entry__index">'+n+'</span>'+
          '<div class="tz-system-entry__main">'+
            '<span class="tz-system-entry__label">'+x.label+'</span>'+
            '<h3>'+x.headline+'</h3>'+
            '<p>'+best+'</p>'+
          '</div>'+
          '<div class="tz-system-entry__meta">'+
            '<small>'+x.months+'</small>'+
            '<span aria-hidden="true">↗</span>'+
          '</div>'+
        '</a>';
      }).join('');
    });
})();