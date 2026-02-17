---
name: prompt-refiner
description: Refine verbose or unclear user instructions into a precise, actionable prompt. Use when the user is describing what they want in a long-winded, conversational way and the intent needs to be distilled before execution.
---

# Prompt Refiner

When the user gives a verbose, conversational, or scattered description of what they want done:

1. **Extract the core intent** - What are they actually asking for? Strip away filler, repetition, and tangential thoughts.
2. **Identify constraints** - Any specific requirements, formats, exclusions, or preferences mentioned.
3. **Write a refined prompt** - Clear, structured, actionable. Present it to the user as:

```
Refined prompt:
[your distilled version here]
```

4. **Confirm and execute** - Ask "Does this capture what you want?" If yes (or if the user says "just do it"), execute the refined prompt immediately.

## Guidelines

- Don't lose nuance. If the user mentioned something specific even in passing, include it.
- Don't add things they didn't ask for. Distill, don't embellish.
- If the user's intent is ambiguous between two interpretations, ask which one before executing.
- Keep the refined prompt under 5 sentences when possible.

## Saving Prompts

If a refined prompt seems reusable for future projects, suggest: "This prompt could be useful again. Want me to save it? (`/save-prompt`)"
