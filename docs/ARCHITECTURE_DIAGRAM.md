# SosheIQ Architecture Diagram

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SOSHEIQ APPLICATION                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────┐ │
│  │   USER INTERFACE │    │   AI SERVICES   │    │     DATA & STATE        │ │
│  │                 │    │                 │    │                         │ │
│  │ • React Components│◄──►│ • Gemini AI     │◄──►│ • AuthContext          │ │
│  │ • Framer Motion │    │ • Imagen AI     │    │ • Chat History          │ │
│  │ • Tailwind CSS  │    │ • Prompt Service│    │ • Session Storage      │ │
│  │ • Responsive    │    │ • Auth Service  │    │ • Local State          │ │
│  └─────────────────┘    └─────────────────┘    └─────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Architecture

### **User Journey Flow**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ InitialLoading  │───►│   HeroScreen    │───►│  LoginScreen   │
│     Screen      │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ AnalysisScreen  │◄───│InteractionScreen│◄───│ SetupScreen    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **AI Conversation Flow**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │───►│   Chat      │───►│  Prompt     │───►│   Gemini    │
│   Input     │    │ Interface   │    │ Service     │    │     AI      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                        │
                                                        ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Visual    │◄───│   Image     │◄───│  Imagen    │◄───│   AI        │
│  Display    │    │ Processing  │    │    AI      │    │ Response    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## 🧩 Component Hierarchy

### **Main Application Structure**

```
_app.tsx (Root)
├── AnimationProvider
├── AuthContext
└── Main Content
    ├── Header
    ├── Page Content (Dynamic)
    │   ├── InitialLoadingScreen
    │   ├── HeroScreen
    │   ├── LoginScreen
    │   ├── SetupScreen
    │   ├── InstructionsScreen
    │   ├── InteractionScreen
    │   └── AnalysisScreen
    └── Footer
```

### **InteractionScreen Component Tree**

```
InteractionScreen
├── TopBannerContainer
├── AIVisualCue
├── RenderChatInterface
│   ├── ChatMessageView (User messages)
│   ├── ChatMessageViewAI (AI responses)
│   └── ChatMessageViewAIThinking (Loading)
├── ProgressBar
└── Menu/Controls
```

### **Chat Message Rendering**

```
ChatMessageViewAI
├── Dialogue Chunks (Speech bubbles)
├── Action Chunks (Italic, centered)
└── Animation Sequences
    ├── Typewriter effect
    ├── Fade-in animations
    └── Spring-based transitions
```

## 🔧 Service Layer Architecture

### **Service Dependencies**

```
┌─────────────────┐
│   promptService │
│                 │
│ • buildStart    │
│ • buildNext     │
│ • Dialogue      │
│   chunking      │
└─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐
│ geminiService   │    │ imagenService   │
│                 │    │                 │
│ • Text          │    │ • Image         │
│ • Generation    │    │ • Generation    │
│ • API Calls     │    │ • Processing    │
└─────────────────┘    └─────────────────┘
```

### **Authentication Flow**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   LoginScreen   │───►│  authService    │───►│  AuthContext   │
│                 │    │                 │    │                 │
│ • User Input    │    │ • Validation    │    │ • State        │
│ • Form Submit   │    │ • API Calls     │    │ • Persistence  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎨 UI Component Patterns

### **Component Composition Pattern**

```
Screen Component
├── Feature Components
│   ├── Business Logic
│   ├── State Management
│   └── Event Handlers
├── UI Components
│   ├── Presentation
│   ├── Styling
│   └── Accessibility
└── Base Elements
    ├── HTML Elements
    ├── CSS Classes
    └── Animations
```

### **Animation System**

```
Framer Motion
├── Component Animations
│   ├── Enter/Exit
│   ├── Hover/Click
│   └── State Changes
├── Page Transitions
│   ├── Route Changes
│   ├── Screen Switches
│   └── Loading States
└── Custom Animations
    ├── Spring Physics
    ├── Easing Functions
    └── Performance Optimization
```

## 📱 Responsive Design Architecture

### **Breakpoint Strategy**

```
Mobile First (320px+)
├── Base styles
├── Touch interactions
└── Simplified layouts

Tablet (768px+)
├── Enhanced navigation
├── Side-by-side layouts
└── Hover states

Desktop (1024px+)
├── Full navigation
├── Multi-column layouts
└── Advanced interactions
```

### **Component Responsiveness**

```
Responsive Component
├── Mobile Layout
│   ├── Stacked elements
│   ├── Touch-friendly
│   └── Simplified navigation
├── Tablet Layout
│   ├── Side-by-side
│   ├── Enhanced spacing
│   └── Medium complexity
└── Desktop Layout
    ├── Multi-column
    ├── Hover effects
    └── Full feature set
```

## 🧪 Testing Architecture

### **Test Structure**

```
__tests__/
├── components/
│   ├── Unit tests
│   ├── Integration tests
│   └── Snapshot tests
├── hooks/
│   ├── Hook behavior
│   ├── State changes
│   └── Side effects
├── services/
│   ├── API calls
│   ├── Data processing
│   └── Error handling
└── E2E (Future)
    ├── User journeys
    ├── Cross-browser
    └── Performance
```

## 🚀 Performance Architecture

### **Optimization Layers**

```
Performance Optimization
├── Bundle Optimization
│   ├── Code splitting
│   ├── Tree shaking
│   └── Lazy loading
├── Runtime Optimization
│   ├── Memoization
│   ├── Debouncing
│   └── Efficient re-renders
├── Asset Optimization
│   ├── Image compression
│   ├── Font loading
│   └── CDN delivery
└── Monitoring
    ├── Performance metrics
    ├── Error tracking
    └── User analytics
```

## 🔮 Future Architecture Considerations

### **Scalability Path**

```
Current Architecture
├── Monolithic Next.js app
├── Single AI service
└── Local state management

Future Considerations
├── Microservices
│   ├── AI service separation
│   ├── User management
│   └── Analytics service
├── Advanced Caching
│   ├── Redis for sessions
│   ├── CDN for assets
│   └── API response caching
└── Real-time Features
    ├── WebSocket support
    ├── Live collaboration
    └── Push notifications
```

---

## 📊 Architecture Metrics

### **Current State**

- **Components**: 30+ React components
- **Services**: 4 core services
- **Hooks**: 5 custom hooks
- **Test Coverage**: Jest + React Testing Library
- **Performance**: Framer Motion + Custom optimizations

### **Target Metrics**

- **Bundle Size**: < 500KB (gzipped)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Test Coverage**: > 80%
- **Accessibility Score**: 100%

---

_This diagram provides a visual representation of the SosheIQ architecture, showing component relationships, data flow, and system design patterns. Use this alongside the code structure scaffold for complete understanding._
