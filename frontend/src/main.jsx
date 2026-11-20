import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { useCallback, useEffect, useState } from 'react';
const App = lazy(() => import('./App.jsx'));
const AdminApp = lazy(() => import('./AdminApp.jsx'));
import './styles.css';
import './cinema-theme.css';
import './cinema-journal.css';
import './cinema-polish.css';
import './details-layout.css';

function ApplicationRoutes() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((path) => {
    setPathname(path);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  if (/^\/admin(?:\/|$)/.test(pathname)) {
    return <Suspense fallback={<div className="route-loading" role="status">Opening the admin workspace…</div>}><AdminApp path={pathname} navigate={navigate}/></Suspense>;
  }
  return <Suspense fallback={<div className="route-loading" role="status">Opening CinéRegal…</div>}><App/></Suspense>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><ApplicationRoutes/></React.StrictMode>);
