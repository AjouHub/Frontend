import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, HashRouter} from 'react-router-dom';
import App from './App';
import {isAppEnv} from "./services/auth.service";

const Router = isAppEnv() ? HashRouter : BrowserRouter;
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <Router>
            <App />
        </Router>
    </React.StrictMode>
);
