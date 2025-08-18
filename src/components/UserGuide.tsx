import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertCircle, DollarSign, BarChart3, Trophy, Camera, FileSpreadsheet, TrendingUp, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
const UserGuide = () => {
  return <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => window.location.href = '/'} className="mb-4 p-2 h-auto">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Poker Bankroll Tracker - User Guide</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Learn how to effectively track your poker sessions and manage your bankroll
        </p>
      </div>

      <Tabs defaultValue="getting-started" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger value="getting-started" className="text-xs md:text-sm px-2 py-2">Getting Started</TabsTrigger>
          <TabsTrigger value="features" className="text-xs md:text-sm px-2 py-2">Features</TabsTrigger>
          <TabsTrigger value="tips" className="text-xs md:text-sm px-2 py-2">Best Practices</TabsTrigger>
          <TabsTrigger value="faq" className="text-xs md:text-sm px-2 py-2">FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="getting-started" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Quick Start Guide
              </CardTitle>
              <CardDescription>
                Get up and running in 3 simple steps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3">
                <div className="flex gap-3">
                  <Badge variant="secondary" className="rounded-full w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-xs flex-shrink-0">1</Badge>
                  <div>
                    <h3 className="font-semibold text-sm md:text-base">Set Your Starting Bankroll</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Enter your current bankroll amount in the settings. This helps track your overall progress.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Badge variant="secondary" className="rounded-full w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-xs flex-shrink-0">2</Badge>
                  <div>
                    <h3 className="font-semibold text-sm md:text-base">Record Your First Session</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Click "Add Session" and enter details: game type, stakes, buy-in, cash-out, and duration.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Badge variant="secondary" className="rounded-full w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-xs flex-shrink-0">3</Badge>
                  <div>
                    <h3 className="font-semibold text-sm md:text-base">Review Your Analytics</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Check your profit/loss trends, win rate, and hourly rate in the analytics section.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs md:text-sm">
              <strong>Pro Tip:</strong> Be consistent with recording sessions immediately after playing. 
              This ensures accurate tracking and helps identify patterns in your play.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Session Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="space-y-1 text-xs md:text-sm">
                  <li>• Add, edit, and delete poker sessions</li>
                  <li>• Track multiple game types (Cash, Tournament, etc.)</li>
                  <li>• Record stakes, buy-ins, and results</li>
                  <li>• Add notes and session details</li>
                  <li>• Import sessions from CSV files</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Live Tournament Mode
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="space-y-1 text-xs md:text-sm">
                  <li>• Real-time tournament tracking</li>
                  <li>• Chip stack management</li>
                  <li>• Blind level tracking</li>
                  
                  
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Analytics & Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="space-y-1 text-xs md:text-sm">
                  <li>• Profit/loss charts over time</li>
                  <li>• Win rate and ROI calculations</li>
                  <li>• Hourly rate analysis</li>
                  <li>• Performance by game type</li>
                  <li>• Bankroll growth tracking</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Additional Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="space-y-1 text-xs md:text-sm">
                  <li>• Photo capture for receipts/results</li>
                  <li>• Data export capabilities</li>
                  <li>• Dark/light theme toggle</li>
                  <li>• Secure cloud backup</li>
                  <li>• Mobile-responsive design</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tips" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Best Practices for Accurate Tracking</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Follow these tips to get the most out of your bankroll tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="consistency">
                  <AccordionTrigger>Be Consistent with Data Entry</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1 text-xs md:text-sm">
                      <li>• Record sessions immediately after playing</li>
                      <li>• Use consistent game type naming (e.g., always "NL Hold'em" not "NLHE")</li>
                      <li>• Include all costs (rake, tips, travel) in your calculations</li>
                      <li>• Don't forget to log losing sessions - they're just as important</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="details">
                  <AccordionTrigger>Track Important Details</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1 text-xs md:text-sm">
                      <li>• Note the venue/casino for location-based analysis</li>
                      <li>• Record time of day to identify your peak performance hours</li>
                      <li>• Add notes about table conditions, opponents, or key hands</li>
                      <li>• Track your emotional state or tilt level</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="analysis">
                  <AccordionTrigger>Regular Analysis</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1 text-xs md:text-sm">
                      <li>• Review your stats weekly to identify trends</li>
                      <li>• Look for patterns in winning vs losing sessions</li>
                      <li>• Adjust your game selection based on performance data</li>
                      <li>• Set realistic goals based on your historical performance</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                
                <AccordionItem value="bankroll-management">
                  <AccordionTrigger>Bankroll Management Rules</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1 text-xs md:text-sm">
                      <li>• Never play above your bankroll limits (20-40 buy-ins for cash games)</li>
                      <li>• Set stop-loss limits before each session</li>
                      <li>• Don't chase losses by moving up in stakes</li>
                      <li>• Regularly withdraw profits to avoid lifestyle inflation</li>
                      <li>• Keep separate bankrolls for different game types</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="accuracy">
                  <AccordionTrigger>Maintain Data Accuracy</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1 text-xs md:text-sm">
                      <li>• Double-check buy-in and cash-out amounts</li>
                      <li>• Include all session costs (gas, food, parking)</li>
                      <li>• Record exact session start and end times</li>
                      <li>• Use receipt photos for verification when possible</li>
                      <li>• Reconcile your tracking with bank statements monthly</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="mental-game">
                  <AccordionTrigger>Mental Game & Discipline</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1 text-xs md:text-sm">
                      <li>• Track your mental state before and after sessions</li>
                      <li>• Note factors that affect your play (sleep, stress, mood)</li>
                      <li>• Set session time limits and stick to them</li>
                      <li>• Review losing sessions objectively, not emotionally</li>
                      <li>• Celebrate small wins and learn from all outcomes</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="long-term">
                  <AccordionTrigger>Long-term Success Strategies</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1 text-xs md:text-sm">
                      <li>• Focus on hourly rate over session results</li>
                      <li>• Set monthly and yearly profit/improvement goals</li>
                      <li>• Invest in poker education and skill development</li>
                      <li>• Network with other serious players</li>
                      <li>• Consider game selection as your most profitable skill</li>
                      <li>• Regular backup of your session data</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="data-security">
                  <AccordionTrigger>Is my data secure?</AccordionTrigger>
                  <AccordionContent className="text-xs md:text-sm">
                    Yes, all data is securely stored with Supabase using Row Level Security (RLS). 
                    Only you can access your poker session data. We use industry-standard encryption 
                    and authentication practices.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="csv-import">
                  <AccordionTrigger>How do I import my existing data?</AccordionTrigger>
                  <AccordionContent className="text-xs md:text-sm">
                    You can import existing poker session data using CSV files. Click the "Import CSV" 
                    button on the main dashboard. Your CSV should include columns for date, buy-in, 
                    cash-out, duration, location, stakes, and game type. Download our template for 
                    the correct format.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="hourly-rate">
                  <AccordionTrigger>How is hourly rate calculated?</AccordionTrigger>
                  <AccordionContent className="text-xs md:text-sm">
                    Hourly rate is calculated by dividing your total profit/loss by total hours played. 
                    The calculation includes all sessions within your selected date range. Negative 
                    hourly rates indicate overall losses during that period.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="tournament-vs-cash">
                  <AccordionTrigger>What's the difference between cash games and tournaments?</AccordionTrigger>
                  <AccordionContent className="text-xs md:text-sm">
                    Cash games have fixed buy-ins and cash-outs, while tournaments have entry fees 
                    and prize winnings. The app tracks them separately to provide accurate statistics 
                    for each format. Use the live tournament mode for real-time tournament tracking.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="mobile-app">
                  <AccordionTrigger>Is there a mobile app?</AccordionTrigger>
                  <AccordionContent className="text-xs md:text-sm">
                    Felt Focus is a progressive web app (PWA) that works great on mobile browsers. 
                    You can add it to your phone's home screen for a native app experience. 
                    All features work seamlessly on mobile devices.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="timezone">
                  <AccordionTrigger>How are timezones handled?</AccordionTrigger>
                  <AccordionContent className="text-xs md:text-sm">
                    All times are stored and displayed in your local timezone. When traveling, 
                    sessions will be recorded in the timezone where you're currently playing.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="delete-account">
                  <AccordionTrigger>Can I delete my account and data?</AccordionTrigger>
                  <AccordionContent className="text-xs md:text-sm">
                    Yes, you can delete your account and all associated data. Go to Settings and 
                    scroll down to the "Danger Zone" section where you'll find the account deletion 
                    option. This action is permanent and cannot be undone.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="multiple-devices">
                  <AccordionTrigger>Can I access my data from multiple devices?</AccordionTrigger>
                  <AccordionContent className="text-xs md:text-sm">
                    Yes, your data is stored in the cloud and accessible from any device where 
                    you log in with your account. Changes sync automatically across all devices.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="backup">
                  <AccordionTrigger>How do I backup my data?</AccordionTrigger>
                  <AccordionContent className="text-xs md:text-sm">
                    Your data is automatically backed up in the cloud. For additional security, 
                    you can export your data as CSV files regularly. Use the export feature 
                    in the settings menu.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
};
export default UserGuide;