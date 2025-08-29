# AI Prompts Used in Development

Documentation of prompts and techniques used to build the Sprint Board Lite application.

## Initial Project Setup

### Architecture Planning
```
I need to build a Sprint Board application with Next.js 15 App Router, TypeScript, and Tailwind. 
The board should have 3 columns (Todo, In Progress, Done) with drag-and-drop functionality.

Requirements:
- Mock authentication with localStorage
- Optimistic updates with rollback on API failure
- Search and filter capabilities
- Dark mode support
- Mobile-first responsive design

What's the best architecture and folder structure for this project?
```

### Type Definitions
```
Given a task management system with the following requirements:
- Tasks have: id, title, description, status (todo/in-progress/done), priority (low/medium/high), timestamps
- Need optimistic updates with rollback capability
- Must handle API failures gracefully

Generate TypeScript interfaces and types that ensure type safety and support optimistic update patterns.
```

## Authentication System

### Mock Auth Implementation
```
Create a mock authentication system for Next.js 15 that:
- Accepts any non-empty email/password
- Stores a fake JWT token in localStorage
- Provides auth context using React Context API
- Guards the /board route
- Handles logout by clearing the token

This should work without a real backend but be structured for easy replacement later.
```

## Drag and Drop Implementation

### Library Comparison
```
I need drag-and-drop between 3 columns for a kanban board. Should I use:
1. Native HTML5 drag-and-drop API
2. @dnd-kit library
3. react-beautiful-dnd

Consider mobile support, smooth animations, accessibility, TypeScript support, and bundle size.
Provide implementation for the recommended choice with proper event handlers.
```

### Performance Optimization
```
My drag-and-drop is working but feels janky. How can I optimize it?

Issues:
- Lag when dragging
- No visual feedback during drag
- Sudden jumps instead of smooth transitions

Improve this with CSS transforms, proper drag ghost/preview, and smooth animations on drop.
```

## Optimistic Updates & Error Handling

### Optimistic Update Pattern
```
Implement an optimistic update system that:
1. Updates UI immediately when user moves a task
2. Makes API call in background
3. Shows success feedback if API succeeds
4. Automatically rolls back if API fails (simulate 10% failure rate)
5. Shows error toast with "retry" option
6. Maintains a history for "undo" functionality

Include proper error boundaries and fallback UI.
```

### Undo System
```
Add an "undo" feature that:
- Shows a 5-second toast after any task movement
- Allows reverting the last action
- Updates both UI and server state
- Handles rapid successive undos correctly
- Clears undo option after timeout or new action
```

## Search and Filter

### Client-Side Search Implementation
```
Implement search and filter that:
- Searches task titles in real-time
- Filters by priority (low/medium/high)
- Combines search and filter
- Debounces search input (300ms)
- Highlights matching text
- Shows "no results" state
- Maintains good performance with 100+ tasks
```

## UI/UX Polish

### Dark Mode Implementation
```
Add a persistent dark mode that:
- Toggles with a button in the header
- Saves preference to localStorage
- Applies immediately without flash
- Uses Tailwind's dark: modifier
- Has smooth transitions between modes
- Respects system preference initially
```

### Mobile Responsiveness
```
Make the kanban board mobile-friendly:
- Stack columns vertically on small screens
- Make cards touch-friendly (min 44px tap targets)
- Ensure modals work on mobile
- Test drag-and-drop on touch devices
- Optimize for thumb-reachable zones
```

### Keyboard Navigation
```
Add keyboard navigation where:
- Tab focuses on cards
- [ key moves focused card left
- ] key moves focused card right  
- Enter opens card details
- Escape closes modals
- Visual focus indicators are clear
```

## Performance Optimization

### React Performance Analysis
```
Profile and optimize React performance:
- Identify unnecessary re-renders in the task board
- Implement React.memo where beneficial
- Use useCallback and useMemo appropriately
- Optimize list rendering with keys

Current performance issues:
- Search causes all cards to re-render
- Drag-drop triggers full board re-render
- Modal mount is slow
```

## Testing Strategy

### Test Coverage Plan
```
Create a testing strategy covering:
1. Unit tests for utility functions
2. Component tests for TaskCard, Column
3. Integration tests for drag-drop flow
4. E2E tests for full user journey
5. API failure scenarios

Focus on critical paths:
- Login flow
- Creating a task
- Moving task between columns
- Search and filter
- Undo functionality
```

## Deployment Preparation

### Production Checklist
```
Prepare the app for production deployment on Vercel:
- Environment variable setup
- Build optimization
- Error tracking setup
- Performance monitoring
- SEO meta tags
- Security headers

Generate:
1. vercel.json configuration
2. next.config.js optimizations
3. Environment variable schema
```

## Development Notes

The AI assistance was most helpful for:
- Generating boilerplate code and TypeScript interfaces
- Suggesting performance optimization patterns
- Catching edge cases in error handling
- Providing accessibility considerations

Areas that required manual refinement:
- UX decisions and visual design
- Project architecture choices
- Mobile touch event handling
- Complex state management patterns