# TalentFlow - Learning Management System

A comprehensive, full-stack learning management system built with Next.js, React, TypeScript, and Tailwind CSS. TalentFlow empowers educators to create, manage, and deliver engaging courses while helping learners master new skills with real-time progress tracking and analytics.

## Features

### For Learners
- Browse and enroll in available courses
- Track learning progress with detailed analytics
- Access course content (videos, PDFs, text)
- Mark lessons as complete
- View enrolled courses and completion status
- Personal learning dashboard

### For Instructors
- Create and manage courses
- Add course content with multiple formats (VIDEO, PDF, TEXT)
- Create and grade assignments
- Track student progress and engagement
- View detailed analytics on student performance
- Manage course enrollment

### For Administrators
- Comprehensive user management
- Role assignment and status control
- Platform analytics and metrics
- Monitor pending approvals
- User activity tracking
- Platform-wide statistics

## Tech Stack

- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Form Handling**: React Hook Form + Zod validation
- **Auth**: Custom JWT-based authentication
- **Real-time**: WebSocket integration for live updates
- **State Management**: React Context + Hooks
- **Charts**: Recharts
- **Notifications**: Sonner

## Project Structure

```
app/
├── auth/                      # Authentication pages
│   ├── login/
│   ├── register/
│   ├── verify-email/
│   ├── forgot-password/
│   ├── reset-password/
│   └── layout.tsx
├── dashboard/
│   ├── admin/                # Admin dashboard
│   │   ├── page.tsx
│   │   ├── users/
│   │   └── settings/
│   ├── instructor/           # Instructor dashboard
│   │   ├── page.tsx
│   │   ├── courses/
│   │   ├── assignments/
│   │   └── analytics/
│   ├── learner/             # Learner dashboard
│   │   ├── page.tsx
│   │   ├── courses/
│   │   ├── my-courses/
│   │   └── profile/
│   └── layout.tsx
├── layout.tsx               # Root layout with auth provider
├── page.tsx                 # Home page
└── globals.css

lib/
├── types.ts                 # TypeScript type definitions
├── schemas.ts               # Zod validation schemas
├── api-client.ts            # API client wrapper
├── auth-context.tsx         # Authentication context & provider
└── websocket-client.ts      # WebSocket client for real-time updates

components/
├── ui/                      # shadcn/ui components
└── dashboard/
    └── nav.tsx             # Dashboard navigation

hooks/
├── use-websocket.ts         # WebSocket hook
├── use-mobile.tsx           # Mobile detection
└── use-toast.ts             # Toast notifications
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd talentflow
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Set up environment variables:
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
```

4. Run the development server:
```bash
pnpm dev
# or
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Integration

The application communicates with a backend API. Update the `NEXT_PUBLIC_API_URL` environment variable to point to your API server.

### Required API Endpoints

**Authentication**
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/verify-email` - Email verification
- `POST /auth/request-password-reset` - Request password reset
- `POST /auth/reset-password` - Reset password
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user

**Admin APIs**
- `GET /admin/users` - Get all users
- `PUT /admin/users/{id}` - Update user
- `DELETE /admin/users/{id}` - Delete user
- `GET /admin/stats` - Platform statistics

**Instructor APIs**
- `GET /instructor/courses` - Get instructor's courses
- `POST /instructor/courses` - Create course
- `PUT /instructor/courses/{id}` - Update course
- `DELETE /instructor/courses/{id}` - Delete course
- `POST /instructor/courses/{id}/content` - Add course content
- `GET /instructor/assignments` - Get assignments
- `POST /instructor/assignments` - Create assignment
- `GET /instructor/analytics` - Get analytics

**Learner APIs**
- `GET /learner/courses` - Browse available courses
- `GET /learner/courses/{id}` - Get course details
- `POST /learner/enrollments` - Enroll in course
- `GET /learner/enrollments` - Get enrolled courses
- `POST /learner/progress` - Update lesson progress
- `GET /learner/progress/{courseId}` - Get course progress

## Authentication Flow

1. User registers or logs in
2. Server returns JWT access and refresh tokens
3. Tokens are stored in localStorage
4. Access token is sent in Authorization header for all API requests
5. Refresh token is used to obtain new access tokens when expired
6. User session is bootstrapped on app load from `/auth/me` endpoint

## Validation

Form validation is handled with Zod schemas in `/lib/schemas.ts`. All user inputs are validated client-side before submission and should also be validated server-side.

Key validation rules:
- Passwords: 8-100 characters
- Emails: Valid email format
- Names: Required, max 100 characters
- Course titles: 1-200 characters
- Descriptions: 10-2000 characters

## Real-time Updates

The application includes WebSocket support for real-time updates via the `useWebSocket` hook:

```tsx
import { useWebSocket, useWebSocketMessage } from '@/hooks/use-websocket';

function MyComponent() {
  const { isConnected, send } = useWebSocket();

  useWebSocketMessage('LESSON_PROGRESS_UPDATE', (message) => {
    console.log('Lesson progress updated:', message.payload);
  });

  return <div>{isConnected ? 'Connected' : 'Disconnected'}</div>;
}
```

## Role-Based Access Control

- **Learner**: Can browse courses, enroll, track progress
- **Instructor**: Can create/manage courses, view student analytics
- **Admin**: Full platform management, user management, approvals

Routes are protected based on user role via the dashboard layout.

## Styling

The application uses Tailwind CSS with a custom design token system. Colors and theme variables are defined in `/app/globals.css` and can be customized via CSS custom properties.

## Building for Production

```bash
pnpm build
pnpm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | http://localhost:8080/api |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | ws://localhost:8080/ws |

## Development

### Running Tests
```bash
pnpm test
```

### Building
```bash
pnpm build
```

### Linting
```bash
pnpm lint
```

## Key Dependencies

- `next` - React framework
- `react-hook-form` - Form state management
- `zod` - Schema validation
- `recharts` - Charts and data visualization
- `sonner` - Toast notifications
- `lucide-react` - Icons
- `tailwind-merge` - Tailwind CSS utilities

## Notes

- Mock data is used throughout the application for demonstration
- Real API integration requires updating the mock data with actual API calls
- WebSocket integration requires a compatible backend supporting STOMP protocol
- Authentication tokens should never be exposed in client-side code in production

## License

MIT

## Support

For issues, feature requests, or questions, please open an issue in the repository.
