# SosheIQ - Social Interaction Trainer AI

A Next.js-based AI-powered social interaction training application that helps users improve their social skills through realistic conversation scenarios.

## 🚀 Features

- **AI-Powered Conversations**: Realistic social scenarios with dynamic AI responses
- **Visual Feedback**: AI-generated images showing body language and expressions
- **Progress Tracking**: Engagement metrics and goal achievement tracking
- **Accessibility**: Full keyboard navigation and screen reader support
- **Responsive Design**: Optimized for desktop and mobile devices
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom animations
- **AI Services**: Google Gemini AI for text generation
- **Image Generation**: Google Imagen for visual feedback
- **Animations**: Framer Motion + custom CSS animations
- **Testing**: Jest + React Testing Library
- **Performance**: Custom performance monitoring utilities

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Google AI API key (Gemini + Imagen)

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd SosheIQ
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
GOOGLE_AI_API_KEY=your_api_key_here
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗️ Project Structure

```
SosheIQ/
├── components/           # React components
│   ├── ErrorBoundary.tsx
│   ├── AccessibilityProvider.tsx
│   └── ...
├── constants/           # Application constants
│   ├── errorMessages.ts
│   ├── animations.ts
│   ├── zIndex.ts
│   └── ...
├── services/           # API services
│   ├── geminiService.ts
│   └── imagenService.ts
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
│   └── performance.ts
├── pages/              # Next.js pages
├── styles/             # Global styles
└── __tests__/          # Test files
```

## 🧪 Testing

### Run tests

```bash
npm test
```

### Run tests with coverage

```bash
npm run test:coverage
```

### Run tests in watch mode

```bash
npm run test:watch
```

## 🏭 Building for Production

### Build the application

```bash
npm run build
```

### Start production server

```bash
npm start
```

## 🔧 Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages

### Component Guidelines

- Use functional components with hooks
- Implement proper TypeScript interfaces
- Add accessibility attributes (aria-labels, roles)
- Include error boundaries where appropriate

### Performance Guidelines

- Use React.memo for expensive components
- Implement proper dependency arrays in useEffect
- Use the performance monitoring utilities
- Optimize images and assets

### Testing Guidelines

- Write unit tests for utility functions
- Write integration tests for complex components
- Test accessibility features
- Maintain good test coverage

## 🎨 Design System

### Colors

- Primary: Teal (#14b8a6)
- Secondary: Slate (#0f172a)
- Accent: Emerald (#10b981)
- Background: Gradient (slate-900 to sky-800)

### Typography

- Font: Inter (system fallback)
- Headings: Bold weights
- Body: Regular weights
- Code: Monospace

### Animations

- Standardized timing: 150ms (fast), 300ms (normal), 500ms (slow)
- Easing: ease-out for most animations
- Consistent animation classes in globals.css

## 🔒 Security

- API keys are never exposed to the client
- Environment variables are validated server-side
- Input validation on all user inputs
- CORS protection enabled
- XSS prevention through proper sanitization

## ♿ Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management
- ARIA labels and roles

## 📊 Performance

- Lazy loading for components
- Image optimization
- Code splitting
- Performance monitoring utilities
- Memory leak prevention

## 🐛 Error Handling

- Global error boundaries
- Standardized error messages
- User-friendly error UI
- Proper error logging
- Graceful degradation

## 🔄 State Management

- React hooks for local state
- Context API for global state
- Proper state immutability
- Optimistic updates where appropriate

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interactions
- Landscape mode support

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

- Ensure Node.js 18+ support
- Set environment variables
- Configure build command: `npm run build`
- Configure start command: `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review existing issues

## 🔄 Changelog

### v0.1.0

- Initial release
- Core social interaction features
- AI integration
- Basic UI/UX

## 📈 Roadmap

- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Voice interaction
- [ ] Social sharing features
- [ ] Advanced customization options
- [ ] Mobile app version
