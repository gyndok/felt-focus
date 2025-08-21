import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, DollarSign, BarChart3, Shield, Mail, Smartphone, Calendar, MapPin, Camera, FileSpreadsheet, Timer, PieChart, KeyRound, Twitter, Bug } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <DollarSign className="h-6 w-6 text-green-400" />,
      title: "Track Profits & Losses",
      description: "Monitor your poker bankroll with detailed profit/loss tracking across all sessions"
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-blue-400" />,
      title: "Live Charts & Analytics",
      description: "Visualize your performance with interactive charts and comprehensive statistics"
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-green-400" />,
      title: "ROI Calculations",
      description: "Automatically calculate return on investment for your sessions and filtered time periods"
    },
    {
      icon: <Clock className="h-6 w-6 text-blue-400" />,
      title: "Session Timer",
      description: "Built-in timer to accurately track session duration and calculate hourly rates"
    },
    {
      icon: <PieChart className="h-6 w-6 text-green-400" />,
      title: "Hourly Rate Analysis",
      description: "Automatically calculate your hourly win rate across different games and stakes"
    },
    {
      icon: <Calendar className="h-6 w-6 text-blue-400" />,
      title: "Date Range Filtering",
      description: "Filter sessions by custom date ranges to analyze specific time periods"
    },
    {
      icon: <MapPin className="h-6 w-6 text-green-400" />,
      title: "Location & Game Tracking",
      description: "Track different venues, game types, and stakes for detailed analysis"
    },
    {
      icon: <Camera className="h-6 w-6 text-blue-400" />,
      title: "Receipt Photos",
      description: "Attach photos of your receipts or tickets for better record keeping"
    },
    {
      icon: <FileSpreadsheet className="h-6 w-6 text-green-400" />,
      title: "CSV Import/Export",
      description: "Import existing data or export your sessions for external analysis"
    },
    {
      icon: <Timer className="h-6 w-6 text-blue-400" />,
      title: "Live Tournaments",
      description: "Track tournament progress in real-time with built-in tournament timer"
    },
    {
      icon: <Smartphone className="h-6 w-6 text-green-400" />,
      title: "Desktop, Tablet & Mobile",
      description: "Fully optimized responsive design works seamlessly across all your devices"
    },
    {
      icon: <KeyRound className="h-6 w-6 text-blue-400" />,
      title: "Two-Factor Authentication",
      description: "Secure your account with 2FA using authenticator apps for enhanced protection"
    }
  ];

  const stats = [
    { label: "Cash Games", value: "✓", color: "text-green-400" },
    { label: "Tournaments", value: "✓", color: "text-blue-400" },
    { label: "Live Tracking", value: "✓", color: "text-green-400" },
    { label: "Analytics", value: "✓", color: "text-blue-400" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-green-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden">
                <img 
                  src="/lovable-uploads/cdc2af24-7343-4b17-83eb-e6944ab0ef53.png" 
                  alt="Felt Focus" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Brand Name */}
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Felt Focus
          </h1>

          {/* Tagline */}
          <h2 className="text-3xl md:text-4xl font-semibold text-green-400 mb-6">
            Track your poker bankroll
          </h2>

          {/* Beta Badge */}
          <div className="flex justify-center mb-6">
            <Badge variant="outline" className="bg-orange-500/10 border-orange-400 text-orange-400 px-6 py-2 text-lg animate-pulse">
              <TrendingUp className="h-5 w-5 mr-2" />
              Beta Testing - Your Feedback Appreciated!
            </Badge>
          </div>

          {/* Subtitle */}
          <p className="text-xl text-blue-200 mb-8 max-w-3xl mx-auto">
            Analyze your sessions & tournaments with live charts and stats
          </p>

          {/* Privacy Badge */}
          <div className="flex justify-center mb-8">
            <Badge variant="outline" className="bg-white/10 border-green-400 text-green-400 px-6 py-2 text-lg">
              <Shield className="h-5 w-5 mr-2" />
              Private & Secure - Email Only Accounts
            </Badge>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 text-lg font-semibold shadow-lg"
              onClick={() => navigate('/auth')}
            >
              Start Tracking Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-8 py-4 text-lg font-semibold"
              onClick={() => navigate('/guide')}
            >
              Learn More
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-white text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            Everything you need to track your poker success
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    {feature.icon}
                    <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-100">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Beta Feedback Section */}
        <div className="bg-orange-500/10 backdrop-blur-sm rounded-2xl p-8 mb-16 border border-orange-400/30">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Bug className="h-8 w-8 text-orange-400" />
              Help Shape Felt Focus
            </h3>
            <p className="text-orange-100 text-lg mb-6 max-w-3xl mx-auto">
              We're in beta and actively improving the app based on user feedback. Found a bug? Have a feature request? 
              Your input helps us build the best poker tracking experience possible.
            </p>
            <div className="bg-white/5 rounded-lg p-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <Bug className="h-6 w-6 text-orange-400" />
                </div>
                <div className="text-left">
                  <h4 className="text-white font-semibold">Send Feedback</h4>
                  <p className="text-orange-200 text-sm">Look for the bug icon in the app header</p>
                </div>
              </div>
              <p className="text-orange-100 text-sm">
                Click the <Bug className="inline h-4 w-4 mx-1 text-orange-400" /> icon after logging in to report bugs or request features. 
                We read every submission and often implement suggestions within days!
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-16 border border-white/20">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Mail className="h-8 w-8 text-green-400" />
              Your Privacy Matters
            </h3>
            <p className="text-blue-100 text-lg mb-6 max-w-3xl mx-auto">
              We believe in keeping things simple and private. Create your account with just an email address - 
              no personal names, phone numbers, or sensitive information required. Your poker data stays secure and anonymous.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="h-8 w-8 text-green-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">Email Only</h4>
                <p className="text-blue-200 text-sm">Just your email address to get started</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-8 w-8 text-blue-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">Secure Data</h4>
                <p className="text-blue-200 text-sm">Your sessions are encrypted and private</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-8 w-8 text-green-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">Focus on Results</h4>
                <p className="text-blue-200 text-sm">Track what matters - your poker performance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-white mb-6">
            Ready to improve your poker game?
          </h3>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-12 py-4 text-xl font-semibold shadow-xl"
            onClick={() => navigate('/auth')}
          >
            Get Started - It's Free
          </Button>
          
          {/* Social Links */}
          <div className="mt-8 pt-8 border-t border-white/20">
            <p className="text-blue-200 mb-4">Follow for updates</p>
            <a 
              href="https://twitter.com/feltfocus" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Twitter className="h-5 w-5" />
              @feltfocus
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;