import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, User, Mail, Phone, MapPin, Calendar, ShoppingBag, Building2 } from 'lucide-react';

export const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(data);
      } catch (error) {
        setUsers([]);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'business':
        return 'bg-accent text-accent-foreground';
      case 'buyer':
        return 'bg-success text-success-foreground';
      case 'admin':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success text-success-foreground';
      case 'inactive':
        return 'bg-muted text-muted-foreground';
      case 'suspended':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.businessName && user.businessName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Manage Users</h1>
          <p className="text-muted-foreground">View and manage all platform users</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="buyer">Buyers</SelectItem>
                  <SelectItem value="business">Businesses</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="space-y-6">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-accent">
                      {user.role === 'business' ? (
                        <Building2 className="h-6 w-6" />
                      ) : (
                        <User className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{user.name}</CardTitle>
                      <CardDescription>
                        {user.businessName && `${user.businessName} • `}
                        {user.organizationType} • {user.role}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                    <Badge className={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{user.address}</span>
                  </div>
                </div>

                {/* User Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-accent/10 rounded-lg">
                  {user.role === 'buyer' ? (
                    <>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{user.totalOrders}</div>
                        <div className="text-sm text-muted-foreground">Total Orders</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">KSh {user.totalSpent?.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Total Spent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {user.totalSpent && user.totalOrders ? Math.round(user.totalSpent / user.totalOrders) : 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Avg Order (KSh)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {Math.floor((Date.now() - new Date(user.joinedAt).getTime()) / (1000 * 60 * 60 * 24))}
                        </div>
                        <div className="text-sm text-muted-foreground">Days Active</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{user.totalListings}</div>
                        <div className="text-sm text-muted-foreground">Total Listings</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{user.totalSales}</div>
                        <div className="text-sm text-muted-foreground">Sales Made</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">KSh {user.revenue?.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {Math.floor((Date.now() - new Date(user.joinedAt).getTime()) / (1000 * 60 * 60 * 24))}
                        </div>
                        <div className="text-sm text-muted-foreground">Days Active</div>
                      </div>
                    </>
                  )}
                </div>

                {/* Activity Info */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined: {new Date(user.joinedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Last Active: {new Date(user.lastActive).toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                  {user.status === 'active' && (
                    <Button size="sm" variant="destructive">
                      Suspend User
                    </Button>
                  )}
                  {user.status === 'suspended' && (
                    <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90">
                      Reactivate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card className="p-12 text-center">
            <CardContent>
              <div className="text-6xl mb-4">👥</div>
              <CardTitle className="mb-2">No users found</CardTitle>
              <CardDescription>
                {searchTerm || roleFilter !== 'all' 
                  ? 'Try adjusting your search or filters.'
                  : 'No users have registered yet.'
                }
              </CardDescription>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};