
<img src="https://u301.com/app.svg" style="width: 40px; height: 40px;" />

# U301 URL Shortener MCP Server

[![Verified on MseeP](https://mseep.ai/badge.svg)](https://mseep.ai/app/de61379b-1f01-4f6f-8690-8456ec0e0d9b)

Use MCP Server to create short URLs.

<img width="380" height="200" src="https://glama.ai/mcp/servers/@tealight-uk/u301-mcp/badge" alt="U301 URL Shortener MCP Server" />

## Supported Params
* `url` - The URL to shorten
* `slug` - (optional) The slug of the URL
* `expiredAt` - (optional) The expiration date for the URL, for example `2026-03-13T00:00:00Z`
* `password` - (optional) The password to access the URL
* `comment` - (optional) The comment to display in Dashboard

## Environment Variables
* `U301_API_KEY` - The U301 API key, required for creating short URLs
* `DOMAIN` - (optional) The short URL domain, leave blank for the default domain
* `WORKSPACE_ID` - (optional) Which workspace to use, leave blank for the default workspace

## How to use
- Step 1: Create an API in [U301 Dashboard](https://u301.com)
- Step 2: (Optional) Add your own domain by connecting to Cloudflare
- Step 3: Add this MCP Server config

```jsonc
{
  "mcpServers": {
    "u301-url-shortener": {
      "command": "npx",
      "args": [
        "-y",
        "@u301/mcp"
      ],
      "env": {
        "U301_API_KEY": "<Your-U301-API-Key>",
        // "DOMAIN": "<optional-custom-domain>",
        // "WORKSPACE_ID": "<optional-workspace-id>"
      }
    }
  }
}
```
Now you can tell AI (cursor, windsurf)

> Replace the long URLs in the comments of this file with meaningful and memorable short URLs.

## License
The MIT License

<img src="https://u301.com/u301-logo-v3.svg" style="width: 120px; height: 120px;" />

Official Website: [https://u301.com](https://u301.com)
