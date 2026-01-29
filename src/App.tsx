import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { Navigation } from "./components/layout/Navigation";

// Pages
import { Landing } from "./pages/Landing";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import BusinessDashboard from "./pages/business/BusinessDashboard";
import Listings from "./pages/business/Listings";
import { AddListing } from "./pages/business/AddListing";
import { BrowseFood } from "./pages/buyer/BrowseFood";
import { Orders } from "./pages/buyer/Orders";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { Businesses } from "./pages/admin/Businesses";
import { Users } from "./pages/admin/Users";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode; 
  allowedRoles?: string[] 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Layout wrapper with navigation
const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background">
    <Navigation />
    {children}
  </div>
);

const AppRoutes = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Redirect authenticated users to their dashboard
  const getDashboardRoute = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'business': return '/business/dashboard';
      case 'buyer': return '/browse';
      case 'admin': return '/admin/dashboard';
      default: return '/';
    }
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to={getDashboardRoute()} replace /> : <Login />
      } />
      <Route path="/register" element={
        isAuthenticated ? <Navigate to={getDashboardRoute()} replace /> : <Register />
      } />
      
      {/* Public browsing (no auth required) */}
      <Route path="/browse" element={
        <Layout>
          <BrowseFood />
        </Layout>
      } />
      
      {/* Protected routes - Business */}
      <Route path="/business/dashboard" element={
        <ProtectedRoute allowedRoles={['business']}>
          <Layout>
            <BusinessDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/business/listings" element={
        <ProtectedRoute allowedRoles={['business']}>
          <Layout>
            <Listings />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/business/add-listing" element={
        <ProtectedRoute allowedRoles={['business']}>
          <Layout>
            <AddListing />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Protected routes - Buyer */}
      <Route path="/orders" element={
        <ProtectedRoute allowedRoles={['buyer']}>
          <Layout>
            <Orders />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Protected routes - Admin */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <AdminDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/businesses" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <Businesses />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <Users />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Landing page with conditional redirect */}
      <Route path="/" element={
        isAuthenticated ? (
          <Navigate to={getDashboardRoute()} replace />
        ) : (
          <Layout>
            <Landing />
          </Layout>
        )
      } />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
