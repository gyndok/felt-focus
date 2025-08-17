import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Bug, Lightbulb, Send } from 'lucide-react';

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const [type, setType] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!type || !message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a type and enter your feedback.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate sending feedback (in a real app, this would call an API)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Feedback Sent!",
      description: "Thank you for your feedback. We'll review it soon.",
    });
    
    setType('');
    setMessage('');
    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Send Feedback
          </DialogTitle>
          <DialogDescription>
            Help us improve Felt Focus by reporting bugs or suggesting features.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="type">Feedback Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select feedback type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">
                  <div className="flex items-center gap-2">
                    <Bug className="h-4 w-4" />
                    Bug Report
                  </div>
                </SelectItem>
                <SelectItem value="feature">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Feature Request
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder={type === 'bug' ? "Describe the bug you encountered..." : "Describe the feature you'd like to see..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Sending...' : 'Send Feedback'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}