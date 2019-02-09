export default function storage(key) {
    if (typeof window === 'undefined') {
      throw new Error(`Not in a browser environment!`);
    }
  
    function get() {
      return JSON.parse(window.localStorage.getItem(key));
    }
  
    function set(data) {
      return window.localStorage.setItem(key, JSON.stringify(data));
    }
  
    function clearItem() {
      return window.localStorage.removeItem(key);
    }
  
    return {
      set,
      get,
      clearItem
    };
  }