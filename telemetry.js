/* Anonymous play counting for the standalone games site.
   Sends only: event name (game-start / round-end / open), game name, number of players,
   against the iPad or people, level, result, and the app language. Never names, scores or anything typed.
   Nothing is sent unless analytics-config.js has a website ID, and players can turn it off on the main page.
   Events wait on the device while offline and go out the next time it is online. */
(function(){
  var CFG=window.GAMES_ANALYTICS||{},Q="games.queue",OFF="games.countingOff",busy=false;
  function get(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}}
  function set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  function enabled(){return !!CFG.website&&!get(OFF,false)}
  function flush(){
    if(busy||!enabled()||(navigator.onLine===false))return;
    var q=get(Q,[]);if(!q.length)return;busy=true;var ev=q[0];
    fetch(CFG.endpoint||"https://gateway.umami.is/api/send",{method:"POST",headers:{"Content-Type":"application/json"},keepalive:true,
      body:JSON.stringify({type:"event",payload:{website:CFG.website,hostname:location.hostname,language:ev.l,url:ev.u,name:ev.n,data:ev.d}})})
    .then(function(r){busy=false;if(r.ok||(r.status>=400&&r.status<500)){var q2=get(Q,[]);q2.shift();set(Q,q2);setTimeout(flush,250)}})
    .catch(function(){busy=false});
  }
  window.gamesTrack=function(name,data){
    if(!enabled())return;
    var q=get(Q,[]);q.push({n:String(name).slice(0,40),d:data||{},u:location.pathname.replace(/index\.html$/,""),l:document.documentElement.lang==="am"?"am":"en"});
    set(Q,q.slice(-300));flush();
  };
  window.gamesCounting={off:function(){return !!get(OFF,false)},setOff:function(v){set(OFF,!!v);if(v)set(Q,[])}};
  window.addEventListener("online",flush);
  document.addEventListener("visibilitychange",function(){if(!document.hidden)flush()});
  /* one "open" per page per day, so we can count how many days the games are used */
  try{var day=new Date().toISOString().slice(0,10),key="games.opened."+location.pathname;if(get(key,"")!==day){set(key,day);setTimeout(function(){window.gamesTrack("open",{page:location.pathname.replace(/index\.html$/,"").split("/").filter(Boolean).pop()||"home"})},800)}}catch(e){}
  setTimeout(flush,1500);
})();
