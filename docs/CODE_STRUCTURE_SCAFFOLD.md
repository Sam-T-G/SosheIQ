# SosheIQ Code Structure Scaffold

## Repository Overview

**SosheIQ** is a Next.js-based AI-powered social interaction training application that helps users improve their social skills through realistic, interactive conversation scenarios with AI personas.

## 🏗️ Architecture Overview

```
SosheIQ/
├── 🎯 Core Application Layer
├── 🤖 AI Services Layer
├── 🎨 UI/UX Components Layer
├── 🔧 Infrastructure Layer
└── 📚 Documentation & Testing Layer
```

## 📁 Directory Structure & Component Relationships

### 1. 🎯 Core Application Layer

#### **Entry Points & Routing**

```
pages/
├── _app.tsx                 # Main app wrapper with providers
├── _document.tsx            # HTML document structure
├── index.tsx                # Landing page (HeroScreen)
├── loading-demo.tsx         # Loading animation demo
└── api/                     # API endpoints
    ├── debug.ts             # Debug utilities
    └── init.ts              # Initialization endpoint
```

#### **Core Contexts & State Management**

```
contexts/
└── AuthContext.tsx          # Authentication state management
    ├── User types: 'guest', 'authenticated', 'loading'
    ├── Persistent storage via sessionStorage
    └── useAuth hook for easy access

providers/
└── AnimationProvider.tsx    # Global animation context
```

#### **Application Hooks**

```
hooks/
├── useAILoadingMessages.ts  # AI response loading states
├── useChatHistory.ts        # Chat conversation management
├── useInitConfig.ts         # Application initialization
├── useSessionStorage.ts     # Session persistence utilities
└── useTypewriter.ts         # Typewriter effect for text
```

### 2. 🤖 AI Services Layer

#### **AI Service Architecture**

```
services/
├── authService.ts           # Authentication service (future: Google/Apple/Email)
├── geminiService.ts         # Google Gemini AI text generation
├── imagenService.ts         # Google Imagen AI image generation
└── promptService.ts         # Centralized AI prompt construction
    ├── buildStartConversationPrompt()
    ├── buildNextAITurnPrompt()
    └── Dialogue chunking & action management
```

#### **AI Integration Flow**

```
User Input → promptService.ts → geminiService.ts → AI Response
                                    ↓
                            imagenService.ts → Visual Feedback
```

#### **Key AI Features**

- **Dynamic Dialogue Chunking**: Separates dialogue from actions for realistic conversations
- **Persona Management**: Rich trait system with scientific psychological dimensions
- **Visual Feedback**: AI-generated images for body language and expressions
- **Contextual Responses**: AI maintains conversation context and persona consistency

### 3. 🎨 UI/UX Components Layer

#### **Screen Components (User Journey)**

```
components/
├── 🚀 Onboarding Flow
│   ├── InitialLoadingScreen.tsx    # App startup
│   ├── HeroScreen.tsx              # Landing page
│   ├── LoginScreen.tsx             # Authentication entry
│   ├── SetupScreen.tsx             # Initial configuration
│   ├── GuidedSetup.tsx             # Step-by-step setup
│   └── InstructionsScreen.tsx      # User guidance
│
├── 🎭 Core Interaction
│   ├── InteractionScreen.tsx       # Main conversation interface
│   ├── ChatMessageView.tsx         # User message display
│   ├── ChatMessageViewAI.tsx       # AI response rendering
│   ├── ChatMessageViewAIThinking.tsx # AI thinking animation
│   └── RenderChatInterface.tsx     # Chat layout management
│
├── 🎬 Visual & Animation
│   ├── AIVisualCue.tsx             # AI-generated visual feedback
│   ├── BackgroundCrossfadeImage.tsx # Dynamic background transitions
│   ├── FireflyField.tsx            # Ambient visual effects
│   ├── SosheIQLogo.tsx             # Brand identity
│   └── ImageViewerOverlay.tsx      # Image interaction
│
├── 🧭 Navigation & UI
│   ├── Header.tsx                  # Top navigation
│   ├── Footer.tsx                  # Bottom navigation
│   ├── TopBannerContainer.tsx      # Status banners
│   ├── ProgressBar.tsx             # Progress indicators
│   └── Tooltip.tsx                 # Information overlays
│
├── 🎯 Specialized Features
│   ├── AnalysisScreen.tsx          # Progress analysis
│   ├── AboutScreen.tsx             # Information about app
│   ├── HelpOverlay.tsx             # User assistance
│   ├── QuickTipsScreen.tsx         # Quick guidance
│   ├── SafetyScreen.tsx            # Safety information
│   ├── PrivacyPolicyScreen.tsx     # Privacy details
│   └── TermsOfServiceScreen.tsx    # Terms of service
│
└── 🛡️ System Components
    ├── ErrorBoundary.tsx           # Error handling
    ├── ConfirmationDialog.tsx      # User confirmations
    ├── ConfirmEndInteractionDialog.tsx # Session end confirmation
    └── LoadingScreen.tsx           # Loading states
```

#### **Component Architecture Patterns**

```
Screen Component → Feature Components → UI Components → Base Elements
     ↓                    ↓                ↓              ↓
State Management → Business Logic → Presentation → Styling
```

### 4. 🔧 Infrastructure Layer

#### **Configuration & Constants**

```
constants/
├── animations.ts            # Animation definitions & timing
├── errorMessages.ts         # User-friendly error messages
├── personality.ts           # AI persona trait definitions
└── zIndex.ts               # Layering management

constants.ts                 # Global application constants
```

#### **Styling & Theming**

```
styles/
├── globals.css              # Global CSS variables & base styles
└── loading-animations.css   # Loading animation styles

tailwind.config.js           # Tailwind CSS configuration
postcss.config.js            # PostCSS processing
```

