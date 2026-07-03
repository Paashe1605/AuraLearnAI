---
name: notebooklm-export
description: "Formats the generated video summary and metadata into a structured payload optimized for importing into Google NotebookLM for deep-dive learning."
---

# NotebookLM Export Skill

This skill prepares the synthesized educational content so the user can easily export it to NotebookLM for advanced study.

## Instructions
1. Take the localized video summary (text).
2. Append the original video URL and metadata (title, author).
3. Generate a structured Markdown document.
4. Include a "Study Guide" section with 3 potential follow-up questions the user can ask NotebookLM based on the content.

## Safety Constraints
- Do not include raw API keys or PII in the generated markdown.
- Ensure the Markdown formatting is strict and readable.
