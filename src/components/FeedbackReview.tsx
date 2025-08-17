import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Bug, Lightbulb, Clock, CheckCircle2, User, Mail } from 'lucide-react';
import { useFeedbackNotifications } from '@/hooks/useFeedbackNotifications';
import { format } from 'date-fns';

interface FeedbackReviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackReview({ open, onOpenChange }: FeedbackReviewProps) {
  const { allFeedback, loading, markAsReviewed } = useFeedbackNotifications();

  const handleMarkAsReviewed = (feedbackId: string) => {
    markAsReviewed(feedbackId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Feedback Review
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading feedback...</div>
            </div>
          ) : allFeedback.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">No feedback submitted yet.</div>
            </div>
          ) : (
            <div className="space-y-4">
              {allFeedback.map((feedback) => (
                <Card key={feedback.id} className={`${!feedback.reviewed_at ? 'border-orange-200 bg-orange-50/50' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {feedback.type === 'bug' ? (
                          <Bug className="h-4 w-4 text-destructive" />
                        ) : (
                          <Lightbulb className="h-4 w-4 text-yellow-500" />
                        )}
                        <Badge variant={feedback.type === 'bug' ? 'destructive' : 'secondary'}>
                          {feedback.type === 'bug' ? 'Bug Report' : 'Feature Request'}
                        </Badge>
                        {!feedback.reviewed_at && (
                          <Badge variant="outline" className="bg-orange-100 text-orange-700">
                            New
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(feedback.created_at), 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="text-sm leading-relaxed">
                      {feedback.message}
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {feedback.user_display_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {feedback.user_email}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {feedback.reviewed_at ? (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle2 className="h-3 w-3" />
                            Reviewed {format(new Date(feedback.reviewed_at), 'MMM d')}
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAsReviewed(feedback.id)}
                          >
                            Mark as Reviewed
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}