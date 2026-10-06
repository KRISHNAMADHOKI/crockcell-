(function () {
  "use strict";

  const API_KEY = "AIzaSyDOfo32KHl1r6LZotgqj8WAgcjHzt2ORJk";

  const keys = {
    idToken: "crockcell_idToken",
    refreshToken: "crockcell_refreshToken",
    uid: "crockcell_uid",
    profile: "crockcell_profile"
  };

  // --------------------------------------------------
  // OLD KEY MIGRATION
  // --------------------------------------------------

  function migrate(oldKey, newKey) {
    const current = localStorage.getItem(newKey);
    const old = localStorage.getItem(oldKey);

    if (!current && old) {
      localStorage.setItem(newKey, old);
    }
  }

  migrate("crockcellIdToken", keys.idToken);
  migrate("crockcellRefreshToken", keys.refreshToken);
  migrate("crockcellUid", keys.uid);
  migrate("crockcellProfile", keys.profile);

  // --------------------------------------------------
  // NATIVE FETCH
  // --------------------------------------------------

  const nativeFetch = window.fetch.bind(window);

  // --------------------------------------------------
  // TOKEN HELPERS
  // --------------------------------------------------

  function getToken() {
    return (
      localStorage.getItem(keys.idToken) ||
      sessionStorage.getItem(keys.idToken) ||
      ""
    );
  }

  function getRefreshToken() {
    return (
      localStorage.getItem(keys.refreshToken) ||
      sessionStorage.getItem(keys.refreshToken) ||
      ""
    );
  }

  function getUID() {
    return (
      localStorage.getItem(keys.uid) ||
      sessionStorage.getItem(keys.uid) ||
      ""
    );
  }

  function getProfile() {
    const raw =
      localStorage.getItem(keys.profile) ||
      sessionStorage.getItem(keys.profile) ||
      "";

    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch (e) {
      return raw;
    }
  }

  // --------------------------------------------------
  // REFRESH TOKEN
  // --------------------------------------------------

  let refreshPromise = null;

  async function refreshToken() {
    const refresh = getRefreshToken();

    if (!refresh) {
      return false;
    }

    try {
      const response = await nativeFetch(
        "https://securetoken.googleapis.com/v1/token?key=" +
          encodeURIComponent(API_KEY),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body:
            "grant_type=refresh_token&refresh_token=" +
            encodeURIComponent(refresh)
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data || !data.id_token) {
        return false;
      }

      localStorage.setItem(keys.idToken, data.id_token);

      if (data.refresh_token) {
        localStorage.setItem(
          keys.refreshToken,
          data.refresh_token
        );
      }

      if (data.user_id) {
        localStorage.setItem(keys.uid, data.user_id);
      }

      return true;
    } catch (error) {
      console.error("CROCKCELL token refresh failed:", error);
      return false;
    }
  }

  // --------------------------------------------------
  // SINGLE REFRESH LOCK
  // --------------------------------------------------

  async function refreshOnce() {
    if (!refreshPromise) {
      refreshPromise = refreshToken().finally(() => {
        refreshPromise = null;
      });
    }

    return await refreshPromise;
  }

  // --------------------------------------------------
  // GLOBAL CROCKCELL OBJECT
  // --------------------------------------------------

  window.CrockCell = {
    keys,

    getToken,

    getRefreshToken,

    getUID,

    getProfile,

    refreshToken,

    async ensureToken() {
      const token = getToken();

      if (token) {
        return token;
      }

      const refreshed = await refreshOnce();

      if (!refreshed) {
        return "";
      }

      return getToken();
    },

    isLoggedIn() {
      return !!getToken() || !!getRefreshToken();
    },

    logout() {
      localStorage.removeItem(keys.idToken);
      localStorage.removeItem(keys.refreshToken);
      localStorage.removeItem(keys.uid);
      localStorage.removeItem(keys.profile);

      sessionStorage.removeItem(keys.idToken);
      sessionStorage.removeItem(keys.refreshToken);
      sessionStorage.removeItem(keys.uid);
      sessionStorage.removeItem(keys.profile);
    }
  };

  // --------------------------------------------------
  // FETCH INTERCEPTOR
  // --------------------------------------------------

  window.fetch = async function (input, init) {
    let response;

    try {
      response = await nativeFetch(input, init);
    } catch (error) {
      throw error;
    }

    // Normal successful response
    if (response.status !== 401 && response.status !== 403) {
      return response;
    }

    // No refresh token available
    if (!getRefreshToken()) {
      return response;
    }

    // Try refreshing the token
    const refreshed = await refreshOnce();

    if (!refreshed) {
      return response;
    }

    const newToken = getToken();

    if (!newToken) {
      return response;
    }

    // Rebuild request headers
    const retryInit = Object.assign({}, init || {});

    const headers = new Headers(
      (init && init.headers) || {}
    );

    headers.set(
      "Authorization",
      "Bearer " + newToken
    );

    retryInit.headers = headers;

    // Retry request
    try {
      return await nativeFetch(input, retryInit);
    } catch (error) {
      console.error("CROCKCELL request retry failed:", error);
      return response;
    }
  };

  console.log("CROCKCELL Core loaded successfully.");

})();
