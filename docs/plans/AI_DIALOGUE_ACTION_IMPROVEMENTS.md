# AI Dialogue & Action Chunking Improvements

## Overview

This document outlines the comprehensive improvements made to SosheIQ's AI dialogue system to achieve more realistic, human-like conversational behavior through proper action chunking and dynamic dialogue splitting.

## Problem Statement

### Original Issues

1. **AI was typing actions directly into dialogue text** instead of using the proper action chunking system

   - Example: "Oh, a busy week, huh? Yeah, I get that. Sometimes Saturdays are just for total chill time, you know? Maybe... _I pause, looking down thoughtfully_ ...we could try a little bit of people-watching?"
   - Actions like "_I pause, looking down thoughtfully_" were embedded in dialogue text

2. **Conflicting prompt instructions** causing inconsistent behavior

   - Old "Dialogue Cadence" instruction: "Your default is a single, condensed response"
   - This contradicted the split dialogue/action guidance

3. **Limited use of action-only responses** for emotional or impactful moments
4. **Inconsistent dialogue chunking** across different scenarios

## Solution Implementation

### 1. Unified Prompt Guidance

#### Split Dialogue & Action Guidance

Added comprehensive guidance to both `buildStartConversationPrompt` and `buildNextAITurnPrompt`:

```typescript
const splitDialogueGuidance = `
- **Dialogue, Action, and Nonverbal Response Guidance:** 
  You are encouraged to use multiple dialogue and action chunks (entries) per turn when it adds to immersion and realism. 
  The dialogueChunks array can contain any mix of dialogue and action entries. 
  Do not restrict yourself to a single dialogue or action by default. 
  Dynamically decide when to use split dialogue and action, such as combining a gesture with a spoken line, or showing a sequence of actions and speech. 
  At times, respond with only an action or emotional cue (e.g., a sigh, a smile, a pause) instead of words, especially in moments of strong emotion, awkwardness, or when words are unnecessary. 
  This enhances realism and makes your responses feel more human and emotionally expressive.

  - **CRITICAL: NEVER put actions directly into dialogue text.** 
    Actions like "*pauses, looking down thoughtfully*" or "*laughs*" must be separate action chunks with type: "action", not embedded in dialogue text.

  - **Examples:**
    - [ { "text": "*She laughs, covering her mouth*", "type": "action" }, { "text": "That's hilarious!", "type": "dialogue" } ]
    - [ { "text": "*He shrugs, remaining silent for a moment*", "type": "action" } ]
    - [ { "text": "Well, I guess that's one way to look at it.", "type": "dialogue" }, { "text": "*glances away, fidgeting with her sleeve*", "type": "action" } ]

  The style and frequency of split dialogue/action and nonverbal responses should be consistent with your persona and the scenario context. 
  Use these features to create natural pacing, emotional beats, and immersive, true-to-life interactions. 
  Avoid overusing split dialogue/action in every turn—use it when it adds to immersion, not as a gimmick.
`;
```

#### Dialogue Cadence & Chunking Guidance

```typescript
const dialogueCadenceGuidance = `
- **Dialogue Cadence & Chunking:** 
  Dynamically decide the best number of dialogue and action chunks for each turn to maximize realism and immersion. 
  Use multiple chunks (dialogue and/or action) when it adds to the natural flow, emotional pacing, or expressiveness of the interaction. 
  Sometimes a single chunk is best; other times, a sequence of actions and speech, or an action-only response, is most realistic. 
  Avoid splitting every turn just for variety—let the context, emotion, and persona guide your choice.
`;
```

### 2. Removed Conflicting Instructions

**Removed from `buildNextAITurnPrompt`:**

```typescript
// REMOVED - This was causing the AI to default to single chunks
- **Dialogue Cadence**: Your default is a single, condensed response. Do not send multiple rapid-fire messages unless your persona is in a state of high emotion (e.g., extreme excitement, passion) that justifies it.
```

### 3. Enhanced Action Chunking System

The system now properly supports:

- **Multiple dialogue/action chunks per turn**
- **Action-only responses** for emotional moments
- **Proper separation** of actions from dialogue text
- **Dynamic decision-making** based on context and persona

## Technical Implementation

### Files Modified

1. `services/promptService.ts`
   - `buildStartConversationPrompt()` - Added unified guidance
   - `buildNextAITurnPrompt()` - Added unified guidance and removed conflicts

### Schema Support

The existing `dialogueChunks` array schema already supported the improvements:

```typescript
interface DialogueChunk {
	text: string;
	type: "dialogue" | "action";
	delayAfter?: boolean;
}
```

### UI Rendering

The existing `ChatMessageViewAI.tsx` component already properly renders:

- Action chunks with italic styling and centered display
- Dialogue chunks with bubble styling
- Proper animation sequencing

## Expected Behavior

### Before (Problematic)

```json
{
	"dialogueChunks": [
		{
			"text": "Oh, a busy week, huh? Yeah, I get that. Sometimes Saturdays are just for total chill time, you know? Maybe... *I pause, looking down thoughtfully* ...we could try a little bit of people-watching?",
			"type": "dialogue"
		}
	]
}
```

### After (Improved)

```json
{
	"dialogueChunks": [
		{
			"text": "Oh, a busy week, huh? Yeah, I get that. Sometimes Saturdays are just for total chill time, you know?",
			"type": "dialogue"
		},
		{
			"text": "*pauses, looking down thoughtfully*",
			"type": "action"
		},
		{
			"text": "Maybe we could try a little bit of people-watching?",
			"type": "dialogue"
		}
	]
}
```

## Testing Guidelines

### Test Scenarios

1. **Emotional Responses**

   - Test scenarios that should trigger action-only responses
   - Verify actions are properly chunked, not embedded in dialogue

2. **Split Dialogue/Action**

   - Test natural conversation flow with mixed chunks
   - Verify proper sequencing and timing

3. **Persona Consistency**

   - Test different personas to ensure appropriate chunking frequency
   - Verify personality traits influence chunking style

4. **Edge Cases**
   - Test rapid conversation turns
   - Test action-only responses
   - Test complex multi-chunk responses

### Validation Criteria

- [ ] No actions embedded in dialogue text
- [ ] Proper use of action chunks for nonverbal cues
- [ ] Dynamic chunking based on context
- [ ] Consistent persona-appropriate behavior
- [ ] Natural pacing and emotional beats

## Future Enhancements

### Potential Improvements

1. **Advanced Action Types**

   - Consider adding more specific action types (e.g., "gesture", "expression", "movement")
   - Enhanced visual feedback for different action types

2. **Contextual Chunking**

   - AI learns from conversation history to improve chunking decisions
   - Persona-specific chunking patterns

3. **Performance Optimization**
   - Monitor chunking frequency and adjust guidance if needed
   - Balance between realism and resource usage

### Monitoring

- Track chunking patterns across different scenarios
- Monitor user feedback on conversation realism
- Analyze engagement metrics related to chunking improvements

## Related Documentation

- [AI Prompting Migration Plan](./AI_PROMPTING_MIGRATION_PLAN.md)
- [Conversation Flow Architecture](../other/conversation-flow.md)
- [UI Component Documentation](../other/ui-components.md)

## Version History

- **v2.2.0** - Initial implementation of unified dialogue/action chunking guidance
- **v2.2.1** - Added CRITICAL instruction to prevent actions in dialogue text
- **v2.2.2** - Removed conflicting "single, condensed response" instruction

---

_Last Updated: January 2025_
_Maintainer: AI Development Team_
