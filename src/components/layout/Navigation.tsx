import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { Leaf, User, LogOut, ShoppingBag, BarChart3, Plus } from 'lucide-react';

export const Navigation = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getNavigationItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'business':
        return [
          { path: '/business/dashboard', label: 'Dashboard', icon: BarChart3 },
          { path: '/business/listings', label: 'My Listings', icon: ShoppingBag },
          { path: '/business/add-listing', label: 'Add Food', icon: Plus },
        ];
      case 'buyer':
        return [
          { path: '/browse', label: 'Browse Food', icon: ShoppingBag },
          { path: '/orders', label: 'My Orders', icon: BarChart3 },
        ];
      case 'admin':
        return [
          { path: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
          { path: '/admin/businesses', label: 'Businesses', icon: ShoppingBag },
          { path: '/admin/users', label: 'Users', icon: User },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavigationItems();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-success to-success/60 rounded-lg flex items-center justify-center">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">WasteNot</span>
          </Link>

          <div className="flex items-center space-x-1 flex-1 md:flex-none">
            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-success text-white shadow-md'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {user?.role === 'buyer' && <CartDrawer />}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-muted">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs font-semibold bg-success text-white">
                          {user?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="px-2 py-1.5 space-y-1">
                      <p className="text-sm font-medium text-foreground">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                      <p className="text-xs text-muted-foreground capitalize font-medium">{user?.role}</p>
                    </div>
                    <div className="border-t border-border my-2" />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild className="text-sm font-medium rounded-lg h-9">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild className="text-sm font-medium rounded-lg h-9">
                  <Link to="/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
