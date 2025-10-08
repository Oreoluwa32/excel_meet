# Excel Meet

> A professional networking platform connecting Nigerian professionals across industries

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0.0-purple)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)

## 🌟 Features

- **Professional Networking**: Connect with professionals across various industries in Nigeria
- **Real-time Messaging**: Chat with connections in real-time
- **Job Board**: Post and discover job opportunities
- **Events**: Create and join professional events and meetups
- **Skills Showcase**: Highlight your expertise and find talent
- **Secure Authentication**: Email/password and social login options
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Offline Support**: Continue browsing with offline indicators
- **Performance Optimized**: Code splitting, lazy loading, and caching
- **SEO Friendly**: Dynamic meta tags and sitemap generation

## 🚀 Quick Start

### Prerequisites

- Node.js 16.x or higher
- npm or yarn
- Supabase account ([Sign up here](https://supabase.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/excel-meet.git
   cd excel-meet
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase** ⚠️ **IMPORTANT**
   
   You must manually set up your Supabase database:
   
   📖 **Follow the complete guide**: [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md)
   
   Quick summary:
   - Create a Supabase project
   - Run all 4 migration files in the SQL Editor (in order!)
   - Create storage buckets (avatars, documents, company-logos)
   - Configure authentication providers
   
   **This step is required** - the app won't work without it!

5. **Verify Supabase setup**
   ```bash
   npm run dev
   ```
   
   Open browser console and run:
   ```javascript
   verifySupabaseSetup()
   ```
   
   All checks should pass ✅

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📚 Documentation

- **[Supabase Setup Guide](./SUPABASE_SETUP_GUIDE.md)** - ⚠️ **START HERE** - Complete Supabase setup
- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [Deployment Guide](./DEPLOYMENT.md) - How to deploy to production
- [Production Checklist](./PRODUCTION_READY_CHECKLIST.md) - Pre-launch checklist
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute
- [Changelog](./CHANGELOG.md) - Version history

## 🏗️ Project Structure

```
excel-meet/
├── public/              # Static assets
│   ├── manifest.json    # PWA manifest
│   └── robots.txt       # SEO robots file
├── src/
│   ├── components/      # Reusable React components
│   │   ├── Modal.jsx
│   │   ├── Toast.jsx
│   │   ├── Pagination.jsx
│   │   └── ...
│   ├── hooks/          # Custom React hooks
│   │   ├── useDebounce.js
│   │   ├── useFetch.js
│   │   ├── useLocalStorage.js
│   │   └── ...
│   ├── pages/          # Page components
│   ├── utils/          # Utility functions
│   │   ├── apiClient.js
│   │   ├── logger.js
│   │   ├── security.js
│   │   ├── validation.js
│   │   └── ...
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── .env.example        # Environment variables template
├── .gitignore          # Git ignore rules
├── netlify.toml        # Netlify deployment config
├── vercel.json         # Vercel deployment config
├── vite.config.mjs     # Vite configuration
└── package.json        # Dependencies and scripts
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start development server
npm start               # Alias for dev

# Building
npm run build           # Build for production
npm run build:prod      # Build with production env
npm run build:staging   # Build with staging env

# Preview
npm run preview         # Preview production build locally

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint errors
npm run format          # Format code with Prettier

# Analysis
npm run analyze         # Analyze bundle size
```

## 🔧 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Framer Motion** - Animations
- **TailwindCSS** - Utility-first CSS framework
- **Lucide React** - Icon library

### Backend & Services
- **Supabase** - Backend as a Service (Auth, Database, Storage)
- **Axios** - HTTP client

### State Management
- **Redux Toolkit** - Global state management
- **React Hook Form** - Form state management

### Data Visualization
- **Recharts** - Chart library
- **D3.js** - Data visualization

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **PostCSS** - CSS processing

## 🔐 Security Features

- XSS protection with input sanitization
- CSRF protection
- Secure token generation
- File upload validation
- Rate limiting
- Content Security Policy headers
- Clickjacking prevention
- Secure storage with encryption

## 📊 Performance Optimizations

- Code splitting by route and vendor
- Lazy loading of components
- Image optimization
- Debouncing and throttling
- Request caching
- Service worker for offline support
- Web Vitals monitoring

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Progressive Web App (PWA)

Excel Meet is a Progressive Web App that can be installed on your device:

1. Visit the website on your mobile device
2. Tap the "Add to Home Screen" option
3. Launch the app from your home screen

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Follow the existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed
- Test your changes thoroughly

## 🐛 Bug Reports

Found a bug? Please open an issue with:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Browser and OS information

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Project Lead** - [Your Name](https://github.com/yourusername)
- **Contributors** - [See all contributors](https://github.com/yourusername/excel-meet/graphs/contributors)

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the amazing backend platform
- [Vite](https://vitejs.dev) for the blazing fast build tool
- [TailwindCSS](https://tailwindcss.com) for the utility-first CSS framework
- All our contributors and supporters

## 📞 Support

- **Email**: support@excelmeet.com
- **Twitter**: [@excelmeet](https://twitter.com/excelmeet)
- **Discord**: [Join our community](https://discord.gg/excelmeet)

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced search filters
- [ ] Video calling integration
- [ ] AI-powered job matching
- [ ] Company profiles
- [ ] Premium subscriptions
- [ ] Analytics dashboard
- [ ] API for third-party integrations

---

Made with ❤️ in Nigeria