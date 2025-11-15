import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Clock, DollarSign, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AddListing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    originalPrice: '',
    quantity: '',
    unit: 'pieces',
    expiryDate: '',
    expiryTime: '',
    pickupDate: '',
    pickupTime: '',
    location: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user?.id) throw new Error('User not authenticated');
      console.log('AddListing: user.id =', user.id);
      const listingData = {
        ...formData,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        quantity: Number(formData.quantity),
        businessId: user.id,
        status: 'available',
        createdAt: serverTimestamp(),
        expiryTime: new Date(`${formData.expiryDate}T${formData.expiryTime}`).toISOString(),
        pickupTime: new Date(`${formData.pickupDate}T${formData.pickupTime}`).toISOString(),
        views: 0,
        orders: 0,
      };
      const docRef = await addDoc(collection(db, 'listings'), listingData);
      console.log('AddListing: added listing with id', docRef.id, 'data:', listingData);
      toast({
        title: "Listing created successfully!",
        description: "Your food listing is now live and available to buyers.",
      });
      navigate('/business/listings');
    } catch (error) {
      console.error('AddListing: error', error);
      toast({
        title: "Error creating listing",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/business/listings')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Listings
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Add Food Listing</h1>
          <p className="text-muted-foreground">Share your surplus food with the community</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Food Details</CardTitle>
              <CardDescription>
                Provide clear information about your surplus food to attract buyers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Food Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Fresh Pastries & Croissants"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the food items, freshness, and any special notes..."
                      rows={3}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select food category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bakery">Bakery</SelectItem>
                        <SelectItem value="restaurant">Restaurant</SelectItem>
                        <SelectItem value="cafe">Cafe</SelectItem>
                        <SelectItem value="hotel">Hotel</SelectItem>
                        <SelectItem value="catering">Catering</SelectItem>
                        <SelectItem value="grocery">Grocery</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Pricing & Quantity */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="originalPrice" className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Original Price (KSh) *
                      </Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        placeholder="100"
                        min="0"
                        step="0.01"
                        value={formData.originalPrice}
                        onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="price" className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Discounted Price (KSh) *
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="60"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantity" className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        Quantity Available *
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        placeholder="10"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => handleInputChange('quantity', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="unit">Unit</Label>
                      <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pieces">Pieces</SelectItem>
                          <SelectItem value="portions">Portions</SelectItem>
                          <SelectItem value="platters">Platters</SelectItem>
                          <SelectItem value="containers">Containers</SelectItem>
                          <SelectItem value="kg">Kilograms</SelectItem>
                          <SelectItem value="liters">Liters</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Timing */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate" className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Expiry Date *
                      </Label>
                      <Input
                        id="expiryDate"
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="expiryTime">Expiry Time *</Label>
                      <Input
                        id="expiryTime"
                        type="time"
                        value={formData.expiryTime}
                        onChange={(e) => handleInputChange('expiryTime', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pickupDate">Pickup Date *</Label>
                      <Input
                        id="pickupDate"
                        type="date"
                        value={formData.pickupDate}
                        onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="pickupTime">Pickup Time *</Label>
                      <Input
                        id="pickupTime"
                        type="time"
                        value={formData.pickupTime}
                        onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <Label htmlFor="location">Pickup Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Westlands, Nairobi - Specific address will be shared after purchase"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    required
                  />
                </div>

                {/* Submit */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/business/listings')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'Creating...' : 'Create Listing'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};