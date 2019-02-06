import * as React from 'react';

/**
 * Great post on how to use Context + React hooks:
 * https://dev.to/oieduardorabelo/react-hooks-how-to-create-and-update-contextprovider-1f68
 *
 * @Author Eduardo Marcondes Rabelo
 *
 */
const DEFAULT_APP_TITLE = 'Dock Watch ⚓';
const DEFAULT_APP_COLOR = '#624694';
let TitleContext = React.createContext();

let initialState = {
  title: DEFAULT_APP_TITLE,
  titleColor: DEFAULT_APP_COLOR
};

let reducer = (state, action) => {
  switch (action.type) {
    case 'default-title':
      return initialState;
    case 'set-title':
      return {
        ...state,
        titleColor: action.data.titleColor || '#624694',
        title: action.data.title
      };
    default:
      return state;
  }
};

function TitleContextProvider(props) {
  let [state, dispatch] = React.useReducer(reducer, initialState);
  let value = { state, dispatch };

  return (
    <TitleContext.Provider value={value}>
      {props.children}
    </TitleContext.Provider>
  );
}

let TitleContextConsumer = TitleContext.Consumer;

export {
  TitleContext,
  TitleContextProvider,
  TitleContextConsumer,
  DEFAULT_APP_COLOR,
  DEFAULT_APP_TITLE
};
