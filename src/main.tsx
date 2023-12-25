import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import Saved from './components/Saved.tsx';
import Application from './components/Application.tsx';

const router = createBrowserRouter([
  {
    path: "/saved",
    element: <Saved />
  },
  {
    path: "/home/:applicationId",
    element: <Application />
  },
  {
    path : "/",
    element : <Application />
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
