import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, FileText, Shield, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TermsOfServiceProps {
  onAccept: () => void;
  userEmail?: string;
}

const TermsOfService = ({ onAccept, userEmail }: TermsOfServiceProps) => {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAccept = async () => {
    if (!accepted) {
      setError('Please read and accept the Terms of Service to continue.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');

      // First, try to update existing record
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let profileError;
      
      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('user_profiles')
          .update({
            tos_accepted_at: new Date().toISOString(),
            tos_version: '1.0'
          })
          .eq('user_id', user.id);
        profileError = error;
      } else {
        // Insert new profile
        const { error } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            tos_accepted_at: new Date().toISOString(),
            tos_version: '1.0'
          });
        profileError = error;
      }

      if (profileError) throw profileError;

      toast({
        title: "Terms Accepted",
        description: "Welcome to Felt Focus! You can now access your dashboard.",
      });

      onAccept();
    } catch (err: any) {
      console.error('Error accepting ToS:', err);
      setError(err.message || 'Failed to accept terms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-green-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-xl">
                <FileText className="text-white text-2xl" />
              </div>
            </div>
            <CardTitle className="text-white text-2xl mb-2">Terms of Service</CardTitle>
            <p className="text-blue-200">Please read and accept our terms to continue</p>
            {userEmail && (
              <p className="text-green-400 text-sm mt-2">Account: {userEmail}</p>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="bg-red-500/20 border-red-400 text-red-200">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <ScrollArea className="h-96 w-full rounded-lg border border-white/20 bg-white/5 p-6">
              <div className="prose prose-invert prose-sm space-y-4 text-blue-100">
                <h3 className="text-white text-lg font-semibold">Felt Focus - Terms of Service</h3>
                <p className="text-sm text-blue-300"><strong>Effective Date:</strong> {new Date().toLocaleDateString()}</p>
                
                <h4 className="text-white font-semibold">1. Acceptance of Terms</h4>
                <p>By using Felt Focus ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>

                <h4 className="text-white font-semibold">2. Description of Service</h4>
                <p>Felt Focus is a free poker session tracking application that allows users to record, analyze, and manage their poker game statistics and bankroll information.</p>

                <h4 className="text-white font-semibold">3. User Responsibilities</h4>
                <p>You are responsible for:</p>
                <ul className="list-disc pl-6">
                  <li>Maintaining the accuracy of your session data</li>
                  <li>Keeping your login credentials secure</li>
                  <li>Using the Service in compliance with applicable laws</li>
                  <li>Verifying all calculations and statistics independently</li>
                </ul>

                <h4 className="text-white font-semibold">4. Data Privacy and Protection</h4>
                <p><strong>Our Privacy Commitment:</strong></p>
                <ul className="list-disc pl-6">
                  <li><strong>We cannot and will not share your data</strong> with any third parties for any purpose</li>
                  <li>No data selling, renting, or marketing use - ever</li>
                  <li>Poker session tracking is legal personal finance management</li>
                  <li>Your data is treated as private financial records</li>
                </ul>
                
                <p><strong>Data We Collect (Minimal):</strong></p>
                <ul className="list-disc pl-6">
                  <li>Your email address for authentication only</li>
                  <li>Poker session data you voluntarily input</li>
                  <li>No IP logging, session tracking, or behavioral analytics</li>
                  <li>No third-party integrations that could access your data</li>
                </ul>

                <h4 className="text-white font-semibold">5. Your Data Control Rights</h4>
                <p>You maintain complete control over your data:</p>
                <ul className="list-disc pl-6">
                  <li><strong>Full Data Export:</strong> Download all your data in CSV format anytime</li>
                  <li><strong>Complete Account Deletion:</strong> Permanently delete your account and all data with one click</li>
                  <li><strong>No Data Lock-in:</strong> Your data remains yours and portable</li>
                  <li><strong>Regular Backups Recommended:</strong> We encourage you to export your data regularly</li>
                </ul>

                <h4 className="text-white font-semibold">6. Technical Transparency</h4>
                <p>We believe in transparency about how your data is handled:</p>
                <ul className="list-disc pl-6">
                  <li><strong>Hosting:</strong> Data is hosted securely using Supabase cloud infrastructure</li>
                  <li><strong>Data Retention:</strong> Data is kept only as long as your account is active</li>
                  <li><strong>Government Requests:</strong> We will not cooperate with data requests unless legally required by valid court order</li>
                  <li><strong>Security:</strong> Industry-standard encryption and access controls</li>
                  <li><strong>No Analytics:</strong> We do not track user behavior or usage patterns</li>
                </ul>

                <h4 className="text-white font-semibold">7. Disclaimers</h4>
                <p><strong>Important Disclaimers:</strong></p>
                <ul className="list-disc pl-6">
                  <li><strong>Tracking Tool Only:</strong> This Service is solely for tracking poker sessions. It does not facilitate gambling or gaming.</li>
                  <li><strong>No Financial Advice:</strong> We provide no financial, investment, or gambling advice. All decisions are your own.</li>
                  <li><strong>Data Accuracy:</strong> While we strive for accuracy, you are responsible for verifying all calculations and data.</li>
                  <li><strong>Use At Your Own Risk:</strong> The Service is provided "as is" without warranties of any kind.</li>
                </ul>

                <h4 className="text-white font-semibold">8. Limitation of Liability</h4>
                <p>To the maximum extent permitted by law, Felt Focus and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or other intangible losses resulting from your use of the Service.</p>

                <h4 className="text-white font-semibold">9. Service Availability</h4>
                <p>We provide this Service on a best-effort basis. We do not guarantee uninterrupted access and may modify or discontinue the Service at any time.</p>

                <h4 className="text-white font-semibold">10. Prohibited Uses</h4>
                <p>You may not use the Service to:</p>
                <ul className="list-disc pl-6">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Interfere with or disrupt the Service</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Use automated tools to access the Service</li>
                </ul>

                <h4 className="text-white font-semibold">11. Account Termination</h4>
                <p>We reserve the right to terminate accounts that violate these terms. You may delete your account at any time through the application settings.</p>

                <h4 className="text-white font-semibold">12. Changes to Terms</h4>
                <p>We may update these terms from time to time. Continued use of the Service after changes constitutes acceptance of the new terms.</p>

                <h4 className="text-white font-semibold">13. Legal Compliance</h4>
                <p>Users are responsible for ensuring their use of poker tracking complies with local gambling and taxation laws in their jurisdiction.</p>

                <h4 className="text-white font-semibold">14. Contact Information</h4>
                <p>For questions about these terms, please contact us through the application's feedback system.</p>

                <h4 className="text-white font-semibold">15. Governing Law</h4>
                <p>These terms are governed by applicable laws without regard to conflict of law principles.</p>
              </div>
            </ScrollArea>

            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-white/5 rounded-lg border border-white/10">
                <Checkbox
                  id="accept-terms"
                  checked={accepted}
                  onCheckedChange={(checked) => {
                    setAccepted(checked as boolean);
                    if (error) setError(null);
                  }}
                  className="mt-0.5"
                />
                <div className="space-y-1">
                  <label 
                    htmlFor="accept-terms" 
                    className="text-white text-sm font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I have read, understood, and agree to the Terms of Service
                  </label>
                  <p className="text-blue-300 text-xs">
                    By checking this box, you acknowledge that you understand this is a tracking tool only and that you are responsible for verifying all data.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <Button
                  onClick={handleAccept}
                  disabled={!accepted || loading}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-8 py-3"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Accept Terms & Continue
                </Button>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-blue-300 text-xs">
                  <Shield className="h-4 w-4" />
                  <span>Your privacy and data security are our priority</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;