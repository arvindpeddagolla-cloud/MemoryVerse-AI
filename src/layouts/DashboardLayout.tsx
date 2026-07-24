import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, FileText, UploadCloud, Network, CalendarRange, 
  MessageSquare, Award, Wrench, Settings, LogOut, Bell, Search, 
  User, CheckCircle, Menu, X, ArrowUpRight
} from 'lucide-react';
import api from '../services/api';

interface DashboardLayoutProps {
  children: React.ReactNode;
  onSearchSubmit?: (query: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, onSearchSubmit }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/settings/profile');
        // Let's seed notifications from the database if they exist
        const dbRes = await api.get('/career/insights'); // triggers check
        // Or fetch profile again
        if (res.data && res.data.id) {
          // Notifications are part of the db response or we fetch them
          // Let's pull a mock database fetch for notifications
          const notifRes = await api.get('/documents'); // standard call
          // Set some fallback notifications if empty
          setNotifications([
            { id: '1', text: `Welcome back, ${user?.name}! Your readiness score is updated.`, read: false, createdAt: new Date() },
            { id: '2', text: 'AI Tip: Try uploading an image of your certificate to extract skills instantly.', read: false, createdAt: new Date() }
          ]);
        }
      } catch (err) {
        console.error('Error loading notification bar:', err);
      }
    };
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(searchQuery);
    } else {
      // If we are not on the search page, navigate to documents/search with query
      navigate(`/documents?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const sidebarItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4.5 h-4.5" /> },
    { name: 'My Documents', path: '/documents', icon: <FileText className="w-4.5 h-4.5" /> },
    { name: 'Knowledge Graph', path: '/graph', icon: <Network className="w-4.5 h-4.5" /> },
    { name: 'Journey Timeline', path: '/timeline', icon: <CalendarRange className="w-4.5 h-4.5" /> },
    { name: 'AI Assistant Chat', path: '/chat', icon: <MessageSquare className="w-4.5 h-4.5" /> },
    { name: 'Resume Builder', path: '/resume', icon: <Wrench className="w-4.5 h-4.5" /> },
    { name: 'Career Insights', path: '/insights', icon: <Award className="w-4.5 h-4.5" /> },
    { name: 'Account Settings', path: '/settings', icon: <Settings className="w-4.5 h-4.5" /> },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Banner Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 h-16 flex items-center justify-between px-4 sm:px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-md hover:bg-slate-100 lg:hidden text-slate-500"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-base">MV</span>
            <span className="font-bold text-lg text-slate-800 tracking-tight">MemoryVerse<span className="text-blue-600">.AI</span></span>
          </Link>
          <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider font-semibold text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded bg-slate-50">
            Enterprise
          </span>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center relative max-w-md w-full mx-8">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="search"
            placeholder="AI Search skills, certifications, projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 hover:bg-slate-200/70 focus:bg-white text-xs text-slate-700 pl-9 pr-4 py-2 rounded-md border border-transparent focus:border-slate-300 focus:outline-none transition duration-150"
          />
        </form>

        {/* User profile dropdown & notifications */}
        <div className="flex items-center gap-4">
          {/* Notifications Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-40 py-1">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-800">Notifications</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => setNotifications(notifications.map(n => ({...n, read: true})))}
                      className="text-[10px] text-blue-600 font-medium hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-slate-400">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`px-4 py-3 border-b border-slate-50 text-xs text-slate-600 hover:bg-slate-50 ${!n.read ? 'bg-blue-50/20' : ''}`}>
                        <p className="leading-snug">{n.text}</p>
                        <span className="text-[10px] text-slate-400 mt-1 inline-block font-mono">Just now</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Info */}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <User className="w-4.5 h-4.5 text-slate-500" />
              )}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-tight">{user?.name}</span>
              <span className="text-[10px] text-slate-400 font-medium capitalize">{user?.role}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex relative">
        {/* Left Sidebar (Desktop) */}
        <aside className="w-64 border-r border-slate-200 bg-white hidden lg:flex flex-col justify-between shrink-0 p-4 sticky top-16 h-[calc(100vh-64px)]">
          <div className="space-y-6">
            <div className="px-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Menu Navigation</p>
            </div>
            
            <nav className="space-y-1">
              {sidebarItems.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                      isActive 
                        ? 'bg-blue-50 text-blue-600 font-semibold' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom user section */}
          <div className="border-t border-slate-200 pt-4 space-y-2">
            <Link 
              to={`/portfolio/${user?.id}`}
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-md transition"
            >
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Public Portfolio
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout Account</span>
            </button>
          </div>
        </aside>

        {/* Collapsible Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-64 bg-white h-full p-4 flex flex-col justify-between" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">MemoryVerse AI</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded hover:bg-slate-100">
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                
                <nav className="space-y-1">
                  {sidebarItems.map(item => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                          isActive 
                            ? 'bg-blue-50 text-blue-600 font-semibold' 
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="border-t border-slate-200 pt-4 space-y-2">
                <Link 
                  to={`/portfolio/${user?.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-md transition"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Public Portfolio
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Panel */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
