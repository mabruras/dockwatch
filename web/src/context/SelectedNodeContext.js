import React, { createContext, useState, useEffect } from 'react';
import { nodeStorage } from '../utils/storageKeys';

const defaultNode = {
  id: '01',
  name: 'Default Node',
  baseUrl: process.env.REACT_APP_API_URL || "/api"
};

const SelectedNodeContext = createContext({
  data: defaultNode,
  setData: data => {}
});

function readNodeDataFromStorage() {
  const node = nodeStorage.get();

  if(!node) {
      nodeStorage.set(defaultNode);
  }

  return node ? node : defaultNode;
}

export default function SelectedNodeProvider({ children }) {
  const [state, setState] = useState(defaultNode);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const nodeData = readNodeDataFromStorage();
    setState(nodeData);
    setHasLoaded(true);
}, []);

  return (
    <SelectedNodeContext.Provider
      value={{
        data: state,
        setData: data => { 
            setState(data) 
            nodeStorage.set(data)
        },
        hasLoaded: hasLoaded
      }}
    >
      {children}
    </SelectedNodeContext.Provider>
  );
}

export { SelectedNodeContext, SelectedNodeProvider, defaultNode };
