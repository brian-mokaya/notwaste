import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Building2, ShoppingBag, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBusinesses: 0,
    activeListings: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    platformCommission: 0,
    mealsSaved: 0,
    newUsersThisMonth: 0,
    newBusinessesThisMonth: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch users
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const totalUsers = usersSnapshot.size;

        // Fetch businesses
        const businessesRef = collection(db, 'businesses');
        const businessesSnapshot = await getDocs(businessesRef);
        const totalBusinesses = businessesSnapshot.size;

        // Fetch listings
        const listingsRef = collection(db, 'listings');
        const activeListingsQuery = query(listingsRef, where('status', '==', 'active'));
        const activeListingsSnapshot = await getDocs(activeListingsQuery);
        const activeListings = activeListingsSnapshot.size;

        // Fetch transactions
        const transactionsRef = collection(db, 'transactions');
        const transactionsSnapshot = await getDocs(transactionsRef);
        const totalTransactions = transactionsSnapshot.size;
        
        let totalRevenue = 0;
        transactionsSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.amount) {
            totalRevenue += data.amount;
          }
        });

        // Calculate platform commission (assuming 10%)
        const platformCommission = totalRevenue * 0.1;

        // Calculate meals saved (assuming each transaction saves 1 meal)
        const mealsSaved = totalTransactions;

        // Calculate new users this month
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        const newUsersQuery = query(
          usersRef,
          where('createdAt', '>=', oneMonthAgo),
          orderBy('createdAt', 'desc')
        );
        const newUsersSnapshot = await getDocs(newUsersQuery);
        const newUsersThisMonth = newUsersSnapshot.size;

        // Calculate new businesses this month
        const newBusinessesQuery = query(
          businessesRef,
          where('createdAt', '>=', oneMonthAgo),
          orderBy('createdAt', 'desc')
        );
        const newBusinessesSnapshot = await getDocs(newBusinessesQuery);
        const newBusinessesThisMonth = newBusinessesSnapshot.size;

        setStats({
          totalUsers,
          totalBusinesses,
          activeListings,
          totalTransactions,
          totalRevenue,
          platformCommission,
          mealsSaved,
          newUsersThisMonth,
          newBusinessesThisMonth,
        });

        // Fetch recent activity
        const recentTransactionsQuery = query(
          transactionsRef,
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentTransactionsSnapshot = await getDocs(recentTransactionsQuery);
        
        const activity = recentTransactionsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            type: 'transaction',
            title: `Transaction #${doc.id.slice(-6)}`,
            description: `Amount: KSh ${data.amount?.toLocaleString() || 0}`,
            timestamp: data.createdAt?.toDate?.() || new Date(),
            status: data.status || 'completed',
          };
        });

        setRecentActivity(activity);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setStats({
          totalUsers: 0,
          totalBusinesses: 0,
          activeListings: 0,
          totalTransactions: 0,
          totalRevenue: 0,
          platformCommission: 0,
          mealsSaved: 0,
          newUsersThisMonth: 0,
          newBusinessesThisMonth: 0,
        });
        setRecentActivity([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'new_business':
        return <Building2 className="h-4 w-4" />;
      case 'large_order':
        return <ShoppingBag className="h-4 w-4" />;
      case 'payment_issue':
        return <AlertTriangle className="h-4 w-4" />;
      case 'transaction':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-accent text-accent-foreground';
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'alert':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor platform activity and performance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.newUsersThisMonth} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Businesses</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBusinesses}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.newBusinessesThisMonth} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              <ShoppingBag className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.activeListings}</div>
              <p className="text-xs text-muted-foreground">
                Available now
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KSh {stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Platform transactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Commission</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KSh {stats.platformCommission.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                10% of total revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meals Saved</CardTitle>
              <ShoppingBag className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.mealsSaved.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Environmental impact
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform events and alerts</CardDescription>
              </div>
              <Button variant="outline">
                View All Activity
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-accent">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div>
                        <h4 className="font-medium">{activity.title}</h4>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.timestamp instanceof Date ? activity.timestamp.toLocaleString() : 'Unknown time'}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(activity.status)}>
                      {activity.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recent activity to display
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <Users className="h-6 w-6" />
            <span>Manage Users</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <Building2 className="h-6 w-6" />
            <span>Approve Businesses</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <ShoppingBag className="h-6 w-6" />
            <span>Monitor Listings</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <TrendingUp className="h-6 w-6" />
            <span>View Analytics</span>
          </Button>
        </div>
      </div>
    </div>
  );
};