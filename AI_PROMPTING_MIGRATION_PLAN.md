# AI Prompting Compartmentalization Migration Plan

---

## Overview

This document outlines a **step-by-step migration plan** to compartmentalize AI prompting logic in the SosheIQ codebase. It is designed for both human and LLM readers, with checklists, progress markers, and note sections for easy handoff and tracking.

---

## Table of Contents

1. [Preparation & Audit](#phase-1-preparation--audit)
2. [Abstraction Layer Creation](#phase-2-abstraction-layer-creation)
3. [Incremental Refactor](#phase-3-incremental-refactor)
4. [Optimization & Polish](#phase-4-optimization--polish)
5. [Cleanup & Finalization](#phase-5-cleanup--finalization)
6. [Progress & Notes](#progress--notes)

---

## Phase 1: Preparation & Audit

- [ ] **1.1 Audit Current Prompting Logic**

  - Identify all locations (components, hooks, services) where AI prompts are constructed, sent, or handled.
  - List all API endpoints/routes involved in AI prompting.
  - ## _Notes:_

- [x] **1.2 Define Prompt/Response Types**

  - Types like `ScenarioDetails`, `ChatMessage`, `StartConversationResponse`, and `AiTurnResponse` already exist in `types.ts`.
  - **Action:** Types have been reviewed and are comprehensive. No major changes needed. Minor improvements (stricter required fields, runtime validation, JSDoc) are optional for future polish.
  - _Notes:_
    - Types are modern, extensible, and match prompt/response schemas.
    - Proceeding to add tests for prompt construction and response parsing.

- [ ] **1.3 Write Tests for Existing Logic**
  - Add/verify unit and integration tests for current prompt logic to ensure baseline behavior is captured.
  - **Action:**
    - Plan to create `__tests__/services` and `__tests__/hooks` directories for new tests.
    - Next: Add unit tests for prompt construction (template string output) and response parsing (valid/invalid JSON, required fields).
  - _Notes:_
    - No existing service/hook test directories found; will create them as part of this step.

---

## Phase 2: Abstraction Layer Creation

- [x] **2.1 Create Prompt Service Module**

  - File: `/services/promptService.ts`
  - Implement functions for:
    - Building prompts (template functions, etc.)
    - Sending prompts (API calls)
    - Handling responses (parsing, error handling)
  - Use TypeScript types for all inputs/outputs.
  - _Notes:_
    - All prompt construction logic is now handled by promptService.ts. Migration is functionally complete.

- [ ] **2.2 Create Custom Hook**

  - File: `/hooks/useAIPrompt.ts`
  - Create a hook that:
    - Accepts prompt parameters
    - Manages loading, error, and response state
    - Uses the service module internally
  - ## _Notes:_

- [ ] **2.3 (Optional) Create Context Provider**
  - File: `/providers/PromptProvider.tsx`
  - If prompt state/history needs to be global, implement a React Context provider.
  - ## _Notes:_

---

## Phase 3: Incremental Refactor

- [x] **3.1 Refactor Components to Use New Abstractions**

  - Update components (e.g., `ChatMessageView.tsx`, `AnalysisScreen.tsx`) to use the new hook/service instead of inline prompt logic.
  - Remove old, duplicated prompt logic from components.
  - _Notes:_
    - geminiService.ts now uses promptService.ts for all prompt construction.

- [ ] **3.2 Update API Route Usage**

  - Ensure all API calls for prompting now go through the service layer.
  - Update any backend logic if prompt structure changes (coordinate with backend if needed).
  - _Notes:_
    - All prompt construction is now centralized and API usage is unchanged.

- [ ] **3.3 Update Tests**
  - Refactor or add tests for the new service, hook, and any affected components.
  - Ensure all tests pass after each incremental change.
  - ## _Notes:_

---

## Phase 4: Optimization & Polish

- [ ] **4.1 Performance Optimization**

  - Memoize prompt builders with `useMemo` where appropriate.
  - Add caching, debouncing, or batching if needed (consider SWR/React Query for network-bound prompts).
  - ## _Notes:_

- [ ] **4.2 Documentation**

  - Document the new prompt service, hook, and context.
  - Update onboarding docs for future contributors.
  - ## _Notes:_

- [ ] **4.3 Code Review & QA**
  - Conduct thorough code review.
  - Test all user flows involving AI prompting.
  - Ensure no regressions or broken routes.
  - ## _Notes:_

---

## Phase 5: Cleanup & Finalization

- [ ] **5.1 Remove Legacy Code**

  - Delete any unused prompt logic or types from components/services.
  - ## _Notes:_

- [ ] **5.2 Final Regression Testing**

  - Run full test suite and manual QA on all affected features.
  - ## _Notes:_

- [ ] **5.3 Deploy & Monitor**
  - Deploy to staging, monitor for issues, then release to production.
  - ## _Notes:_

---

## Progress & Notes

- Use the checkboxes above to track progress.
- Add notes under each step as needed.
- For LLMs: Always update this file with your progress and findings before pausing work.

---

**End of Plan**
