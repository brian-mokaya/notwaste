import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Building2, Check, X, Eye, Mail, Phone, MapPin } from 'lucide-react';

export const Businesses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      try {
        const businessesRef = collection(db, 'businesses');
        const querySnapshot = await getDocs(businessesRef);
        const data = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        setBusinesses(data);
      } catch (error) {
        console.error('Error fetching businesses:', error);
        setBusinesses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success text-success-foreground';
      case 'pending':
        return 'bg-accent text-accent-foreground';
      case 'suspended':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || business.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (businessId: string) => {
    try {
      // TODO: Implement approval logic with Firebase
      console.log('Approving business:', businessId);
      // Update business status in Firebase
    } catch (error) {
      console.error('Error approving business:', error);
    }
  };

  const handleReject = async (businessId: string) => {
    try {
      // TODO: Implement rejection logic with Firebase
      console.log('Rejecting business:', businessId);
      // Update business status in Firebase
    } catch (error) {
      console.error('Error rejecting business:', error);
    }
  };

  const handleSuspend = async (businessId: string) => {
    try {
      // TODO: Implement suspension logic with Firebase
      console.log('Suspending business:', businessId);
      // Update business status in Firebase
    } catch (error) {
      console.error('Error suspending business:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading businesses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Manage Businesses</h1>
          <p className="text-muted-foreground">Review and manage business registrations</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search businesses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending Approval</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Businesses List */}
        <div className="space-y-6">
          {filteredBusinesses.map((business) => (
            <Card key={business.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-accent">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{business.name || 'Unnamed Business'}</CardTitle>
                      <CardDescription className="capitalize">{business.category || 'Unknown Category'}</CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(business.status)}>
                    {business.status || 'unknown'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{business.email || 'No email provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{business.phone || 'No phone provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{business.address || 'No address provided'}</span>
                  </div>
                </div>

                {/* Business Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-accent/10 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{business.totalListings || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Listings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{business.totalSales || 0}</div>
                    <div className="text-sm text-muted-foreground">Sales Made</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">KSh {(business.revenue || 0).toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {business.createdAt ? Math.floor((Date.now() - new Date(business.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Days Active</div>
                  </div>
                </div>

                {/* Activity Info */}
                <div className="text-sm text-muted-foreground">
                  <div>Joined: {business.createdAt ? new Date(business.createdAt).toLocaleDateString() : 'Unknown'}</div>
                  <div>Last Active: {business.lastActive ? new Date(business.lastActive).toLocaleString() : 'Unknown'}</div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                  
                  {business.status === 'pending' && (
                    <>
                      <Button 
                        size="sm" 
                        onClick={() => handleApprove(business.id)}
                        className="bg-success text-success-foreground hover:bg-success/90"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleReject(business.id)}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </>
                  )}
                  
                  {business.status === 'active' && (
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleSuspend(business.id)}
                    >
                      Suspend
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBusinesses.length === 0 && (
          <Card className="p-12 text-center">
            <CardContent>
              <div className="text-6xl mb-4">🏢</div>
              <CardTitle className="mb-2">No businesses found</CardTitle>
              <CardDescription>
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters.'
                  : 'No businesses have registered yet.'
                }
              </CardDescription>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};