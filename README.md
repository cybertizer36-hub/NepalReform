# 🇳🇵 Nepal Reforms Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A comprehensive digital platform presenting 27 evidence-based reform proposals for Nepal's democratic transformation. Built with modern web technologies to enable citizen engagement, voting, and collaborative policy development.

🌐 **Live Demo**: [https://nepalreforms.com](https://nepalreforms.com)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Reform Categories](#reform-categories)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Development](#development)
- [Contributing](#contributing)
- [API Documentation](#api-documentation)
- [Performance](#performance)
- [Deployment](#deployment)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Contact](#contact)

## 🎯 Overview

The Nepal Reforms Platform is an open-source civic engagement platform that presents comprehensive reform proposals addressing critical challenges in Nepal's governance system. Each reform includes:

- **Problem Analysis**: Short and detailed problem statements
- **Phased Solutions**: Immediate and long-term implementation strategies
- **Real-World Evidence**: International case studies and success stories
- **Implementation Roadmap**: Timeline-based action plans
- **Performance Metrics**: Measurable targets for accountability

### Mission

To empower Nepal's citizens, especially youth, to actively participate in shaping democratic reforms through transparent, evidence-based policy proposals and collaborative engagement.

## ✨ Features

### Core Functionality
- **📊 27 Comprehensive Reforms**: Detailed proposals with multi-tier content structure
- **🗳️ Real-time Voting System**: Democratic priority setting through citizen votes
- **💬 Community Suggestions**: Authenticated users can submit improvements
- **🌐 Multi-language Support**: English and Nepali (coming soon)
- **📱 Responsive Design**: Mobile-first approach with PWA capabilities

### User Engagement
- **Anonymous Voting**: No login required for basic participation
- **Opinion Platform**: Share and discuss reform proposals
- **Advanced Filtering**: Search by category, priority, timeline
- **Progress Tracking**: Monitor implementation status (coming soon)

### Technical Features
- **Real-time Updates**: Live voting counts via Supabase
- **Offline Access**: Static content available without connection
- **SEO Optimized**: Server-side rendering for better visibility
- **Accessibility**: WCAG 2.1 AA compliant with ARIA labels

## 📂 Reform Categories

The platform covers 27 reforms across these key areas:

| Category | Number of Reforms | Priority Focus |
|----------|------------------|----------------|
| 🔴 Anti-Corruption | 3 | High |
| 🗳️ Electoral Reform | 3 | High |
| 🏛️ Governance | 4 | High |
| 💻 Digital Governance | 2 | High |
| 📊 Transparency | 3 | High |
| ⚖️ Judicial Reform | 2 | High |
| 📚 Education | 2 | High |
| 🏥 Healthcare | 1 | High |
| 🛡️ Social Protection | 1 | High |
| 💰 Financial Management | 2 | High |
| 🚌 Transportation | 1 | Medium |
| 💼 Economic Development | 1 | Medium |
| 🏢 Civil Service Reform | 2 | High |

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15.2.4](https://nextjs.org/) with App Router
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/)
- **State Management**: React Hooks + Context API
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)

### Backend
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Subscriptions
- **Email**: [Resend](https://resend.com/)

### Development Tools
- **Language**: TypeScript 5
- **Package Manager**: npm/pnpm
- **Linting**: ESLint
- **Formatting**: Prettier
- **Analytics**: Vercel Analytics

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or pnpm
- Git

### Installation

1. **Clone the repository**
\`\`\`bash
git clone https://github.com/yourusername/nepal-reforms-platform.git
cd nepal-reforms-platform
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
# or
pnpm install
\`\`\`

3. **Set up environment variables**
\`\`\`bash
cp .env.local.example .env.local
\`\`\`

4. **Configure Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Update `.env.local` with your credentials

5. **Run the development server**
\`\`\`bash
npm run dev
# or
pnpm dev
\`\`\`

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Email Configuration (Optional)
RESEND_API_KEY=your_resend_api_key

# Analytics (Optional)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id
\`\`\`

## 📁 Project Structure

\`\`\`
nepal-reforms-platform/
├── app/                    # Next.js 13+ App Router
│   ├── admin/             # Admin dashboard
│   ├── agenda/            # Individual reform pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── opinions/          # Opinion platform
│   └── dashboard/         # User dashboard
├── components/            # React components
│   ├── admin/            # Admin components
│   ├── ui/               # UI components (Radix UI)
│   ├── manifesto-card.tsx
│   ├── manifesto-list.tsx
│   ├── agenda-vote-section.tsx
│   └── suggestion-form.tsx
├── lib/                   # Utilities and configurations
│   ├── manifesto-data.ts # Reform data (27 proposals)
│   ├── supabase/         # Database client
│   └── utils.ts          # Helper functions
├── public/               # Static assets
├── styles/               # Global styles
└── hooks/                # Custom React hooks
\`\`\`

## 💻 Development

### Available Scripts

\`\`\`bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Analysis
npm run analyze         # Analyze bundle size
npm run analyze:browser # Analyze client bundle
npm run analyze:server  # Analyze server bundle

# Environment
npm run env:pull        # Pull Vercel environment variables
\`\`\`

### Code Style

We follow these conventions:
- TypeScript for type safety
- Functional components with hooks
- Tailwind CSS for styling
- Component-based architecture
- Mobile-first responsive design

### Testing

\`\`\`bash
npm run test        # Run tests (coming soon)
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Generate coverage report
\`\`\`

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a PR.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   \`\`\`bash
   git checkout -b feature/your-feature-name
   \`\`\`
3. **Make your changes**
4. **Commit with conventional commits**
   \`\`\`bash
   git commit -m "feat: add new feature"
   \`\`\`
5. **Push to your fork**
   \`\`\`bash
   git push origin feature/your-feature-name
   \`\`\`
6. **Open a Pull Request**

### Contribution Areas

- 🌐 **Translations**: Help translate to Nepali and other languages
- 🐛 **Bug Fixes**: Report and fix bugs
- ✨ **Features**: Implement new features from our roadmap
- 📚 **Documentation**: Improve docs and examples
- 🎨 **Design**: Enhance UI/UX
- ♿ **Accessibility**: Improve accessibility features

## 📡 API Documentation

### Public Endpoints

\`\`\`typescript
// Get all agendas
GET /api/agendas
Query params:
  - page: number (default: 1)
  - limit: number (default: 20, max: 50)
  - category: string
  - priority: "High" | "Medium" | "Low"
  - search: string

// Get votes for an agenda
GET /api/votes/:agendaId

// Submit vote (no auth required)
POST /api/votes
Body: {
  agenda_id: string
  vote_type: "up" | "down"
}
\`\`\`

### Authenticated Endpoints

\`\`\`typescript
// Submit suggestion (requires auth)
POST /api/suggestions
Headers: Authorization: Bearer <token>
Body: {
  agenda_id: string
  content: string
}

// Create opinion (requires auth)
POST /api/opinions
Headers: Authorization: Bearer <token>
Body: {
  title: string
  content: string
  agenda_id: string
}
\`\`\`

## ⚡ Performance

### Current Metrics
- **Lighthouse Score**: 90+
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Bundle Size**: ~170KB (gzipped)

### Optimization Strategies
- Server-side rendering (SSR)
- Automatic code splitting
- Image optimization with Next.js Image
- API response caching (2-5 minutes)
- Static asset caching (1 year)

## 🚢 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/nepal-reforms-platform)

1. Click the button above
2. Configure environment variables
3. Deploy

### Manual Deployment

\`\`\`bash
# Build the application
npm run build

# Start production server
npm start
\`\`\`

### Docker Deployment

\`\`\`dockerfile
# Dockerfile available in repository
docker build -t nepal-reforms .
docker run -p 3000:3000 nepal-reforms
\`\`\`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

### Contributors
- Built in collaboration with engaged Nepali citizens
- Over 1,500 suggestions incorporated from the community
- Supported by youth activists and civil society organizations

### Special Thanks
- Original manifesto document contributors
- Early testers and feedback providers
- Open source community for amazing tools

### Technologies
- [Next.js](https://nextjs.org/) team for the amazing framework
- [Vercel](https://vercel.com/) for hosting and deployment
- [Supabase](https://supabase.com/) for backend infrastructure
- [Radix UI](https://www.radix-ui.com/) for accessible components

## 📧 Contact

- **Email**: [suggestions@nepalreforms.com](mailto:suggestions@nepalreforms.com)
- **Website**: [https://nepalreforms.com](https://nepalreforms.com)
- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/nepal-reforms-platform/issues)

### Maintainers
- [@yourusername](https://github.com/yourusername) - Lead Developer
- [@contributor](https://github.com/contributor) - Core Contributor

---

<div align="center">
  <p>
    <strong>Built with ❤️ for Nepal's Democratic Future</strong>
  </p>
  <p>
    <sub>© 2024 Nepal Reforms Platform. All rights reserved.</sub>
  </p>
</div>
