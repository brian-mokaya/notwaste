import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Plus, Minus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PayHeroPayment } from '@/lib/payhero';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export const CartDrawer = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, getItemCount } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to make a purchase.",
        variant: "destructive",
      });
      return;
    }

    if (cart.items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add items to your cart before checking out.",
        variant: "destructive",
      });
      return;
    }

    // Show phone number dialog
    setPhoneNumber(user.phone || '');
    setShowPhoneDialog(true);
  };

  const handlePaymentSubmit = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number (e.g., 0712345678)",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setShowPhoneDialog(false);

    try {
      // Get channel_id from environment
      const channelId = parseInt(import.meta.env.VITE_PAYHERO_CHANNEL_ID || '0');
      if (!channelId) {
        throw new Error('Payment channel not configured. Please add VITE_PAYHERO_CHANNEL_ID to your .env file.');
      }

      const basicAuth = import.meta.env.VITE_PAYHERO_BASIC_AUTH;
      if (!basicAuth) {
        throw new Error('PayHero credentials not configured. Please add VITE_PAYHERO_BASIC_AUTH to your .env file.');
      }

      const orderReference = `ORDER-${Date.now()}`;

      // Create order in Firestore first (pending payment)
      const orderData = {
        userId: user?.id,
        userName: user?.name || user?.email || 'Customer',
        userEmail: user?.email,
        userPhone: phoneNumber,
        items: cart.items.map(item => ({
          id: item.id,
          title: item.title,
          businessName: item.businessName,
          price: item.price,
          quantity: item.quantity,
          expiryTime: item.expiryTime,
        })),
        totalAmount: Math.round(cart.total),
        status: 'pending',
        paymentStatus: 'pending',
        paymentReference: orderReference,
        orderDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const orderDoc = await addDoc(collection(db, 'orders'), orderData);
      console.log('Order created with ID:', orderDoc.id);

      // Direct API call to PayHero (for development - move to backend in production)
      const response = await fetch('https://backend.payhero.co.ke/api/v2/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${basicAuth}`,
        },
        body: JSON.stringify({
          amount: Math.round(cart.total),
          phone_number: phoneNumber,
          channel_id: channelId,
          provider: 'm-pesa',
          external_reference: orderReference,
          customer_name: user?.name || user?.email || 'Customer',
          callback_url: `${window.location.origin}/api/payment/webhook`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || data?.message || `Payment failed with status ${response.status}`);
      }

      if (data.success) {
        // MPESA STK Push is queued; inform the user to check their phone.
        toast({
          title: '✅ STK Push Sent!',
          description: `Check your phone (${phoneNumber}) to complete payment. Once you enter your M-PESA PIN and confirm, your payment will be marked as COMPLETED.`,
          duration: 8000,
        });
        
        // Show success message with next steps
        toast({
          title: '📱 Next Steps',
          description: 'After payment: Go to "My Orders" to track your order. Payment status will change to "Completed" once confirmed.',
          duration: 10000,
        });
        
        // Clear cart after successful payment initiation
        clearCart();
        setIsOpen(false); // Close cart drawer
      } else {
        throw new Error('Payment initiation failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const itemCount = getItemCount();

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <ShoppingCart className="h-4 w-4" />
            {itemCount > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                {itemCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
          <SheetDescription>
            {itemCount > 0 ? `${itemCount} item${itemCount !== 1 ? 's' : ''} in your cart` : 'Your cart is empty'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {cart.items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mt-1">Add items from our surplus food listings</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-3 border border-border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.businessName}</p>
                      <p className="text-sm font-medium">KSh {item.price.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        Expires: {new Date(item.expiryTime).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex justify-between items-center font-medium">
                  <span>Total</span>
                  <span>KSh {cart.total.toLocaleString()}</span>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={handleCheckout}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Proceed to Payment'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={clearCart}
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>

    {/* Phone Number Dialog for Payment */}
    <Dialog open={showPhoneDialog} onOpenChange={setShowPhoneDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Phone Number</DialogTitle>
          <DialogDescription>
            Enter your M-PESA phone number to receive the STK push for payment.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="0712345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              maxLength={10}
              disabled={isProcessing}
            />
            <p className="text-sm text-muted-foreground">
              Format: 07XXXXXXXX or 01XXXXXXXX
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Amount to pay:</span>
              <span className="font-bold">KSh {cart.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowPhoneDialog(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePaymentSubmit}
            disabled={isProcessing || !phoneNumber}
          >
            {isProcessing ? 'Processing...' : 'Send STK Push'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};