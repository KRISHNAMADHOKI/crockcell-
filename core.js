(function(){
  const KEYS = {
    token:"crockcell_idToken",
    refresh:"crockcell_refreshToken",
    uid:"crockcell_uid",
    profile:"crockcell_profile"
  };

  const OLD = {
    token:["crockcellIdToken"],
    refresh:["crockcellRefreshToken"],
    uid:["crockcellUid"],
    profile:["crockcellProfile"]
  };

  function read(key){
    return localStorage.getItem(key) || sessionStorage.getItem(key) || "";
  }
  function write(key,value){
    localStorage.setItem(key,value);
  }
  function migrate(){
    Object.keys(KEYS).forEach(k=>{
      if(!read(KEYS[k])){
        for(const oldKey of OLD[k]){
          const v=read(oldKey);
          if(v){ write(KEYS[k],v); break; }
        }
      }
    });
  }
  migrate();

  const API_KEY="AIzaSyDOfo32KHl1r6LZotgqj8WAgcjHzt2ORJk";
  const PROJECT_ID="crockcell-cd2e6";
  const BASE=`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

  let refreshPromise=null;

  async function refreshToken(){
    const refresh=read(KEYS.refresh);
    if(!refresh) return "";
    if(refreshPromise) return refreshPromise;
    refreshPromise=(async()=>{
      try{
        const r=await fetch(`https://securetoken.googleapis.com/v1/token?key=${API_KEY}`,{
          method:"POST",
          headers:{"Content-Type":"application/x-www-form-urlencoded"},
          body:new URLSearchParams({
            grant_type:"refresh_token",
            refresh_token:refresh
          })
        });
        if(!r.ok) return "";
        const d=await r.json();
        if(d.id_token) write(KEYS.token,d.id_token);
        if(d.refresh_token) write(KEYS.refresh,d.refresh_token);
        if(d.user_id) write(KEYS.uid,d.user_id);
        return d.id_token||"";
      }finally{ refreshPromise=null; }
    })();
    return refreshPromise;
  }

  async function request(path, options={}){
    let token=read(KEYS.token);
    options.headers={...(options.headers||{}),...(token?{Authorization:"Bearer "+token}:{})};
    let r=await fetch(`${BASE}/${path}${path.includes("?")?"&":"?"}key=${API_KEY}`,options);
    if((r.status===401||r.status===403) && read(KEYS.refresh)){
      const t=await refreshToken();
      if(t){
        options.headers.Authorization="Bearer "+t;
        r=await fetch(`${BASE}/${path}${path.includes("?")?"&":"?"}key=${API_KEY}`,options);
      }
    }
    return r;
  }

  function uid(){ return read(KEYS.uid); }
  function token(){ return read(KEYS.token); }
  function profile(){
    try{return JSON.parse(read(KEYS.profile)||"{}")}catch{return {}}
  }
  function setSession({idToken,refreshTokenValue,userId,profileValue}){
    if(idToken) write(KEYS.token,idToken);
    if(refreshTokenValue) write(KEYS.refresh,refreshTokenValue);
    if(userId) write(KEYS.uid,userId);
    if(profileValue) write(KEYS.profile,JSON.stringify(profileValue));
  }
  function logout(){
    Object.values(KEYS).forEach(k=>localStorage.removeItem(k));
    Object.values(KEYS).forEach(k=>sessionStorage.removeItem(k));
    location.href="index.html";
  }
  function isLoggedIn(){ return !!(uid() && token()); }

  window.CrockCell={API_KEY,PROJECT_ID,BASE,uid,token,profile,setSession,refreshToken,request,logout,isLoggedIn,KEYS};
})();
