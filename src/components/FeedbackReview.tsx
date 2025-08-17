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
                <Card key={feedback.id} className={`${!feedback.reviewed_at ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-700' : 'bg-card border-border'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {feedback.type === 'bug' ? (
                          <Bug className="h-4 w-4 text-destructive" />
                        ) : (
                          <Lightbulb className="h-4 w-4 text-yellow-500" />
                        )}
                        <Badge variant={feedback.type === 'bug' ? 'destructive' : 'secondary'} className="text-xs">
                          {feedback.type === 'bug' ? 'Bug Report' : 'Feature Request'}
                        </Badge>
                        {!feedback.reviewed_at && (
                          <Badge variant="outline" className="bg-orange-500 text-white border-orange-500 text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span className="text-foreground">
                          {format(new Date(feedback.created_at), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="text-sm leading-relaxed text-foreground bg-background/50 p-3 rounded-md border">
                      {feedback.message}
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span className="text-foreground font-medium">{feedback.user_display_name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="text-foreground">{feedback.user_email}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {feedback.reviewed_at ? (
                          <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Reviewed {format(new Date(feedback.reviewed_at), 'MMM d')}</span>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleMarkAsReviewed(feedback.id)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
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