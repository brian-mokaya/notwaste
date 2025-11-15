import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Package, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

export const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Real-time listener for user's orders
    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        setOrders(ordersData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching orders:', error);
        setOrders([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'confirmed':
        return 'bg-green-500 text-white';
      case 'ready':
        return 'bg-blue-500 text-white';
      case 'completed':
        return 'bg-gray-500 text-white';
      case 'cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'completed':
        return <Badge className="bg-green-500 text-white">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500 text-white">Failed</Badge>;
      default:
        return <Badge variant="outline">{paymentStatus}</Badge>;
    }
  };

  const stats = {
    totalOrders: orders.length,
    totalSpent: orders.reduce((sum, order) => sum + order.totalAmount, 0),
    mealsSaved: orders.reduce((sum, order) => sum + order.quantity, 0),
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Orders</h1>
          <p className="text-muted-foreground">Track your surplus food orders and impact</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">Orders placed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KSh {stats.totalSpent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Money saved on food</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meals Saved</CardTitle>
              <Package className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.mealsSaved}</div>
              <p className="text-xs text-muted-foreground">Environmental impact</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>Your recent surplus food orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">
                        Order #{order.paymentReference || order.id.slice(0, 8)}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {order.items?.length || 0} item(s)
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </div>
                  </div>
                  
                  {/* Order Items */}
                  <div className="space-y-2 mb-3">
                    {order.items?.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.title}</span>
                        <span className="text-muted-foreground">KSh {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-3" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">Total: KSh {order.totalAmount?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(order.orderDate || order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {order.mpesaReceiptNumber && (
                    <div className="mt-3 p-2 bg-muted rounded text-sm">
                      <span className="font-medium">M-PESA Receipt: </span>
                      <span className="text-muted-foreground">{order.mpesaReceiptNumber}</span>
                    </div>
                  )}

                  {/* Payment Status Messages */}
                  {order.paymentStatus === 'pending' && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">⏳ Awaiting Payment</span>
                      </div>
                      <p className="mt-1 text-xs">Please complete the M-PESA prompt on your phone.</p>
                    </div>
                  )}

                  {order.paymentStatus === 'completed' && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">✅ Payment Completed</span>
                      </div>
                      <p className="mt-1 text-xs">
                        Your payment has been successfully received! 
                        {order.status === 'confirmed' && ' Your order is being prepared.'}
                        {order.status === 'ready' && ' Your order is ready for pickup!'}
                        {order.status === 'completed' && ' This order has been completed.'}
                      </p>
                    </div>
                  )}

                  {order.paymentStatus === 'failed' && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">❌ Payment Failed</span>
                      </div>
                      <p className="mt-1 text-xs">
                        {order.paymentError || 'The payment was not completed. Please try again.'}
                      </p>
                      <Button size="sm" variant="destructive" className="mt-2">
                        Retry Payment
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {!loading && orders.length === 0 && (
          <Card className="p-12 text-center">
            <CardContent>
              <div className="text-6xl mb-4">📦</div>
              <CardTitle className="mb-2">No orders yet</CardTitle>
              <CardDescription className="mb-4">
                Start browsing surplus food to place your first order.
              </CardDescription>
              <Button onClick={() => navigate('/browse')}>Browse Food</Button>
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card className="p-12 text-center">
            <CardContent>
              <div className="text-4xl mb-4">⏳</div>
              <CardDescription>Loading your orders...</CardDescription>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
