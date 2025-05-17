#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
const name = "u301-url-shortener" as const;
const version = "1.0.0" as const;

const U301_API_BASE = "https://api.u301.com/v3";
const USER_AGENT = `mcp-server-app/${version}`;

// Check for API key
const U301_API_KEY = process.env.U301_API_KEY;

// which domain to use for shortening, leave empty to use the default domain
const shortenDomain = process.env.DOMAIN ?? "u301.co";

// which workspace to use for shortening, leave empty to use your default workspace
const workspaceId = process.env.WORKSPACE_ID;

if (!U301_API_KEY) {
    console.error("Error: U301_API_KEY environment variable is required");
    process.exit(1);
}

// Create server instance
const server = new McpServer({
    name,
    description: 'Shorten URLs in bulk using U301 API',
    version,
});
const inputSchema = z.array(z.object({
    url: z.string({
        description: "URL to shorten e.g. https://example.com/very/long/url"
    }),
    slug: z.string({
        description: "(optional) Custom slug for the shortened URL"
    }).optional(),
    expiredAt: z.string({
        description: "(optional) Expiration date for the shortened URL, e.g. 2023-01-01T00:00:00Z",
        coerce: true,
    }).optional(),
    password: z.string({
        description: "(optional) Password for the shortened URL"
    }).optional(),
    comment: z.string({
        description: "(optional) Comment, displayed on the dashboard"
    }).optional(),
}))
const toolName = "u301_shortening_urls_in_bulk"
const toolDescription = `Use U301's short link service API to batch shorten long URLs. Custom domains are supported, with up to 200 URLs per request.
You should provide as "{ urls: <URLItem>[]}"
Current ShortLink domain is ${shortenDomain}
URLItem Supported Parameters are` +
[
    "url: required, the URL to be shortened",
    `slug: optional, a custom slug for the shortened URL, the final shortened URL will be https://${shortenDomain}/<slug>
    if you leave it empty, random slug will create`,
    "expiredAt: optional, the expiration date for the shortened URL, e.g. 2023-01-01T00:00:00Z",
    "password: optional, a password for the shortened URL",
    "comment: optional, a comment, displayed on the dashboard"
].join("\n");
server.tool(toolName, toolDescription, { urls: inputSchema }, async(args) => {
    const urls = inputSchema.parse(args.urls);
    if (urls.length > 200) {
        throw new Error("Too many URLs provided");
    } else if (urls.length === 0) {
        throw new Error("No URLs provided");
    }
    try {
        const responseLinks = await U301Request<(ShortenedURL | ShortenedURLFailed)[]>(`/shorten/bulk?workspaceId=${workspaceId}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(urls.map((url) => ({
                url: url.url,
                slug: url.slug,
                domain: shortenDomain,
                expiredAt: url.expiredAt,
                password: url.password,
                comment: url.comment,
            }))),
        })
        if (!responseLinks) {
            throw new Error("No response from U301 API");
        }
        return {
            content: [{ type: "text", text: formatResults(responseLinks) }],
            isError: false,
        }
    } catch (e) {
        return {
            content: [{ type: "text", text: `Error: ${e}` }],
            isError: true,
        }
    }
})
async function U301Request<T>(url: string, options?: RequestInit): Promise<T | null> {
    options = options || {} as RequestInit;
    const originalHeaders = options?.headers || {};
    options.headers = {
        'User-Agent': USER_AGENT,
        'Authorization': `Bearer ${U301_API_KEY}`,
        'Accept-Encoding': 'gzip',
        'Accept': 'application/json',
        ...originalHeaders
    };
    const response = await fetch(U301_API_BASE + url, options);
    if (!response.ok) {
        throw new Error(`U301 API error: ${response.status} ${response.statusText}\n${await response.text()}`);
    }
    return (await response.json()) as T;
}

export interface ShortenedURL {
    id: string
    url: string
    shortLink: string
    slug: string
    isCustomSlug: boolean
    domain: string
    isReused: boolean
    comment: string
}

export interface ShortenedURLFailed {
    url: string
    error: string
    message: string
}

async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("U301 MCP Server running on stdio");
}

runServer().catch((error) => {
    console.error("Fatal error when running MCP Server:", error);
    process.exit(1);
});


function isFailedLink(link: ShortenedURL | ShortenedURLFailed): link is ShortenedURLFailed {
    return (link as ShortenedURLFailed).error !== undefined;
}

function formatResults(links: (ShortenedURL | ShortenedURLFailed)[]): string {
    return (links || []).map((link, i) => {
        if (isFailedLink(link)) {
            return `[${i}]: Failed to shorten ${link.url}: ${link.error} - ${link.message}`;
        }

        const items = [
            `Index: ${i}`,
            `Id: ${link.id}`,
            `Original URL: ${link.url}`,
            `Short Link: ${link.shortLink}`,
            `Domain: ${link.domain}`,
            `Reused: ${link.isReused ? 'Yes' : 'No'}`,
            `Comment: ${link.comment || 'N/A'}`,
        ];
        return items.join('\n')
    }).join('\n---\n');
}