#### **Type System**

```
types.ts                     # TypeScript type definitions
├── User interfaces
├── AI response types
├── Component props
└── Service interfaces
```

#### **Utilities & Performance**

```
utils/
├── envValidation.ts         # Environment variable validation
└── performance.ts           # Performance monitoring utilities
```

### 5. 📚 Documentation & Testing Layer

#### **Testing Infrastructure**

```
__tests__/
├── components/              # Component tests
│   └── ErrorBoundary.test.tsx
├── hooks/                   # Hook tests
├── services/                # Service tests
│   └── geminiService.test.ts
└── jest.config.js           # Jest configuration
    jest.setup.js            # Test setup
```

#### **Documentation Structure**

```
docs/
├── analysis-results/        # Performance & analysis reports
├── fixes/                   # Bug fix documentation
├── logs/                    # Development logs
├── plans/                   # Feature planning documents
└── releases/                # Release notes
```

## 🔄 Data Flow Architecture

### **User Journey Flow**

```
1. App Initialization → InitialLoadingScreen
2. Landing → HeroScreen
3. Authentication → LoginScreen
4. Setup → SetupScreen/GuidedSetup
5. Instructions → InstructionsScreen
6. Main Experience → InteractionScreen
7. Analysis → AnalysisScreen
```

### **AI Conversation Flow**

```
User Input → Chat Interface → promptService → Gemini AI → Response Processing
                                    ↓
                            Visual Generation → Imagen AI → Image Display
                                    ↓
                            State Update → Chat History → UI Update
```

### **State Management Flow**

```
AuthContext → User Authentication State
    ↓
useChatHistory → Conversation State
    ↓
useAILoadingMessages → AI Response States
    ↓
Component Rendering → UI Updates
```

## 🎨 Design System & UI Patterns

### **Animation System**

- **Framer Motion**: Primary animation library for React components
- **Custom CSS**: Loading animations and specialized effects
- **Spring Physics**: Natural, responsive animations
- **Performance**: Optimized animations with proper cleanup

### **Responsive Design**

- **Mobile-First**: Optimized for mobile devices
- **Desktop Enhancement**: Enhanced features for larger screens
- **Accessibility**: WCAG compliance with keyboard navigation
- **Cross-Platform**: Consistent experience across devices

### **Component Patterns**

- **Composition**: Reusable component composition
- **Props Interface**: Strong TypeScript typing
- **Error Boundaries**: Graceful error handling
- **Loading States**: Consistent loading patterns

## 🚀 Development Workflow

### **Scripts & Commands**

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server (port 8080)
npm run lint         # Code linting
npm test             # Run tests
npm run test:watch   # Watch mode testing
npm run test:coverage # Coverage reporting
```

### **Code Quality**

- **ESLint**: Code style enforcement
- **TypeScript**: Type safety and IntelliSense
- **Prettier**: Code formatting (user preference: disabled)
- **Jest**: Comprehensive testing framework

## 🔗 Key Dependencies & Technologies

### **Core Framework**

- **Next.js 14**: React framework with SSR/SSG
- **React 18**: UI library with concurrent features
- **TypeScript 5.5**: Type-safe JavaScript

### **AI & External Services**

- **Google Gemini**: Advanced text generation
- **Google Imagen**: AI image generation
- **UUID**: Unique identifier generation

### **UI & Animation**

- **Framer Motion**: React animation library
- **Tailwind CSS**: Utility-first CSS framework
- **HTML2Canvas**: Screenshot capabilities
- **jsPDF**: PDF generation

### **Development Tools**

- **Jest**: Testing framework
- **React Testing Library**: Component testing
- **ESLint**: Code quality
- **PostCSS**: CSS processing

## 📊 Performance & Monitoring

### **Performance Features**

- **Custom Monitoring**: Performance utilities in `utils/performance.ts`
- **Optimized Animations**: Efficient animation rendering
- **Lazy Loading**: Component and image lazy loading
- **Error Boundaries**: Graceful error handling

### **Monitoring Areas**

- **AI Response Times**: Gemini and Imagen performance
- **Animation Performance**: Framer Motion optimization
- **User Experience**: Loading states and transitions
- **Error Tracking**: Comprehensive error logging

## 🔮 Future Architecture Considerations

### **Scalability**

- **Microservices**: Potential service separation
- **Caching**: Enhanced response caching
- **CDN**: Static asset optimization

### **AI Enhancement**

- **Model Fine-tuning**: Custom AI model training
- **Multi-modal**: Enhanced visual and audio AI
- **Personalization**: User-specific AI adaptation

### **Performance**

- **Bundle Optimization**: Code splitting and tree shaking
- **Image Optimization**: Advanced image processing
- **Caching Strategy**: Intelligent data caching

---

## 📝 Quick Reference

### **Key Files to Know**

- `pages/_app.tsx` - Application entry point
- `components/InteractionScreen.tsx` - Main conversation interface
- `services/promptService.ts` - AI prompt management
- `contexts/AuthContext.tsx` - Authentication state
- `types.ts` - Type definitions

### **Development Commands**

- `npm run dev` - Start development
- `npm test` - Run tests
- `npm run lint` - Check code quality

### **Architecture Principles**

- **Component Composition**: Reusable, composable components
- **Type Safety**: Strong TypeScript typing throughout
- **Performance First**: Optimized animations and loading
- **Accessibility**: WCAG compliant design
- **Error Resilience**: Comprehensive error handling

---

_This scaffold provides a comprehensive overview of the SosheIQ codebase structure, relationships, and architecture patterns. Use this as a reference for understanding the codebase organization and making architectural decisions._
