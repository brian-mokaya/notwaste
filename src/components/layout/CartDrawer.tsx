import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Plus, Minus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PayHeroPayment } from '@/lib/payhero';

export const CartDrawer = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, getItemCount } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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

    setIsProcessing(true);
    try {
      const payment = new PayHeroPayment();
      const result = await payment.initiatePayment({
        amount: Math.round(cart.total),
        phone_number: user.phone,
        provider: 'm-pesa',
        external_reference: `ORDER-${Date.now()}`,
        customer_name: user.name || user.email,
      });

      if (result.success) {
        // MPESA STK Push is queued; inform the user to check their phone.
        toast({
          title: 'Payment started',
          description: `Payment queued. Reference: ${result.reference || result.CheckoutRequestID || ''}`,
        });
      } else {
        throw new Error(result.error || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const itemCount = getItemCount();

  return (
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
  );
};