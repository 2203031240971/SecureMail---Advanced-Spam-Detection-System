import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Mail,
  MessageSquare,
  History,
  BarChart3,
  Settings,
  HelpCircle,
  Shield,
  Menu,
  X,
  LogOut,
  User,
  Crown,
  Bot,
  Activity,
  Eye,
  Globe,
  Bell,
  Filter,
  TrendingUp,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { SecureMailLogo } from '@/components/SecureMailLogo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Puzzle } from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Email Analyzer', href: '/email-analyzer', icon: Mail },
  { name: 'SMS Analyzer', href: '/sms-analyzer', icon: MessageSquare },
  { name: 'Social Media Analyzer', href: '/social-media-analyzer', icon: Globe },
  { name: 'Scan History', href: '/scan-history', icon: History },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

const threatIntelligenceItems = [
  { name: 'Threat Automation', href: '/threat-automation', icon: Bot },
  { name: 'Live Analysis', href: '/live-analysis', icon: Activity },
  { name: 'Phishing Protection', href: '/phishing-protection', icon: Eye },
  { name: 'Threat Mapping', href: '/threat-mapping', icon: Globe },
  { name: 'Alerts & Incidents', href: '/alerts-management', icon: Bell },
  { name: 'Custom Filtering', href: '/filtering-management', icon: Filter },
  { name: 'Advanced Analytics', href: '/advanced-analytics', icon: TrendingUp },
  { name: 'API & Integrations', href: '/integration-settings', icon: Zap },
  { name: 'Spam Extension', href: '/spam-extension', icon: Puzzle },
];

const settingsItems = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help', href: '/help', icon: HelpCircle },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Don't render sidebar if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "flex h-screen flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out z-50",
        "md:relative md:translate-x-0",
        isMobile ? "fixed left-0 top-0 w-80" : "w-64",
        isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"
      )}>
        {/* Mobile close button */}
        {isMobile && (
          <div className="flex justify-end p-4 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        )}

        {/* Logo/Brand */}
        <div className={cn(
          "flex items-center gap-2 border-b border-sidebar-border",
          isMobile ? "px-6 py-4" : "p-6"
        )}>
          <SecureMailLogo size="md" variant="full" className="text-sidebar-foreground" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto sidebar-scrollbar">
          <div className="space-y-6">
            {/* Main Navigation */}
            <div>
              <ul className="space-y-2">
                {navigationItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        onClick={handleLinkClick}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Threat Intelligence Section */}
            <div>
              <h3 className="px-3 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-3">
                Threat Intelligence
              </h3>
              <ul className="space-y-2">
                {threatIntelligenceItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        onClick={handleLinkClick}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Settings Section */}
            <div>
              <h3 className="px-3 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-3">
                Configuration
              </h3>
              <ul className="space-y-2">
                {settingsItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        onClick={handleLinkClick}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start p-0 h-auto hover:bg-sidebar-accent"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium relative">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                    {user?.role === 'admin' && (
                      <Crown className="absolute -top-1 -right-1 h-3 w-3 text-warning" />
                    )}
                  </div>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-sidebar-foreground truncate">
                        {user?.name || 'User'}
                      </span>
                      {user?.role === 'admin' && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          Admin
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-sidebar-foreground/60 truncate w-full text-left">
                      {user?.email || 'user@example.com'}
                    </span>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  App Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden fixed top-4 left-4 z-50 bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent"
      onClick={onClick}
    >
      <Menu className="h-6 w-6" />
    </Button>
  );
}
