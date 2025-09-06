# SosheIQ Quick Reference Guide

## 🚀 Quick Start Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server (port 8080)
npm test             # Run all tests
npm run lint         # Check code quality
```

## 📁 Essential File Locations

### **Core Application Files**

- `pages/_app.tsx` - Main application wrapper
- `pages/index.tsx` - Landing page entry point
- `components/InteractionScreen.tsx` - Main conversation interface
- `contexts/AuthContext.tsx` - Authentication state management

### **AI & Services**

- `services/promptService.ts` - AI prompt construction & dialogue chunking
- `services/geminiService.ts` - Google Gemini AI integration
- `services/imagenService.ts` - Google Imagen AI integration
- `services/authService.ts` - Authentication service

### **Key Components**

- `components/HeroScreen.tsx` - Landing page
- `components/LoginScreen.tsx` - Authentication
- `components/SetupScreen.tsx` - User configuration
- `components/ChatMessageViewAI.tsx` - AI response rendering

### **Configuration & Types**

- `types.ts` - TypeScript type definitions
- `constants/personality.ts` - AI persona traits
- `constants/animations.ts` - Animation definitions
- `tailwind.config.js` - Styling configuration

## 🏗️ Architecture Patterns

### **Component Structure**

```typescript
// Screen Component Pattern
const ScreenComponent = () => {
	// 1. Hooks & State
	const [state, setState] = useState();

	// 2. Event Handlers
	const handleAction = () => {};

	// 3. Render UI
	return (
		<div>
			<FeatureComponent />
			<UIComponent />
		</div>
	);
};
```

### **Service Pattern**

```typescript
// Service Pattern
class ServiceName {
	async methodName(params: Type): Promise<Result> {
		try {
			// Implementation
			return result;
		} catch (error) {
			throw new Error(`Service error: ${error.message}`);
		}
	}
}
```

### **Hook Pattern**

```typescript
// Custom Hook Pattern
const useCustomHook = (dependencies: Dependencies) => {
	const [state, setState] = useState();

	useEffect(() => {
		// Side effects
	}, [dependencies]);

	return { state, setState };
};
```

## 🔄 Data Flow Patterns

### **State Management Flow**

```
User Action → Component → Hook → Context → Service → API → Response → UI Update
```

### **AI Response Flow**

```
User Input → promptService → geminiService → AI Response → UI Rendering
                                    ↓
                            imagenService → Visual Feedback
```

### **Authentication Flow**

```
Login → authService → AuthContext → Persistent Storage → App State
```

## 🎨 UI Component Patterns

### **Responsive Design**

```typescript
// Mobile-first responsive pattern
<div className="
  w-full                    // Mobile: full width
  md:w-1/2                 // Tablet: half width
  lg:w-1/3                 // Desktop: third width
">
```

### **Animation Integration**

```typescript
// Framer Motion pattern
import { motion } from "framer-motion";

<motion.div
	initial={{ opacity: 0 }}
	animate={{ opacity: 1 }}
	transition={{ duration: 0.5 }}>
	Content
</motion.div>;
```

### **Loading States**

```typescript
// Loading state pattern
{
	isLoading ? <LoadingComponent /> : <MainContent />;
}
```

## 🤖 AI Integration Patterns

### **Prompt Construction**

```typescript
// Prompt service usage
const prompt = buildNextAITurnPrompt({
	persona: currentPersona,
	conversationHistory: chatHistory,
	userInput: userMessage,
});
```

### **Response Processing**

```typescript
// AI response handling
const response = await geminiService.generateResponse(prompt);
const processedResponse = processAIResponse(response);
```

### **Dialogue Chunking**

```typescript
// Dialogue chunk structure
interface DialogueChunk {
	text: string;
	type: "dialogue" | "action";
	delayAfter?: boolean;
}
```

## 🧪 Testing Patterns

### **Component Testing**

```typescript
// Component test pattern
import { render, screen } from "@testing-library/react";

test("component renders correctly", () => {
	render(<Component />);
	expect(screen.getByText("Expected Text")).toBeInTheDocument();
});
```

### **Hook Testing**

```typescript
// Hook test pattern
import { renderHook } from "@testing-library/react";

