import React from 'react';import{createRoot}from'react-dom/client';import{BrowserRouter}from'react-router-dom';import{Toaster}from'react-hot-toast';import App from './App';import{AuthProvider}from'./auth';import'./styles.css';
createRoot(document.getElementById('root')).render(<BrowserRouter><AuthProvider><Toaster position="top-right"/><App/></AuthProvider></BrowserRouter>);
