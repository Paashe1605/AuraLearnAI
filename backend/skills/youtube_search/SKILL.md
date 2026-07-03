---
name: youtube-search
description: "Search YouTube for educational videos on a given topic, returning video IDs, titles, and metadata."
---

# YouTube Search Skill

This skill allows the agent to query the YouTube Data API for educational content.

## Instructions
1. Extract the user's query topic and target language.
2. Formulate a search query optimized for educational videos (e.g., adding keywords like "tutorial", "explained", "in [language]").
3. Call the configured YouTube MCP server or API client with this query.
4. Return the top 3 highly relevant video URLs and metadata.

## Safety Constraints
- Filter out entertainment or non-educational content by prioritizing educational channels or using strict keyword matching.
- Avoid results with clickbait titles by evaluating the title text against the core concept.
