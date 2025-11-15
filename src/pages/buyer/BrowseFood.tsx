import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Clock, ShoppingCart, Star, Plus } from 'lucide-react';
import { FoodListing } from '@/types/food';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

export const BrowseFood = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const { db } = await import('@/lib/firebase');
        const { collection, getDocs } = await import('firebase/firestore');
        const querySnapshot = await getDocs(collection(db, 'listings'));
        const listingsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FoodListing[];
        setListings(listingsData);
      } catch (error) {
        setListings([]);
      }
      setLoading(false);
    };
    fetchListings();
  }, []);

  const getTimeRemaining = (expiryTime: string) => {
    const now = new Date();
    const expiry = new Date(expiryTime);
    const diff = expiry.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diff < 0) return 'Expired';
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const getDiscountPercentage = (price: number, originalPrice?: number) => {
    if (!originalPrice) return null;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const handleAddToCart = (listing: FoodListing) => {
    addToCart({
      id: `cart-${listing.id}-${Date.now()}`,
      listingId: listing.id,
      title: listing.title,
      price: listing.price,
      businessName: listing.businessName || 'Unknown Business',
      expiryTime: listing.expiryTime,
      image: listing.imageUrl
    });

    toast({
      title: "Added to cart",
      description: `${listing.title} has been added to your cart.`,
    });
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.businessName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || listing.category === categoryFilter;
    
    const matchesPrice = priceFilter === 'all' || 
                        (priceFilter === 'under-30' && listing.price < 30) ||
                        (priceFilter === '30-60' && listing.price >= 30 && listing.price <= 60) ||
                        (priceFilter === 'over-60' && listing.price > 60);

    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Browse Surplus Food</h1>
          <p className="text-muted-foreground">Discover quality food at discounted prices near you</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search food, business..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="bakery">Bakery</SelectItem>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="cafe">Cafe</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Prices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under-30">Under KSh 30</SelectItem>
                  <SelectItem value="30-60">KSh 30 - 60</SelectItem>
                  <SelectItem value="over-60">Over KSh 60</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="w-full">
                <MapPin className="mr-2 h-4 w-4" />
                Near Me
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => {
            const discount = getDiscountPercentage(listing.price, listing.originalPrice);
            
            return (
              <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <div className="h-48 bg-gradient-to-br from-accent/20 to-success/20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🍞</div>
                      <p className="text-sm text-muted-foreground">{listing.category}</p>
                    </div>
                  </div>
                  
                  {discount && (
                    <Badge className="absolute top-2 right-2 bg-warning text-warning-foreground">
                      {discount}% OFF
                    </Badge>
                  )}
                  
                  <Badge 
                    variant="secondary"
                    className="absolute top-2 left-2 bg-background/90 text-foreground"
                  >
                    <Clock className="mr-1 h-3 w-3" />
                    {getTimeRemaining(listing.expiryTime)}
                  </Badge>
                </div>
                
                <CardHeader>
                  <CardTitle className="line-clamp-1">{listing.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {listing.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-warning fill-warning" />
                      <span className="text-sm font-medium">{listing.businessName}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-1 h-3 w-3" />
                      {listing.location}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-success">
                        KSh {listing.price}
                      </span>
                      {listing.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          KSh {listing.originalPrice}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {listing.quantity} {listing.unit}
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Pickup by: {new Date(listing.pickupTime).toLocaleTimeString()}
                  </div>
                  
                   <Button 
                     className="w-full" 
                     onClick={() => handleAddToCart(listing)}
                   >
                     <Plus className="mr-2 h-4 w-4" />
                     Add to Cart
                   </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredListings.length === 0 && (
          <Card className="p-12 text-center">
            <CardContent>
              <div className="text-6xl mb-4">🔍</div>
              <CardTitle className="mb-2">No food found</CardTitle>
              <CardDescription>
                Try adjusting your search terms or filters to find available food.
              </CardDescription>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};