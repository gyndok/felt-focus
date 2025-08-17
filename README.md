# Poker Bankroll Tracker

A comprehensive web application for tracking poker sessions, managing bankroll, and analyzing performance. Built with React, TypeScript, and Supabase for a complete poker tracking experience.

## 🎯 Features

### 📊 Session Management
- **Add Sessions**: Record cash games and tournament sessions with detailed information
- **Edit & Delete**: Modify or remove sessions with full data integrity
- **Session Details**: Track buy-ins, cash-outs, duration, location, game type, and notes
- **CSV Import**: Bulk import sessions from external tracking tools

### 💰 Bankroll Tracking
- **Customizable Starting Bankroll**: Set your initial bankroll amount
- **Real-time Calculations**: Automatic profit/loss tracking and bankroll progression
- **Privacy Controls**: Hide/show bankroll with eye toggle for security
- **Visual Charts**: Interactive line chart showing bankroll evolution over time

### 📈 Analytics & Statistics
- **Performance Metrics**: Total profit, hourly rate, win rate, and session count
- **Advanced Filtering**: Filter by date range, game type, location, and session type
- **Time-based Analysis**: Track performance trends across different time periods

### 🎮 Live Tournament Mode
- **Real-time Tracking**: Monitor current tournament progress
- **Chip Stack Visualization**: Interactive area chart showing stack progression
- **Blind Level Tracking**: Current blinds and ante information
- **Timer Integration**: Built-in session timer for live play

### 🔐 User Management
- **Secure Authentication**: Email/password login with Supabase Auth
- **User Settings**: Password management and account preferences
- **Data Privacy**: Row Level Security ensures users only see their own data

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (Database + Authentication)
- **Charts**: Recharts for data visualization
- **Routing**: React Router DOM
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form + Zod validation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account (for backend services)

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example file and configure your Supabase credentials
   cp .env.example .env.local
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5173
   ```

## 📱 Usage Guide

### Getting Started
1. **Create Account**: Sign up with email and password
2. **Set Starting Bankroll**: Configure your initial bankroll in Settings
3. **Add First Session**: Record your first poker session

### Recording Sessions
- Click "Add Session" to record a new poker session
- Fill in required details: date, buy-in, cash-out, duration
- Optional: Add location, game type, and session notes
- Sessions automatically calculate profit/loss and update your bankroll

### Analyzing Performance
- Use the dashboard to view key statistics
- Apply filters to analyze specific time periods or game types
- Check the bankroll chart to visualize your progression
- Monitor hourly rate and win rate trends

### Live Tournament Play
- Switch to "Live Tournament" mode during active play
- Track your chip stack in real-time
- Monitor blind levels and tournament progress
- Use the built-in timer for session duration

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── PokerBankrollApp.tsx # Main application component
│   ├── LiveTournament.tsx   # Live tournament mode
│   └── CSVImport.tsx        # CSV import functionality
├── hooks/
│   ├── useAuth.tsx          # Authentication hook
│   ├── usePokerSessions.tsx # Session management
│   └── useTournaments.tsx   # Tournament tracking
├── pages/
│   ├── Index.tsx            # Home page
│   ├── Auth.tsx             # Login/signup page
│   └── NotFound.tsx         # 404 page
├── integrations/
│   └── supabase/            # Supabase client and types
└── lib/
    └── utils.ts             # Utility functions
```

## 🗄️ Database Schema

The application uses Supabase with the following main tables:

- **poker_sessions**: Stores individual session data
- **tournaments**: Tracks live tournament information
- **auth.users**: Supabase authentication (managed)

All tables implement Row Level Security (RLS) for data privacy.

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style
- TypeScript for type safety
- ESLint + Prettier for code formatting
- Component-based architecture
- Custom hooks for data management

## 🚀 Deployment

### Lovable Platform (Recommended)
1. Open your [Lovable project](https://lovable.dev/projects/f12cf44e-c68e-4e13-b2c5-f2d2586bc88a)
2. Click **Share → Publish**
3. Your app will be deployed automatically

### Manual Deployment
The app can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

Build the project and upload the `dist` folder to your hosting service.

## 🔒 Security Features

- **Authentication**: Secure email/password authentication via Supabase
- **Data Privacy**: Row Level Security ensures users only access their own data
- **Input Validation**: Zod schemas validate all user inputs
- **HTTPS**: All data transmission encrypted in transit

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Lovable Docs](https://docs.lovable.dev/)
- **Issues**: Create an issue in this repository
- **Lovable Community**: [Discord](https://discord.com/channels/1119885301872070706/1280461670979993613)

## 🎮 Features Roadmap

- [ ] Tournament result tracking
- [ ] Multi-table session support
- [ ] Advanced analytics dashboard
- [ ] Export functionality (PDF reports)
- [ ] Mobile app companion
- [ ] Social features (leaderboards)

---

Built with ❤️ using [Lovable](https://lovable.dev)