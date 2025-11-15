import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, Users, ShoppingBag, BarChart3, ArrowRight, Heart, Shield, Clock } from 'lucide-react';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <Badge variant="secondary" className="text-success-foreground bg-success/20">
              <Leaf className="w-4 h-4 mr-2" />
              Fighting Food Waste Together
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
              Turn Food Waste Into
              <span className="text-success"> Community Support</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect businesses with surplus food to people who need it. 
              Save money, reduce waste, and build stronger communities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link to="/register">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="text-lg px-8 py-6">
                <Link to="/browse">Browse Food</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">How WasteNot Works</h2>
            <p className="text-xl text-muted-foreground">Simple steps to make a big difference</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="h-8 w-8 text-success" />
                </div>
                <CardTitle>Businesses List Surplus</CardTitle>
                <CardDescription>
                  Restaurants, bakeries, and cafes upload details of surplus food instead of throwing it away
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-accent" />
                </div>
                <CardTitle>Community Purchases</CardTitle>
                <CardDescription>
                  Individuals, NGOs, and hostels buy surplus food at discounted prices for personal use or redistribution
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-warning" />
                </div>
                <CardTitle>Everyone Wins</CardTitle>
                <CardDescription>
                  Businesses recover costs, communities get affordable food, and together we reduce environmental impact
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* User Types Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">Join as</h2>
            <p className="text-xl text-muted-foreground">Choose your role in the fight against food waste</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 hover:border-success transition-colors">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Business Owner</CardTitle>
                    <CardDescription>Restaurant, Bakery, Cafe, Hotel</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-success" />
                    List surplus food quickly and easily
                  </li>
                  <li className="flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2 text-success" />
                    Track sales and environmental impact
                  </li>
                  <li className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-success" />
                    Recover costs from food that would be wasted
                  </li>
                </ul>
                <Button className="w-full" asChild>
                  <Link to="/register">Join as Business</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-accent transition-colors">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Buyer</CardTitle>
                    <CardDescription>Individual, NGO, Hostel, Institution</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-accent" />
                    Get quality food at discounted prices
                  </li>
                  <li className="flex items-center">
                    <Heart className="h-4 w-4 mr-2 text-accent" />
                    Support local businesses and community
                  </li>
                  <li className="flex items-center">
                    <Leaf className="h-4 w-4 mr-2 text-accent" />
                    Reduce environmental impact together
                  </li>
                </ul>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/register">Join as Buyer</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Impact Section */}
      <div className="py-20 bg-success/5">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-8 max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-foreground">Making a Real Impact</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-success mb-2">2,000+</div>
                <div className="text-sm text-muted-foreground">Meals Saved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success mb-2">150+</div>
                <div className="text-sm text-muted-foreground">Businesses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success mb-2">500+</div>
                <div className="text-sm text-muted-foreground">Community Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success mb-2">1.2T</div>
                <div className="text-sm text-muted-foreground">CO₂ Reduced</div>
              </div>
            </div>
            
            <Button size="lg" asChild>
              <Link to="/register">
                Start Your Impact Today <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};