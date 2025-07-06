# SosheIQ - Social Interaction Trainer AI

A Next.js-based AI-powered social interaction training application to help users improve social skills through realistic conversation scenarios.

## Features

- **AI-Powered Conversations**: Realistic, dynamic social scenarios powered by Google Gemini AI
- **Visual Feedback**: AI-generated images showing body language, expressions, and context
- **Progress Tracking**: Engagement metrics, goal achievement, and session analytics
- **Firefly Animation**: Tactile, animated firefly background on hero/setup screens, hidden during sessions
- **Animated Gradients**: Hero/setup gradients with smooth ease-in and breathing (breathe in/out) effect
- **Replay Button Animation**: Tactile, spring-based replay button with ripple glow and lingering exit
- **Ripple & Glow Effects**: Satisfying, modern UI feedback on interactive elements
- **Session State Management**: Global context for session state, controlling fireflies, backgrounds, and overlays
- **Black Global Background**: True black background for all non-interaction screens for maximum contrast
- **Accessibility**: Full keyboard navigation, screen reader support, ARIA labels, and high-contrast mode
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices; landscape mode support
- **Error Handling**: Global error boundaries, standardized error messages, and user-friendly error UI
- **Performance Optimizations**: Lazy loading, code splitting, image optimization, and custom performance monitoring
- **Compartmentalized Documentation**: All Markdown docs organized in topic-based folders under `docs/`
- **Custom Animations**: Framer Motion and custom CSS for tactile, modern, and accessible UI transitions
- **Global State**: React Context API for seamless state sharing across the app

## Technology Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS (utility-first, custom animations)
- **Animation**: Framer Motion (`motion/react`) for tactile, spring-based UI and transitions
- **AI Services**: Google Gemini AI (text), Google Imagen (image generation)
- **State Management**: React Context API (global session state), React hooks
- **Accessibility**: Custom AccessibilityProvider, full ARIA and keyboard support
- **Testing**: Jest, React Testing Library
- **Performance**: Custom performance monitoring utilities, code splitting, lazy loading
- **Documentation**: Compartmentalized Markdown docs in `docs/` folder

## Prerequisites

- Node.js 18+
- npm or yarn
- Google AI API key (Gemini + Imagen)

## Project Structure

```
SosheIQ/
├── components/           # React components
├── constants/            # Application constants
├── services/             # API services
├── types.ts              # TypeScript type definitions
├── utils/                # Utility functions
├── pages/                # Next.js pages
├── styles/               # Global styles
├── __tests__/            # Test files
├── docs/                 # Project documentation (compartmentalized)
│   ├── migrations/       # Migration and prompting plans
│   ├── fixes/            # Bugfix and patch logs
│   ├── logs/             # Project phase and issue logs
│   └── other/            # Miscellaneous documentation
├── README.md             # Project overview (remains at root)
├── LICENSE               # License file (remains at root)
└── ...                   # Other config and setup files
```

## Testing

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

## Production Build

### Build the application

```bash
npm run build
```

### Start production server

```bash
npm start
```

## Development Guidelines

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

## Design System

### Colors

- **Primary:** Teal (`#14b8a6`)
- **Secondary:** Slate (`#0f172a`)
- **Accent:** Emerald (`#10b981`)
- **Info:** Sky (`#0ea5e9`)
- **Background:** True Black (`#000000`) for all non-interaction screens
- **Gradients:** Hero/setup gradients (teal/blue/slate, animated with opacity)
- **Surface:** Slate-900 overlays for cards, modals, and setup screens

### Typography

- **Font:** Inter (system fallback)
- **Headings:** Bold, large, high-contrast
- **Body:** Regular, readable, accessible line height
- **Code:** Monospace for code blocks and technical UI

### Animations & Motion

- **Framework:** Framer Motion (`motion/react`) for all tactile, spring-based, and exit/entry UI
- **Tactile Feedback:** Buttons and interactive elements use spring, scale, and ripple effects
- **Replay Button:** Spring enlarge, ripple glow, and lingering fade
- **Gradients:** Animated opacity (breathe in/out) with ease-in on load
- **Fireflies:** Animated, blurred, and layered for depth
- **Standardized Timing:** 150ms (fast), 300ms (normal), 500ms (slow), 600ms (hero/page transitions)
- **Easing:** `easeInOut` for most transitions, spring for tactile feedback
- **Consistent Classes:** Custom animation classes in `globals.css` for fade, pulse, shimmer, etc.

### Accessibility & UX

- **High Contrast:** True black backgrounds, high-contrast text, and overlays
- **Focus States:** Clear, visible focus rings and keyboard navigation
- **ARIA & Roles:** All interactive elements labeled for screen readers
- **Touch-Friendly:** Large tap targets, mobile/landscape support
- **Responsive:** Fluid layouts for desktop, tablet, and mobile

### UI Principles

- **Modern, Minimalist:** Clean, uncluttered, and visually appealing
- **Tactile & Playful:** Subtle motion, glow, and ripple effects for delight
- **Consistent Spacing:** Standardized padding, margin, and border radius
- **Layering:** Z-index and isolation for overlays, gradients, and fireflies

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
- Proper state immutability
- Optimistic updates where appropriate

## Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interactions
- Landscape mode support

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

- Ensure Node.js 18+ support
- Set environment variables
- Configure build command: `npm run build`
- Configure start command: `npm start`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0). See the [LICENSE](LICENSE) file for details.

## Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review existing issues

## Changelog

### v0.2.0

- Firefly animation on hero/setup screens, hidden during session
- Animated hero/setup gradients with smooth ease-in and breathing effect
- Replay button: tactile, spring-based, with ripple glow and lingering exit
- Black global background for all non-interaction screens
- Session state context for global UI control
- Compartmentalized all documentation into `docs/` with topic subfolders
- Reduced bottom gradient in fullscreen photo modes
- Removed redundant backgrounds and improved z-index layering
- Numerous bugfixes, polish, and accessibility improvements

### v0.1.0

- Initial release
- Core social interaction features
- AI integration
- Basic UI/UX

## Roadmap

- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Voice interaction
- [ ] Social sharing features
- [ ] Advanced customization options
- [ ] Mobile app version

## Documentation Structure

All Markdown documentation files have been moved to a new `docs/` folder at the project root. Subfolders are organized by topic:

- `docs/migrations/` — Migration and prompting plans
- `docs/fixes/` — Bugfix and patch logs
- `docs/logs/` — Project phase and issue logs
- `docs/other/` — Miscellaneous documentation

Refer to the `docs/` folder for all project documentation.
