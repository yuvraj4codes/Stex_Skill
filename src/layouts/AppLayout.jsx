import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/**
 * Root layout shell — rendered for all non-auth routes.
 * Uses React Router v6 <Outlet /> to render matched child routes.
 */
export default function AppLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Navbar />
      <main className="flex-1 w-full">
        {children ?? <Outlet />}
      </main>
      <Footer />
    </div>
  );
}
