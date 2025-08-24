import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Share, Copy, Mail, MessageSquare, QrCode } from 'lucide-react';
import QRCode from 'qrcode';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({ open, onOpenChange }: ShareDialogProps) {
  const [email, setEmail] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const { toast } = useToast();
  
  const appUrl = window.location.origin;
  const shareText = "Check out Felt Focus - an awesome poker bankroll tracking app!";

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const qrDataUrl = await QRCode.toDataURL(appUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(qrDataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    if (open) {
      generateQRCode();
    }
  }, [appUrl, open]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const shareViaEmail = () => {
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    const subject = encodeURIComponent("Check out Felt Focus!");
    const body = encodeURIComponent(`${shareText}\n\n${appUrl}`);
    
    try {
      window.open(`mailto:${email.trim()}?subject=${subject}&body=${body}`);
      toast({
        title: "Email Client Opened",
        description: "Your email client should open with the message ready to send.",
      });
      setEmail('');
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Email Failed",
        description: "Could not open email client. Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const shareViaSMS = () => {
    const message = encodeURIComponent(`${shareText} ${appUrl}`);
    window.open(`sms:?body=${message}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            Share Felt Focus
          </DialogTitle>
          <DialogDescription>
            Share this poker bankroll tracker with your friends!
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>App Link</Label>
            <div className="flex gap-2">
              <Input value={appUrl} readOnly className="flex-1" />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => copyToClipboard(appUrl)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {qrCodeUrl && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                QR Code
              </Label>
              <div className="flex justify-center p-4 bg-white rounded-lg border">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code for app URL" 
                  className="w-32 h-32"
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Scan to share the app instantly
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            <Label>Quick Share</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                onClick={shareViaSMS}
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Text Message
              </Button>
              <Button 
                variant="outline" 
                onClick={() => copyToClipboard(`${shareText} ${appUrl}`)}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy Message
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Send via Email</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline"
                onClick={shareViaEmail}
                disabled={!email.trim()}
              >
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}