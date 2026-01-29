import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, Users, ShoppingBag, BarChart3, ArrowRight, Heart, Zap, TrendingUp, Sprout } from 'lucide-react';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-transparent to-accent/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/15 border border-success/30">
              <Leaf className="w-4 h-4 text-success" />
              <span className="text-sm font-semibold text-success">Turning Waste Into Opportunity</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-foreground leading-tight text-balance">
              Stop Waste,
              <span className="block text-success mt-2">Feed Community</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Connect surplus food with people who need it. Businesses recover costs, communities thrive, and together we reduce environmental impact.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild className="text-base px-8 h-12 rounded-lg font-semibold">
                <Link to="/register">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="text-base px-8 h-12 rounded-lg font-semibold">
                <Link to="/browse">Explore Food</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-muted/40 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-5xl font-bold text-foreground">How WasteNot Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Three simple steps to create positive impact</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="relative">
              <Card className="h-full border-2 hover:border-success/50 transition-colors">
                <CardHeader className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 bg-success/20 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="h-7 w-7 text-success" />
                    </div>
                    <span className="text-3xl font-bold text-success/30">01</span>
                  </div>
                  <div>
                    <CardTitle className="text-xl">Businesses List</CardTitle>
                    <CardDescription className="text-base">
                      Restaurants and cafes upload surplus food details
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
              <div className="hidden md:block absolute right-0 top-1/2 w-8 h-1 bg-success/30 transform translate-x-8 -translate-y-1/2" />
            </div>

            {/* Step 2 */}
            <div className="relative">
              <Card className="h-full border-2 hover:border-accent/50 transition-colors">
                <CardHeader className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 bg-accent/20 rounded-lg flex items-center justify-center">
                      <Users className="h-7 w-7 text-accent" />
                    </div>
                    <span className="text-3xl font-bold text-accent/30">02</span>
                  </div>
                  <div>
                    <CardTitle className="text-xl">Community Finds</CardTitle>
                    <CardDescription className="text-base">
                      Buyers browse and purchase food at great prices
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
              <div className="hidden md:block absolute right-0 top-1/2 w-8 h-1 bg-accent/30 transform translate-x-8 -translate-y-1/2" />
            </div>

            {/* Step 3 */}
            <div className="relative">
              <Card className="h-full border-2 hover:border-success/50 transition-colors">
                <CardHeader className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 bg-success/20 rounded-lg flex items-center justify-center">
                      <Heart className="h-7 w-7 text-success" />
                    </div>
                    <span className="text-3xl font-bold text-success/30">03</span>
                  </div>
                  <div>
                    <CardTitle className="text-xl">Impact Grows</CardTitle>
                    <CardDescription className="text-base">
                      Waste reduced, money saved, community strengthened
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* User Types Section */}
      <div className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-5xl font-bold text-foreground">Choose Your Path</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Whether you run a business or seek quality food, there's a role for you</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Business Card */}
            <Card className="border-2 overflow-hidden hover:shadow-lg transition-all">
              <div className="h-2 bg-gradient-to-r from-success to-success/60" />
              <CardHeader>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-14 h-14 bg-success/20 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="h-7 w-7 text-success" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">For Businesses</CardTitle>
                    <CardDescription>Restaurants, Bakeries, Cafes, Hotels</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">List surplus food in seconds</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Track impact and recover costs</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Leaf className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Build brand reputation</span>
                  </li>
                </ul>
                <Button className="w-full rounded-lg h-11 font-semibold" asChild>
                  <Link to="/register">Join as Business</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Buyer Card */}
            <Card className="border-2 overflow-hidden hover:shadow-lg transition-all">
              <div className="h-2 bg-gradient-to-r from-accent to-accent/60" />
              <CardHeader>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-14 h-14 bg-accent/20 rounded-lg flex items-center justify-center">
                    <Users className="h-7 w-7 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">For Buyers</CardTitle>
                    <CardDescription>Individuals, NGOs, Hostels, Institutions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Sprout className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Quality food at discounted prices</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Support local businesses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Leaf className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Make environmental impact</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full rounded-lg h-11 font-semibold" asChild>
                  <Link to="/register">Join as Buyer</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Impact Statistics Section */}
      <div className="py-24 bg-gradient-to-br from-success/10 to-accent/10 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-5xl font-bold text-foreground">Our Impact</h2>
            <p className="text-lg text-muted-foreground">Real numbers from our growing community</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="text-center p-6 rounded-lg bg-background/50 border border-border hover:border-success/50 transition-colors">
              <div className="text-4xl font-bold text-success mb-2">2,000+</div>
              <div className="text-sm text-muted-foreground font-medium">Meals Saved</div>
            </div>
            <div className="text-center p-6 rounded-lg bg-background/50 border border-border hover:border-accent/50 transition-colors">
              <div className="text-4xl font-bold text-accent mb-2">150+</div>
              <div className="text-sm text-muted-foreground font-medium">Partners</div>
            </div>
            <div className="text-center p-6 rounded-lg bg-background/50 border border-border hover:border-success/50 transition-colors">
              <div className="text-4xl font-bold text-success mb-2">500+</div>
              <div className="text-sm text-muted-foreground font-medium">Community Members</div>
            </div>
            <div className="text-center p-6 rounded-lg bg-background/50 border border-border hover:border-accent/50 transition-colors">
              <div className="text-4xl font-bold text-accent mb-2">1.2T</div>
              <div className="text-sm text-muted-foreground font-medium">CO₂ Saved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="text-5xl font-bold text-foreground">Ready to Make a Difference?</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Join thousands of people and businesses fighting food waste. Start your journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild className="text-base px-8 h-12 rounded-lg font-semibold">
                <Link to="/register">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="text-base px-8 h-12 rounded-lg font-semibold">
                <Link to="/browse">Browse Available Food</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
