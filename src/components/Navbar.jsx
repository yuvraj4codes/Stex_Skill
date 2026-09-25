import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  GraduationCap, Menu, X, Users, MessageSquare, FolderKanban,
  Compass, LogIn, LogOut, UserCircle, Settings,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { APP_CONFIG } from "../utils/constants";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, signOut, loading } = useAuth();

  const navLinks = [
    { name: "Discover", path: "/discover", icon: Compass },
    { name: "Projects", path: "/projects", icon: FolderKanban },
    { name: "Messages", path: "/messages", icon: MessageSquare },
    { name: "Dashboard", path: "/dashboard", icon: Users },
  ];

  const isActive = (path) => location.pathname === path;

  const handleSignOut = async () => {
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white block leading-none">{APP_CONFIG.name}</span>
              <span className="text-[9px] font-medium text-slate-500 tracking-widest uppercase block mt-0.5">Skill Exchange</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ name, path, icon: Icon }) => (
              <Link key={path} to={path}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(path) ? "bg-indigo-500/15 text-indigo-400" : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}>
                <Icon className="w-4 h-4" />{name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {!loading && (
              isAuthenticated ? (
                <div className="relative">
                  <button onClick={() => setProfileMenuOpen((v) => !v)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    aria-label="Profile menu">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {(user?.user_metadata?.full_name || user?.email || "U")[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="max-w-[120px] truncate">{user?.user_metadata?.full_name || user?.email}</span>
                  </button>
                  {profileMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl shadow-black/40 overflow-hidden py-1 z-50">
                      <Link to={`/profile/${user?.id}`} onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                        <UserCircle className="w-4 h-4" />My Profile
                      </Link>
                      <Link to="/settings" onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                        <Settings className="w-4 h-4" />Settings
                      </Link>
                      <div className="border-t border-slate-800 my-1" />
                      <button onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-slate-800 transition-colors">
                        <LogOut className="w-4 h-4" />Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login" className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                    <LogIn className="w-4 h-4" />Sign In
                  </Link>
                  <Link to="/register" className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5">
                    Get Started
                  </Link>
                </>
              )
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors"
              aria-label="Toggle menu">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map(({ name, path, icon: Icon }) => (
            <Link key={path} to={path} onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                isActive(path) ? "bg-indigo-500/15 text-indigo-400" : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}>
              <Icon className="w-5 h-5" />{name}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            {isAuthenticated ? (
              <>
                <Link to={`/profile/${user?.id}`} onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                  <UserCircle className="w-5 h-5" />My Profile
                </Link>
                <button onClick={handleSignOut}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-slate-800 transition-colors">
                  <LogOut className="w-5 h-5" />Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2.5 text-slate-300 font-medium rounded-lg border border-slate-700 hover:border-slate-600 hover:text-white transition-all">Sign In</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-md">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}

      {profileMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
      )}
    </header>
  );
}
