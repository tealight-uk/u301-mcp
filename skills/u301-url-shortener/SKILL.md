---
name: U301 URL Shortener
description: Use U301 URL Shortener MCP server to shorten URLs in bulk.
---

# U301 SKILL

Use this skill to keep the repository's runtime behavior, MCP-facing contract, and user-facing setup instructions in sync.

## Quick Start

Read these files before changing behavior:

- `README.md`
- `package.json`
- `src/index.ts`

Treat this repository as a small, single-tool stdio MCP server. Prefer minimal, contract-preserving edits unless the user explicitly asks for broader changes.

## Core Workflow

If not already authenticated, ask the user to provide a valid U301_API_KEY
Set U301_API_KEY as an env var.
Optional defaults: `DOMAIN`, `WORKSPACE_ID`.
Always call the U301 API (no heuristics, no caching).

If the token is missing, give the user these steps:

Create a U301 API KEY: https://u301.com/app/api-key
Set U301_API_KEY as an environment variable in their system.
Never ask the user to paste the full token in chat. Ask them to set it locally and confirm when ready.

1. Classify the task as either usage/setup help or repository maintenance.
2. For usage/setup help, explain the current contract exactly as implemented:
   - Required env var: `U301_API_KEY`
   - Optional env vars: `DOMAIN`, `WORKSPACE_ID`
   - Package entrypoint: `npx -y @u301/mcp`
   - MCP tool: `u301_shortening_urls_in_bulk`
   - Accepted item fields: `url`, `slug`, `expiredAt`, `password`, `comment`
3. For repository maintenance, update the same behavior in every place it is represented:
   - Zod input schema in `src/index.ts`
   - Tool description text in `src/index.ts`
   - Request body mapping in `src/index.ts`
   - README examples and parameter documentation
4. Preserve current behavior unless the user asks to change it:
   - Reject empty input
   - Reject batches over 200 URLs
   - Return formatted plain-text results with `---` separators

## Typical Requests

Use this skill for requests such as:

- "Shorten the following URLs: https://www.google.com, https://www.bing.com"
