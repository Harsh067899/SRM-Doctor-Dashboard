# Doctor Dashboard - Child Development Tracker

A comprehensive Next.js dashboard for doctors to monitor child development progress, analyze user data, and communicate with parents.

## Features

### 📊 **Dashboard Overview**
- Real-time statistics and KPIs
- User activity monitoring
- Video engagement analytics
- Development progress tracking

### 👥 **User Management**
- Complete user profiles with contact information
- Activity tracking and engagement history
- Development milestone progress
- Parent-child relationship mapping

### 📹 **Video Analytics**
- Video performance metrics (views, approvals, disapprovals)
- User engagement patterns
- Content effectiveness analysis
- Milestone achievement tracking

### 💬 **Messaging System**
- Real-time chat with parents
- Message history and search
- Professional communication tools
- Parent guidance and support

### 📈 **Advanced Analytics**
- Individual user progress analysis
- Development milestone tracking
- Age-appropriate content recommendations
- Concern identification and alerts

## Technology Stack

- **Frontend**: Next.js 15 with TypeScript
- **Backend**: Firebase Firestore
- **Styling**: Custom CSS (no frameworks)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Date Handling**: date-fns

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project with Firestore enabled

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd doctor-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Update `src/lib/firebase.ts` with your Firebase configuration
   - Ensure Firestore security rules allow doctor access

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
doctor-dashboard/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── page.tsx         # Dashboard home
│   │   ├── users/           # User management pages
│   │   ├── messages/        # Messaging interface
│   │   └── layout.tsx       # Root layout
│   ├── components/          # Reusable UI components
│   │   ├── DashboardLayout.tsx
│   │   ├── StatsCard.tsx
│   │   ├── UsersList.tsx
│   │   └── VideoAnalytics.tsx
│   └── lib/                 # Utilities and services
│       ├── firebase.ts      # Firebase configuration
│       ├── firestore.ts     # Database operations
│       └── types.ts         # TypeScript interfaces
├── public/                  # Static assets
└── package.json
```

## Database Schema

The dashboard integrates with the existing Flutter app's Firestore database:

### Collections Used:
- `users` - User profile information
- `profile` - Extended user profiles
- `video_engagement` - User-video interaction data
- `video_stats` - Aggregated video statistics
- `chats` - Messaging data (created by dashboard)
- `notifications` - Admin notifications

## Key Features Explained

### Dashboard Analytics
- **Total Users**: Number of registered parents
- **Active Users**: Users active in the last 7 days
- **Video Performance**: Most viewed and highest-rated content
- **Engagement Metrics**: User interaction patterns

### User Management
- **Search & Filter**: Find users by name, phone, or email
- **Activity Tracking**: Last active timestamps and patterns
- **Engagement History**: Complete video interaction timeline
- **Progress Monitoring**: Development milestone completion

### Messaging System
- **Real-time Chat**: Instant messaging with parents
- **Message History**: Complete conversation threads
- **User Search**: Quick access to parent conversations
- **Professional Tools**: Structured communication interface

### Individual User Analysis
- **Development Progress**: Age-appropriate milestone tracking
- **Video Preferences**: Content engagement patterns
- **Concern Detection**: Areas needing attention
- **Parent Communication**: Direct messaging capability

## Security & Privacy

- Firebase security rules ensure data protection
- Doctor authentication required for access
- HIPAA-compliant data handling practices
- Secure communication channels

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
Create `.env.local` for environment-specific configuration:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
# ... other Firebase config
```

### Deploying to Vercel

1. Sign in to Vercel (https://vercel.com) and click "Add New > Project".
2. Import this Git repository (GitHub/GitLab/Bitbucket). If not pushed yet:
    - Create a new Git repository and push the code
3. During the import wizard, open the Environment Variables section and add all of these:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=parentaleye-64fc0.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=parentaleye-64fc0
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=parentaleye-64fc0.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=338384567214
NEXT_PUBLIC_FIREBASE_APP_ID=1:338384567214:web:32a9c10f051a4e307ba63f
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-DH4425ZXEV
```
4. Framework preset: Next.js (auto-detected)
5. Root directory: leave blank (project root)
6. Leave build command and output directory as defaults (Vercel uses `next build`).
7. Click Deploy.

After the first successful deployment you can:
- Use "Promote to Production" to push the preview to production.
- Add a custom domain in the Domains tab.

### Post-Deployment Checklist
- Confirm environment variables (Project Settings > Environment Variables)
- Visit the deployed URL and test key pages: `/`, `/users`, `/videos`, `/analytics`
- Open Browser DevTools > Network to ensure Firestore requests succeed (no 403/permission errors)
- If auth required later, ensure Firebase Authentication providers are enabled

### Updating Firebase Config Securely
If Firebase project changes, update variables in Vercel:
1. Go to Project Settings > Environment Variables
2. Edit the changed value(s)
3. Redeploy (or trigger via git push) – Vercel creates an immutable build per deployment

### Local vs Vercel
`NEXT_PUBLIC_` prefix is required because Firebase is initialized on the client. Do NOT place secrets without that prefix unless you move initialization server-side.

### Optional: Vercel Analytics / Speed Insights
Add in `next.config.ts` if needed:
```ts
const nextConfig = {
   experimental: {
      instrumentationHook: true,
   },
};
export default nextConfig;
```
Then add `instrumentation.ts` for custom metrics. (Not required for basic deployment.)

## Development Guidelines

### Code Organization
- Use TypeScript for all components
- Follow Next.js 13+ app router conventions
- Implement proper error handling
- Maintain responsive design principles

### Styling
- Custom CSS with utility classes
- Consistent color scheme and typography
- Mobile-first responsive design
- Accessible UI components

### Data Management
- Use Firebase SDK best practices
- Implement proper loading states
- Handle offline scenarios
- Cache frequently accessed data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with proper testing
4. Submit a pull request with detailed description

## Support

For technical issues or feature requests:
- Review existing documentation
- Check Firebase configuration
- Verify database permissions
- Contact the development team

## License

This project is proprietary software for medical professionals monitoring child development. All rights reserved.

---

**Built for healthcare professionals to support child development tracking and parent guidance.**