import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const EmailPreview = () => {
  const mockToken = "ABC123DEF456";
  const mockVerificationUrl = "https://your-app.com/verify?token=abc123";

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Email Preview</h1>
          <p className="text-muted-foreground">
            This is how your custom welcome email will look to new users
          </p>
        </div>

        {/* Email Container */}
        <Card className="mx-auto shadow-lg">
          <CardContent className="p-0">
            {/* Email Content */}
            <div style={{
              backgroundColor: '#f8fafc',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              padding: '0',
              margin: '0'
            }}>
              <div style={{
                backgroundColor: '#ffffff',
                margin: '0 auto',
                padding: '20px 0 48px',
                marginBottom: '64px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                maxWidth: '600px'
              }}>
                
                {/* Logo Section */}
                <div style={{
                  padding: '32px 24px 0',
                  textAlign: 'center'
                }}>
                  <h1 style={{
                    color: '#1e293b',
                    fontSize: '32px',
                    fontWeight: 'bold',
                    margin: '0',
                    letterSpacing: '-0.025em'
                  }}>
                    🎯 Poker Bankroll Tracker
                  </h1>
                </div>

                {/* Hero Section */}
                <div style={{
                  padding: '24px 32px',
                  textAlign: 'center'
                }}>
                  <h2 style={{
                    color: '#1e293b',
                    fontSize: '24px',
                    fontWeight: '600',
                    margin: '0 0 16px'
                  }}>
                    Welcome to Your Poker Journey!
                  </h2>
                  <p style={{
                    color: '#64748b',
                    fontSize: '16px',
                    lineHeight: '1.6',
                    margin: '0'
                  }}>
                    You're just one click away from taking control of your poker bankroll. 
                    We're excited to help you track your sessions, analyze your performance, 
                    and grow your winnings strategically.
                  </p>
                </div>

                {/* Button Section */}
                <div style={{
                  textAlign: 'center',
                  padding: '32px 24px'
                }}>
                  <a
                    href={mockVerificationUrl}
                    style={{
                      backgroundColor: '#3b82f6',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '16px',
                      fontWeight: '600',
                      textDecoration: 'none',
                      textAlign: 'center',
                      display: 'inline-block',
                      padding: '16px 32px',
                      margin: '0'
                    }}
                  >
                    Verify Email & Start Tracking
                  </a>
                </div>

                {/* Code Section */}
                <div style={{
                  padding: '0 32px 32px',
                  textAlign: 'center'
                }}>
                  <p style={{
                    color: '#64748b',
                    fontSize: '14px',
                    margin: '0 0 16px'
                  }}>
                    Or copy and paste this verification code:
                  </p>
                  <code style={{
                    display: 'inline-block',
                    padding: '16px 24px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    color: '#1e293b',
                    fontSize: '16px',
                    fontWeight: '600',
                    letterSpacing: '0.1em'
                  }}>
                    {mockToken}
                  </code>
                </div>

                {/* Features Section */}
                <div style={{
                  padding: '0 32px 32px',
                  backgroundColor: '#f8fafc',
                  margin: '0 24px',
                  borderRadius: '8px'
                }}>
                  <h3 style={{
                    color: '#334155',
                    fontSize: '18px',
                    fontWeight: '600',
                    margin: '24px 0 16px'
                  }}>
                    What you'll get access to:
                  </h3>
                  <p style={{
                    color: '#475569',
                    fontSize: '14px',
                    margin: '8px 0',
                    paddingLeft: '4px'
                  }}>
                    📊 Detailed session tracking
                  </p>
                  <p style={{
                    color: '#475569',
                    fontSize: '14px',
                    margin: '8px 0',
                    paddingLeft: '4px'
                  }}>
                    📈 Performance analytics
                  </p>
                  <p style={{
                    color: '#475569',
                    fontSize: '14px',
                    margin: '8px 0',
                    paddingLeft: '4px'
                  }}>
                    🏆 Tournament management
                  </p>
                  <p style={{
                    color: '#475569',
                    fontSize: '14px',
                    margin: '8px 0',
                    paddingLeft: '4px'
                  }}>
                    💰 Bankroll growth insights
                  </p>
                </div>

                {/* Footer Section */}
                <div style={{
                  padding: '32px 32px 0',
                  textAlign: 'center'
                }}>
                  <p style={{
                    color: '#1e293b',
                    fontSize: '16px',
                    fontWeight: '500',
                    margin: '0 0 24px'
                  }}>
                    Ready to elevate your poker game? Let's get started!
                  </p>
                  <p style={{
                    color: '#94a3b8',
                    fontSize: '12px',
                    margin: '0'
                  }}>
                    If you didn't create an account with us, you can safely ignore this email.
                  </p>
                </div>

              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">🎨 Design Features</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Branded poker theme with emoji</li>
                <li>• Professional color scheme</li>
                <li>• Clear call-to-action button</li>
                <li>• Mobile-responsive design</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">✨ Email Features</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Custom React Email template</li>
                <li>• Sent via Resend for reliability</li>
                <li>• Verification code backup</li>
                <li>• Feature highlights included</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Badge variant="secondary" className="mb-4">
            This replaces the plain Supabase default email
          </Badge>
          <p className="text-sm text-muted-foreground">
            Test it by signing up with a new email address at <strong>/auth</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailPreview;