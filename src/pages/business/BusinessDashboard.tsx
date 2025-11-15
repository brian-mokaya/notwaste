import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, Package, DollarSign, Clock, Eye } from 'lucide-react';

const BusinessDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalListings: 0,
    activeLisings: 0,
    totalSales: 0,
    totalRevenue: 0,
    savedMeals: 0,
  });
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const listingsRef = collection(db, 'listings');
        const q = query(listingsRef, where('businessId', '==', user.id), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const listings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const totalListings = listings.length;
        const activeLisings = listings.filter((l: any) => l.status === 'available').length;
        const totalSales = listings.reduce((sum: number, l: any) => sum + (l.sales || 0), 0);
        const totalRevenue = listings.reduce((sum: number, l: any) => sum + (l.revenue || 0), 0);
        const savedMeals = listings.reduce((sum: number, l: any) => sum + (l.savedMeals || 0), 0);
        setStats({ totalListings, activeLisings, totalSales, totalRevenue, savedMeals });
        setRecentListings(listings.slice(0, 3));
      } catch (error) {
        setStats({ totalListings: 0, activeLisings: 0, totalSales: 0, totalRevenue: 0, savedMeals: 0 });
        setRecentListings([]);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Business Dashboard</h1>
              <p className="text-muted-foreground">Track your food listings and impact</p>
            </div>
            <Button asChild>
              <Link to="/business/add-listing">
                <Plus className="mr-2 h-4 w-4" />
                Add Food Listing
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalListings}</div>
              <p className="text-xs text-muted-foreground">
                All time listings created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              <Clock className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.activeLisings}</div>
              <p className="text-xs text-muted-foreground">
                Currently available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSales}</div>
              <p className="text-xs text-muted-foreground">
                Items sold
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KSh {stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total earnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meals Saved</CardTitle>
              <Package className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.savedMeals}</div>
              <p className="text-xs text-muted-foreground">
                Environmental impact
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Listings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Listings</CardTitle>
                <CardDescription>Your latest food listings and their performance</CardDescription>
              </div>
              <Button variant="outline" asChild>
                <Link to="/business/listings">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentListings.map((listing) => (
                <div key={listing.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold">{listing.title}</h4>
                      <Badge 
                        variant={listing.status === 'available' ? 'default' : 'secondary'}
                        className={listing.status === 'available' ? 'bg-success text-success-foreground' : ''}
                      >
                        {listing.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>KSh {listing.price}</span>
                      <span>{listing.quantity} portions</span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {listing.views} views
                      </span>
                      <span>Expires: {new Date(listing.expiryTime).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessDashboard;