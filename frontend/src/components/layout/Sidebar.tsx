import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Users, Settings, LogOut,
  Bell, ClipboardList, UserCog, Gift, MessageSquare, BarChart3, Menu, X,
} from 'lucide-react';
import { useState } from 'react';
import { cn, isAdmin } from '@/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',     to: '/admin/dashboard',    icon: <LayoutDashboard className="h-5 w-5" />, adminOnly: true  },
  { label: 'Dashboard',     to: '/dashboard',           icon: <LayoutDashboard className="h-5 w-5" />, adminOnly: false },
  { label: 'Appointments',  to: '/appointments',        icon: <ClipboardList   className="h-5 w-5" /> },
  { label: 'Calendar',      to: '/calendar',            icon: <Calendar        className="h-5 w-5" /> },
  { label: 'Chat',          to: '/chat',                icon: <MessageSquare   className="h-5 w-5" /> },
  { label: 'Users',         to: '/admin/users',         icon: <Users           className="h-5 w-5" />, adminOnly: true  },
  { label: 'Providers',     to: '/admin/providers',     icon: <UserCog         className="h-5 w-5" />, adminOnly: true  },
  { label: 'Services',      to: '/admin/services',      icon: <Gift            className="h-5 w-5" />, adminOnly: true  },
  { label: 'Holidays',      to: '/admin/holidays',      icon: <Calendar        className="h-5 w-5" />, adminOnly: true  },
  { label: 'Reports',       to: '/admin/reports',       icon: <BarChart3       className="h-5 w-5" />, adminOnly: true  },
  { label: 'Notifications', to: '/notifications',       icon: <Bell            className="h-5 w-5" /> },
  { label: 'Settings',      to: '/settings',            icon: <Settings        className="h-5 w-5" /> },
];

interface SidebarContentProps {
  admin: boolean;
  user: { firstName?: string; lastName?: string; email?: string } | null;
  onLinkClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
}

function SidebarContent({ admin, user, onLinkClick, onProfileClick, onLogout }: SidebarContentProps) {
  const filtered = NAV_ITEMS.filter((item) => {
    if (item.adminOnly === true)  return admin;
    if (item.adminOnly === false) return !admin;
    return true;
  });

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <Calendar className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg">AppointmentAI</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {filtered.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onLinkClick}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="border-t px-3 py-4">
        <div
          role="button"
          tabIndex={0}
          className="flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer hover:bg-accent"
          onClick={onProfileClick}
          onKeyDown={(e) => e.key === 'Enter' && onProfileClick()}
        >
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold select-none">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 mt-1 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const admin = user ? isAdmin(user.roles) : false;

  const handleProfileClick = () => { navigate('/profile'); setMobileOpen(false); };
  const handleLinkClick    = () => setMobileOpen(false);

  const contentProps: SidebarContentProps = {
    admin,
    user,
    onLinkClick:    handleLinkClick,
    onProfileClick: handleProfileClick,
    onLogout:       logout,
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 border-r bg-card transition-transform duration-200 md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <SidebarContent {...contentProps} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r bg-card z-30">
        <SidebarContent {...contentProps} />
      </aside>
    </>
  );
}
