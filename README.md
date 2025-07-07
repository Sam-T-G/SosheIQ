# SosheIQ - Social Interaction Trainer AI

---

## What's New in 2.1

- **Expanded Trait System:**
  - Rich, scientifically anchored trait palette for AI personas, grouped by psychological dimension.
  - Each trait features a clear, animated tooltip for user guidance.
  - Duplicates removed; users can also type a fully custom personality description.
- **Cinematic Animations:**
  - Both initial and session loading screens now feature world-class, spring-based fade-in animations for header and footer.
  - All major UI transitions use Framer Motion for smooth, modern effects.
- **Prompt Logic Overhaul:**
  - All AI prompt construction is now centralized in a canonical `promptService.ts` for maintainability and extensibility.
- **UI/UX & Accessibility:**
  - Custom, accessible tooltip component for trait explanations.
  - Consistent theming, improved accessibility, and keyboard navigation.
- **Age Bracket Update:**
  - Minimum custom persona age is now 18; "Teenager (13-17)" bracket removed.
- **Bug Fixes & Polish:**
  - Animation synchronization, mobile/desktop layout fixes, and codebase cleanup.

---

SosheIQ is a Next.js-based AI-powered application designed to help users improve their social skills through realistic, interactive conversation scenarios. The platform leverages advanced AI for dynamic dialogue, visual feedback, and progress tracking, with a focus on accessibility, performance, and robust error handling.

## Features

- AI-powered, realistic social conversation scenarios
- Visual feedback with AI-generated images (body language, expressions)
- Progress tracking and engagement metrics
- Comprehensive accessibility support (keyboard navigation, screen readers)
- Responsive design for desktop and mobile
- Robust error boundaries and user-friendly error messages
- **Animated tooltips for all personality traits**
- **Cinematic loading and session screens**
- **Canonical trait mapping for persona creation**

## Technology Stack

- **Framework:** Next.js 14, TypeScript
- **Styling:** Tailwind CSS, custom CSS animations
- **AI Services:** Google Gemini (text), Google Imagen (images)
- **Animations:** Framer Motion, custom CSS
- **Testing:** Jest, React Testing Library
- **Performance:** Custom monitoring utilities

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Google AI API key (Gemini and Imagen)

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd SosheIQ
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   GOOGLE_AI_API_KEY=your_api_key_here
   ```
4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
SosheIQ/
├── components/           # React components
├── constants/            # Application constants (see personality.ts for trait mapping)
├── services/             # API and AI service integrations (see promptService.ts)
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
├── pages/                # Next.js pages
├── styles/               # Global styles
├── __tests__/            # Test files
├── docs/                 # Documentation (plans, fixes, logs, root)
```

## Testing

- **Run all tests:**
  ```bash
  npm test
  ```
- **Run with coverage:**
  ```bash
  npm run test:coverage
  ```
- **Watch mode:**
  ```bash
  npm run test:watch
  ```

## Building for Production

- **Build the application:**
  ```bash
  npm run build
  ```
- **Start the production server:**
  ```bash
  npm start
  ```

## Development Guidelines

- Use TypeScript for all new code
- Follow the ESLint configuration
- Write meaningful commit messages
- Use functional components and React hooks
- Implement accessibility best practices (ARIA, roles, keyboard navigation)
- Use error boundaries where appropriate
- Optimize performance (React.memo, dependency arrays, image optimization)
- Maintain good test coverage (unit and integration tests)

## Design System

- **Colors:**
  - Primary: Teal (#14b8a6)
  - Secondary: Slate (#0f172a)
  - Accent: Emerald (#10b981)
  - Background: Gradient (slate-900 to sky-800)
- **Typography:**
  - Font: Inter (system fallback)
  - Headings: Bold
  - Body: Regular
  - Code: Monospace
- **Animations:**
  - Standard timings: 150ms (fast), 300ms (normal), 500ms (slow)
  - Easing: ease-out
  - Consistent animation classes in globals.css
  - **All major transitions use Framer Motion**

## Security

- API keys are never exposed to the client
- Environment variables are validated server-side
- Input validation on all user inputs
- CORS protection enabled
- XSS prevention through proper sanitization

## Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management
- ARIA labels and roles
- **Custom tooltips and trait selection are fully accessible**

## Performance

- Lazy loading for components
- Image optimization
- Code splitting
- Performance monitoring utilities
- Memory leak prevention

## Error Handling

- Global error boundaries
- Standardized error messages
- User-friendly error UI
- Proper error logging
- Graceful degradation

## State Management

- React hooks for local state
- Context API for global state
- State immutability
- Optimistic updates where appropriate

## Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interactions
- Landscape mode support

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in the Vercel dashboard
3. Deploy automatically on push to the main branch

### Other Platforms

- Ensure Node.js 18+ support
- Set environment variables
- Build: `npm run build`
- Start: `npm start`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Support

For support and questions:

- Create an issue in the repository
- Check the documentation in the `docs/` folder