test("hook returns expected value", () => {
	const { result } = renderHook(() => useCustomHook());
	expect(result.current.value).toBe(expectedValue);
});
```

### **Service Testing**

```typescript
// Service test pattern
test("service method handles errors", async () => {
	await expect(service.method()).rejects.toThrow("Expected error");
});
```

## 🔧 Development Workflow

### **Code Quality Checklist**

- [ ] TypeScript types are properly defined
- [ ] Components follow composition pattern
- [ ] Error boundaries are implemented
- [ ] Loading states are handled
- [ ] Responsive design is implemented
- [ ] Accessibility features are included
- [ ] Tests are written and passing

### **Performance Checklist**

- [ ] Animations are optimized
- [ ] Images are properly sized
- [ ] Bundle size is monitored
- [ ] Lazy loading is implemented
- [ ] Memoization is used where appropriate

### **Accessibility Checklist**

- [ ] Keyboard navigation works
- [ ] Screen reader support
- [ ] Color contrast is sufficient
- [ ] Focus indicators are visible
- [ ] ARIA labels are implemented

## 📱 Responsive Breakpoints

### **Tailwind CSS Breakpoints**

```css
/* Mobile First */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

### **Component Responsiveness**

- **Mobile (320px+)**: Stacked layout, touch-friendly
- **Tablet (768px+)**: Side-by-side, enhanced spacing
- **Desktop (1024px+)**: Multi-column, hover effects

## 🎭 Animation Guidelines

### **Framer Motion Best Practices**

- Use `initial`, `animate`, and `exit` props
- Implement proper cleanup in `useEffect`
- Use spring animations for natural feel
- Optimize performance with `layout` prop

### **Animation Timing**

- **Quick**: 0.2s for micro-interactions
- **Normal**: 0.3-0.4s for standard transitions
- **Slow**: 1s for dramatic effects

### **Performance Tips**

- Use `transform` and `opacity` for animations
- Avoid animating layout properties
- Implement proper cleanup
- Monitor animation performance

## 🚨 Error Handling Patterns

### **Error Boundary Implementation**

```typescript
// Error boundary pattern
class ErrorBoundary extends React.Component {
	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Log error and show fallback UI
	}

	render() {
		if (this.state.hasError) {
			return <ErrorFallback />;
		}
		return this.props.children;
	}
}
```

### **Service Error Handling**

```typescript
// Service error pattern
try {
	const result = await apiCall();
	return result;
} catch (error) {
	console.error("Service error:", error);
	throw new Error("User-friendly error message");
}
```

## 🔐 Authentication Patterns

### **Auth State Management**

```typescript
// Auth context usage
const { user, login, logout, isLoading } = useAuth();

// Check authentication status
if (isLoading) return <LoadingSpinner />;
if (!user) return <LoginScreen />;
```

### **Protected Routes**

```typescript
// Route protection pattern
const ProtectedComponent = () => {
	const { user } = useAuth();

	if (!user) {
		return <Navigate to="/login" />;
	}

	return <ProtectedContent />;
};
```

## 📊 Performance Monitoring

### **Key Metrics to Track**

- **Bundle Size**: Keep under 500KB gzipped
- **First Contentful Paint**: Target < 1.5s
- **Time to Interactive**: Target < 3s
- **Animation Performance**: 60fps target
- **Memory Usage**: Monitor for leaks

### **Monitoring Tools**

- `utils/performance.ts` - Custom performance utilities
- Chrome DevTools Performance tab
- Lighthouse audits
- Bundle analyzer

## 🔮 Future Considerations

### **Scalability Planning**

- **Microservices**: Separate AI, auth, and user services
- **Caching**: Implement Redis for sessions and responses
- **CDN**: Optimize static asset delivery
- **Real-time**: Add WebSocket support for live features

### **AI Enhancement**

- **Model Fine-tuning**: Custom training for specific use cases
- **Multi-modal**: Enhanced visual and audio AI
- **Personalization**: User-specific AI adaptation
- **Offline Support**: Local AI model caching

---

## 📝 Quick Commands Reference

### **Development**

```bash
npm run dev          # Start dev server
npm run build        # Build production
npm run start        # Start production
npm run lint         # Lint code
```

### **Testing**

```bash
npm test             # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

### **Code Quality**

```bash
npm run lint         # ESLint check
npm run type-check   # TypeScript check
```

---

_This quick reference provides fast access to essential patterns, commands, and architectural information for the SosheIQ codebase. Use this alongside the detailed scaffold and architecture diagram for complete understanding._



