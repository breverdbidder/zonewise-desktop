# Progressive Disclosure for ZoneWise.AI Skills

> Based on [Cole Medin's Custom Agent with Skills](https://github.com/coleam00/custom-agent-with-skills)

## Overview

Progressive disclosure is a pattern that loads AI context on-demand rather than 
overwhelming the model with all capabilities upfront. This dramatically reduces 
context window usage while maintaining agent flexibility.

## Three-Layer Architecture

```
┌────────────────────────────────────────────────────────┐
│                    SYSTEM PROMPT                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Layer 1: Skill Descriptions (~100 tokens each)  │   │
│  │ • zoning-analysis: Analyze zoning codes...      │   │
│  │ • envelope-development: Generate 3D envelopes...│   │
│  │ • sun-analysis: Calculate sun position...       │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
                         │
                         ▼ load_skill("envelope-development")
┌────────────────────────────────────────────────────────┐
│  Layer 2: Full SKILL.md (~500-2000 tokens)             │
│  • Detailed instructions                               │
│  • Code examples                                       │
│  • Best practices                                      │
└────────────────────────────────────────────────────────┘
                         │
                         ▼ read_reference("envelope-algorithm.md")
┌────────────────────────────────────────────────────────┐
│  Layer 3: Reference Documents (~1000-5000 tokens)      │
│  • API documentation                                   │
│  • Algorithm details                                   │
│  • Schema definitions                                  │
└────────────────────────────────────────────────────────┘
```

## Token Efficiency

| Layer | Content | Tokens/Skill | When Loaded |
|-------|---------|--------------|-------------|
| 1 | Description | ~100 | Always (system prompt) |
| 2 | Full SKILL.md | ~1000 | On-demand (`load_skill`) |
| 3 | References | ~2000 | On-demand (`read_reference`) |

With 10 skills:
- **Traditional approach**: 31,000 tokens upfront
- **Progressive disclosure**: 1,000 tokens upfront + on-demand

That's a **97% reduction** in baseline context usage!

## Implementation

### TypeScript (Frontend)

```typescript
import { SkillLoader, createSkillLoaderHook } from '@/lib/skill-loader';

// Initialize
const loader = new SkillLoader('/zonewise/skills');
await loader.initialize();

// Level 1: Get descriptions for system prompt
const descriptions = loader.getSkillDescriptions();

// Level 2: Load full skill when needed
const skill = await loader.loadSkill('envelope-development');

// Level 3: Load reference when skill references it
const ref = await loader.loadReference('envelope-development', 'envelope-algorithm.md');
```

### Python (Backend Agent)

```python
from zonewise_agent import create_agent, AgentDependencies

# Create agent with progressive disclosure
agent = create_agent()
deps = AgentDependencies(skills_path="./zonewise/skills")

# Run - agent loads skills on-demand
result = await agent.run("Generate envelope for RS-10 zoning", deps=deps)
```

## Skill Structure

```
zonewise/skills/
├── skills-manifest.yaml      # All skill metadata (Layer 1)
├── zoning-analysis/
│   ├── SKILL.md              # Full instructions (Layer 2)
│   └── references/           # Deep context (Layer 3)
│       ├── malabar-zoning.md
│       └── brevard-codes.md
├── envelope-development/
│   ├── SKILL.md
│   └── references/
│       └── envelope-algorithm.md
└── sun-analysis/
    ├── SKILL.md
    └── references/
        ├── suncalc-api.md
        └── shadow-algorithm.md
```

## SKILL.md Format

```markdown
---
name: skill-name
version: 1.0.0
category: zoning|visualization|analysis|data
priority: 1
description: |
  Brief description for Layer 1 system prompt injection.

references:
  - api_reference.md
  - examples.md
---

# Skill Name

## When to Use This Skill

Load this skill when the user asks about:
- Topic A
- Topic B

## Core Functions

### Function 1
...

## References

For detailed API docs, load:
- `api_reference.md` - API documentation
```

## Two Core Tools

### load_skill

```typescript
const LOAD_SKILL_TOOL = {
  name: 'load_skill',
  description: `Load full instructions for a skill. Call ONLY when you need 
    to use a specific skill's capabilities.`,
  parameters: {
    skill_name: { type: 'string', description: 'Name of the skill to load' }
  }
};
```

### read_reference

```typescript
const READ_REFERENCE_TOOL = {
  name: 'read_reference',
  description: `Load a reference document from a skill. Only call if the skill 
    instructions explicitly mention a reference you need.`,
  parameters: {
    skill_name: { type: 'string', description: 'Skill that owns the reference' },
    reference_name: { type: 'string', description: 'Reference file name' }
  }
};
```

## Benefits

1. **Efficient Context Usage**: Only load what you need
2. **Scalable**: Support dozens of skills without degradation
3. **Modular**: Add new skills without code changes
4. **Framework Agnostic**: Works with any LLM
5. **Production Ready**: Includes caching and error handling

## References

- [Cole Medin's Video](https://www.youtube.com/watch?v=-iTNOaCmLcw)
- [GitHub Template](https://github.com/coleam00/custom-agent-with-skills)
- [Pydantic AI Skills](https://github.com/DougTrajano/pydantic-ai-skills)
