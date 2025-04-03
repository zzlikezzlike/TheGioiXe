import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import  App from './App';
import "bootstrap/dist/css/bootstrap.min.css";


const root1 = ReactDOM.createRoot(document.getElementById('root1'));
root1.render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>
);

reportWebVitals();
