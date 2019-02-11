import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import './index.css';
import App from './components/App';
import * as serviceWorker from './serviceWorker';
import 'react-tippy/dist/tippy.css';
import history from './utils/history';
import { TitleContextProvider } from './context/AppTitleContext';
import SelectedNodeProvider from './context/SelectedNodeContext';
import './styles/lazylog/index.css';

ReactDOM.render(
  <Router history={history}>
    <SelectedNodeProvider>
      <TitleContextProvider>
          <App />
      </TitleContextProvider>
    </SelectedNodeProvider>
      </Router>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
