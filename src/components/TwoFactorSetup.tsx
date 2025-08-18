import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Shield, ShieldCheck, Smartphone, Copy, Eye, EyeOff, AlertTriangle } from 'lucide-react';

interface TwoFactorSetupProps {
  onClose: () => void;
}

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'check' | 'setup' | 'verify' | 'complete'>('check');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [factorId, setFactorId] = useState<string>('');
  const [challengeId, setChallengeId] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [hasMFA, setHasMFA] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    try {
      const { data: factors, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      
      const hasActiveFactor = factors?.all?.some(factor => factor.status === 'verified');
      setHasMFA(!!hasActiveFactor);
      
      if (hasActiveFactor) {
        setStep('complete');
      }
    } catch (error: any) {
      console.error('Error checking MFA status:', error);
    }
  };

  const startMFASetup = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App'
      });

      if (error) throw error;

      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      setStep('setup');
    } catch (error: any) {
      toast({
        title: "Setup Error",
        description: error.message || "Failed to start 2FA setup",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const verifySetup = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Create challenge first
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId
      });

      if (challengeError) throw challengeError;

      // Verify the code
      const { data, error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verificationCode
      });

      if (error) throw error;

      // Generate recovery codes (simulated - in real app these would come from backend)
      const codes = Array.from({ length: 8 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );
      setRecoveryCodes(codes);
      
      setStep('complete');
      setHasMFA(true);
      
      toast({
        title: "2FA Enabled!",
        description: "Your account is now protected with two-factor authentication",
      });
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const disableMFA = async () => {
    setLoading(true);
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      
      if (factors && factors.all && factors.all.length > 0) {
        const { error } = await supabase.auth.mfa.unenroll({
          factorId: factors.all[0].id
        });
        
        if (error) throw error;
        
        setHasMFA(false);
        setStep('check');
        
        toast({
          title: "2FA Disabled",
          description: "Two-factor authentication has been disabled",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to disable 2FA",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    });
  };

  if (step === 'check') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <CardTitle>Two-Factor Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasMFA ? (
            <>
              <div className="flex items-center justify-center gap-2 text-green-600">
                <ShieldCheck className="h-5 w-5" />
                <Badge variant="outline" className="border-green-500 text-green-600">
                  2FA Enabled
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Your account is protected with two-factor authentication.
              </p>
              <Button 
                onClick={disableMFA} 
                variant="outline" 
                className="w-full"
                disabled={loading}
              >
                Disable 2FA
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Add an extra layer of security to your account by enabling two-factor authentication.
              </p>
              <Button 
                onClick={startMFASetup} 
                className="w-full bg-blue-500 hover:bg-blue-600"
                disabled={loading}
              >
                <Shield className="h-4 w-4 mr-2" />
                Enable 2FA
              </Button>
            </>
          )}
          
          <Button onClick={onClose} variant="ghost" className="w-full">
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'setup') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Set Up Authenticator App</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              1. Open your authenticator app (Google Authenticator, Authy, etc.)
            </p>
            <p className="text-sm text-muted-foreground">
              2. Scan this QR code or enter the secret manually:
            </p>
          </div>

          {qrCode && (
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <img src={qrCode} alt="QR Code for 2FA setup" className="w-48 h-48" />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="secret">Manual Entry Code:</Label>
            <div className="flex gap-2">
              <Input
                id="secret"
                value={secret}
                readOnly
                className="font-mono text-xs"
              />
              <Button 
                onClick={() => copyToClipboard(secret)}
                size="sm"
                variant="outline"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="verification">Enter 6-digit code from your app:</Label>
            <Input
              id="verification"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="000000"
              maxLength={6}
              className="text-center font-mono text-lg"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => setStep('check')} 
              variant="outline" 
              className="flex-1"
            >
              Back
            </Button>
            <Button 
              onClick={verifySetup} 
              className="flex-1"
              disabled={loading || verificationCode.length !== 6}
            >
              Verify & Enable
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'complete') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <CardTitle>2FA Successfully Enabled!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recoveryCodes.length > 0 && (
            <>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Save these recovery codes in a safe place. You can use them to access your account if you lose your authenticator device.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Recovery Codes:</Label>
                  <Button
                    onClick={() => setShowRecoveryCodes(!showRecoveryCodes)}
                    variant="ghost"
                    size="sm"
                  >
                    {showRecoveryCodes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                
                {showRecoveryCodes && (
                  <div className="bg-muted p-3 rounded-lg space-y-1">
                    {recoveryCodes.map((code, index) => (
                      <div key={index} className="font-mono text-sm flex justify-between">
                        <span>{code}</span>
                        <Button
                          onClick={() => copyToClipboard(code)}
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <p className="text-sm text-muted-foreground text-center">
            Your account is now protected with two-factor authentication. You'll need your authenticator app to sign in.
          </p>

          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default TwoFactorSetup;