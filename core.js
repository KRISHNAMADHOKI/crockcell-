(function(){
  const API_KEY="AIzaSyDOfo32KHl1r6LZotgqj8WAgcjHzt2ORJk";

  const keys={
    idToken:"crockcell_idToken",
    refreshToken:"crockcell_refreshToken",
    uid:"crockcell_uid",
    profile:"crockcell_profile"
  };

  function migrate(oldKey,newKey){
    const current=localStorage.getItem(newKey);
    const old=localStorage.getItem(oldKey);
    if(!current && old){ localStorage.setItem(newKey,old); }
  }

  migrate("crockcellIdToken",keys.idToken);
  migrate("crockcellRefreshToken",keys.refreshToken);
  migrate("crockcellUid",keys.uid);
  migrate("crockcellProfile",keys.profile);

  window.CrockCell={
    keys,
    getToken:()=>localStorage.getItem(keys.idToken)||sessionStorage.getItem(keys.idToken)||"",
    getRefreshToken:()=>localStorage.getItem(keys.refreshToken)||sessionStorage.getItem(keys.refreshToken)||"",
    getUID:()=>localStorage.getItem(keys.uid)||sessionStorage.getItem(keys.uid)||"",
    async refreshToken(){
      const refresh=this.getRefreshToken();
      if(!refresh) return false;
      try{
        const r=await nativeFetch(
          "https://securetoken.googleapis.com/v1/token?key="+encodeURIComponent(API_KEY),
          {
            method:"POST",
            headers:{"Content-Type":"application/x-www-form-urlencoded"},
            body:"grant_type=refresh_token&refresh_token="+encodeURIComponent(refresh)
          }
        );
        const d=await r.json();
        if(!r.ok || !d.id_token) return false;
        localStorage.setItem(keys.idToken,d.id_token);
        if(d.refresh_token) localStorage.setItem(keys.refreshToken,d.refresh_token);
        return true;
      }catch(e){ return false; }
    }
  };

  const nativeFetch=window.fetch.bind(window);
  let refreshPromise=null;

  window.fetch=async function(input,init){
    let response=await nativeFetch(input,init);
    if(response.status!==401 && response.status!==403) return response;

    if(!CrockCell.getRefreshToken()) return response;

    if(!refreshPromise){
      refreshPromise=CrockCell.refreshToken().finally(()=>{refreshPromise=null;});
    }
    const ok=await refreshPromise;
    if(!ok) return response;

    const newToken=CrockCell.getToken();
    const retryInit=Object.assign({},init||{});
    const headers=new Headers((init&&init.headers)||{});
    headers.set("Authorization","Bearer "+newToken);
    retryInit.headers=headers;
    return nativeFetch(input,retryInit);
  };
})();
