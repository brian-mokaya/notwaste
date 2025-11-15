import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, Eye, Clock, DollarSign } from 'lucide-react';

const Listings = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editListing, setEditListing] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editSubmitting, setEditSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      console.log('Listings: No user or user.id');
      return;
    }
    console.log('Listings: user.id =', user.id);
    const fetchListings = async () => {
      setLoading(true);
      try {
        const listingsRef = collection(db, 'listings');
        const q = query(
          collection(db, 'listings'),
          where('businessId', '==', user.id),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Listings: fetched', data.length, 'items for businessId', user.id);
        setListings(data);
      } catch (error) {
        console.error('Listings: fetch error', error);
        setListings([]);
      }
      setLoading(false);
    };
    fetchListings();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-success text-success-foreground';
      case 'sold':
        return 'bg-secondary text-secondary-foreground';
      case 'expired':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'listings', id));
      setListings(prev => prev.filter(l => l.id !== id));
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const openEditModal = (listing: any) => {
    setEditListing(listing);
    setEditForm({ ...listing });
    setEditOpen(true);
  };

  const handleEditInputChange = (field: string, value: string) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditSubmitting(true);
    try {
      console.log('Submitting edit for listing', editListing.id, editForm);
      await updateListing(editListing.id, editForm);
      setListings(prev => prev.map(l => l.id === editListing.id ? { ...l, ...editForm } : l));
      setEditOpen(false);
    } catch (error) {
      console.error('Edit failed', error);
    } finally {
      setEditSubmitting(false);
    }
  };

  const updateListing = async (id: string, data: any) => {
    try {
      console.log('Calling setDoc for listing', id, data);
      await setDoc(doc(db, 'listings', id), data, { merge: true });
      console.log('setDoc success');
    } catch (err) {
      console.error('setDoc error', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-muted-foreground">Loading listings...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Listings</h1>
              <p className="text-muted-foreground">Manage your food listings</p>
            </div>
            <Button asChild>
              <Link to="/business/add-listing">
                <Plus className="mr-2 h-4 w-4" />
                Add New Listing
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search listings..."
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
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="sold">Sold Out</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-accent/20 to-success/20 flex items-center justify-center relative">
                <div className="text-center">
                  <div className="text-3xl mb-1">🍞</div>
                  <p className="text-xs text-muted-foreground">{listing.category}</p>
                </div>
                <Badge className={`absolute top-2 right-2 ${getStatusColor(listing.status)}`}>
                  {listing.status}
                </Badge>
              </div>
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="line-clamp-1 text-lg">{listing.title}</CardTitle>
                </div>
                <CardDescription className="line-clamp-2">
                  {listing.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-success">
                      KSh {listing.price}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      KSh {listing.originalPrice}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {listing.quantity} {listing.unit}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{listing.views} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span>{listing.orders} orders</span>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="h-3 w-3" />
                    <span>Expires: {new Date(listing.expiryTime).toLocaleString()}</span>
                  </div>
                  <span>Created: {new Date(listing.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditModal(listing)}>
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" className="flex-1" onClick={() => handleDelete(listing.id)}>
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredListings.length === 0 && (
          <Card className="p-12 text-center">
            <CardContent>
              <div className="text-6xl mb-4">📋</div>
              <CardTitle className="mb-2">No listings found</CardTitle>
              <CardDescription className="mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters.'
                  : 'Create your first food listing to get started.'
                }
              </CardDescription>
              <Button asChild>
                <Link to="/business/add-listing">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Listing
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
        {/* Edit Modal */}
        {editOpen && editListing && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg max-w-lg w-full mx-4">
              <h2 className="text-xl font-bold mb-4">Edit Listing</h2>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <Input
                  placeholder="Title"
                  value={editForm.title || ''}
                  onChange={e => handleEditInputChange('title', e.target.value)}
                  required
                />
                <Textarea
                  placeholder="Description"
                  value={editForm.description || ''}
                  onChange={e => handleEditInputChange('description', e.target.value)}
                  required
                />
                <Input
                  placeholder="Price"
                  type="number"
                  value={editForm.price || ''}
                  onChange={e => handleEditInputChange('price', e.target.value)}
                  required
                />
                <Input
                  placeholder="Quantity"
                  type="number"
                  value={editForm.quantity || ''}
                  onChange={e => handleEditInputChange('quantity', e.target.value)}
                  required
                />
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={editSubmitting}>
                    {editSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Listings;