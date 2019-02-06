import { useState, useEffect } from 'react';
import { userStorage } from '../utils/storageKeys';

/**
 * Custom hook for API-calls
 *
 *    const [busy, response, error, refetch] = useApi({
 *     endpoint: 'channels',
 *     initialData: [],
 *     fetchOnMount: true,
 *     body: {},
 *     method: 'POST' // default 'GET',
 *     onSuccess: (response) => {},
 *     onError: (error) => {}
 *   });
 *
 */

export default function useApi(opts) {
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState(opts.initialData);
  const [error, setError] = useState(null);

  async function fetchData() {
    try {
      setBusy(true);

      const headers = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const accessToken = userStorage.get()
        ? userStorage.get().accessToken
        : null;

      if (accessToken) {
        headers.headers.authorization = `Bearer ${accessToken.token}`;
      }

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/${opts.endpoint}`,
        {
          ...headers,
          method: opts.method || 'GET',
          body:
            opts.method === 'POST' && opts.body
              ? JSON.stringify(opts.body)
              : undefined
        }
      );
      const { ok } = await res;

      if(!ok) {
        if (typeof opts.onError === 'function') {
          opts.onError("En feil oppstod.");
        }
        return;
      }

      const json = await res.json();
      setData(json);

      if (typeof opts.onSuccess === 'function') {
        if(opts.successDelay) {
          window.setTimeout(() => { 
            setBusy(false); 
            opts.onSuccess(json)}, 
            opts.successDelay);
        } else {
          setBusy(false);
          opts.onSuccess(json);
        }
      } else {
        setBusy(false);
      }
    } catch (error) {
      setError(error);

      if (typeof opts.onError === 'function') {
        opts.onError(error);
      }
    }
  }

  if (opts.fetchOnMount) {
    useEffect(() => {
      fetchData();
    }, []);
  }

  return [busy, data, error, fetchData];
}
