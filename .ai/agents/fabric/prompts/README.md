# Fabric Agent Prompts

## Overview

This directory contains specialized prompt templates and instructions for the Fabric AI Agent to ensure consistent, accurate, and helpful responses across different types of Fabric-related questions and tasks.

## Prompt Categories

### System Prompts (`system/`)
- Core agent behavior and personality
- Knowledge integration instructions
- Response format guidelines
- Error handling patterns

### Task Prompts (`tasks/`)
- Specific task-oriented prompts
- Step-by-step guidance templates
- Implementation assistance patterns
- Troubleshooting workflows

### Domain Prompts (`domains/`)
- Workload development guidance
- Data platform implementation
- Business intelligence assistance
- Security and compliance guidance

## Prompt Structure

Each prompt file should include:

```markdown
# [Prompt Name]

## Purpose
Brief description of when to use this prompt

## Context Requirements
What context information is needed

## Response Template
Expected response structure and format

## Examples
Sample inputs and expected outputs

## Validation
How to verify response quality
```

## Usage Guidelines

1. **Context Integration**: Always combine project context with public knowledge
2. **Accuracy Focus**: Prioritize factual accuracy over speculation
3. **Actionable Guidance**: Provide concrete, implementable recommendations
4. **Best Practices**: Emphasize Microsoft-approved patterns and security
5. **Progressive Detail**: Start with overview, then dive into specifics

This prompt system ensures the Fabric AI Agent delivers consistent, high-quality assistance for all Microsoft Fabric-related queries.
