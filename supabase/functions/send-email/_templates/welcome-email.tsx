import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Img,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface WelcomeEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
}

export const WelcomeEmail = ({
  token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to Poker Bankroll Tracker - Verify your email to get started</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Heading style={h1}>🎯 Poker Bankroll Tracker</Heading>
        </Section>
        
        <Section style={heroSection}>
          <Heading style={h2}>Welcome to Your Poker Journey!</Heading>
          <Text style={text}>
            You're just one click away from taking control of your poker bankroll. 
            We're excited to help you track your sessions, analyze your performance, 
            and grow your winnings strategically.
          </Text>
        </Section>

        <Section style={buttonSection}>
          <Link
            href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
            target="_blank"
            style={button}
          >
            Verify Email & Start Tracking
          </Link>
        </Section>

        <Section style={codeSection}>
          <Text style={codeText}>
            Or copy and paste this verification code:
          </Text>
          <code style={code}>{token}</code>
        </Section>

        <Section style={featuresSection}>
          <Heading style={h3}>What you'll get access to:</Heading>
          <Text style={featureText}>📊 Detailed session tracking</Text>
          <Text style={featureText}>📈 Performance analytics</Text>
          <Text style={featureText}>🏆 Tournament management</Text>
          <Text style={featureText}>💰 Bankroll growth insights</Text>
        </Section>

        <Section style={footerSection}>
          <Text style={footerText}>
            Ready to elevate your poker game? Let's get started!
          </Text>
          <Text style={disclaimerText}>
            If you didn't create an account with us, you can safely ignore this email.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default WelcomeEmail

const main = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
}

const logoSection = {
  padding: '32px 24px 0',
  textAlign: 'center' as const,
}

const heroSection = {
  padding: '24px 32px',
  textAlign: 'center' as const,
}

const buttonSection = {
  textAlign: 'center' as const,
  padding: '32px 24px',
}

const codeSection = {
  padding: '0 32px 32px',
  textAlign: 'center' as const,
}

const featuresSection = {
  padding: '0 32px 32px',
  backgroundColor: '#f8fafc',
  margin: '0 24px',
  borderRadius: '8px',
}

const footerSection = {
  padding: '32px 32px 0',
  textAlign: 'center' as const,
}

const h1 = {
  color: '#1e293b',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  letterSpacing: '-0.025em',
}

const h2 = {
  color: '#1e293b',
  fontSize: '24px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const h3 = {
  color: '#334155',
  fontSize: '18px',
  fontWeight: '600',
  margin: '24px 0 16px',
}

const text = {
  color: '#64748b',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0',
}

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  margin: '0',
}

const codeText = {
  color: '#64748b',
  fontSize: '14px',
  margin: '0 0 16px',
}

const code = {
  display: 'inline-block',
  padding: '16px 24px',
  backgroundColor: '#f1f5f9',
  borderRadius: '6px',
  border: '1px solid #e2e8f0',
  color: '#1e293b',
  fontSize: '16px',
  fontWeight: '600',
  letterSpacing: '0.1em',
}

const featureText = {
  color: '#475569',
  fontSize: '14px',
  margin: '8px 0',
  paddingLeft: '4px',
}

const footerText = {
  color: '#1e293b',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0 0 24px',
}

const disclaimerText = {
  color: '#94a3b8',
  fontSize: '12px',
  margin: '0',
}