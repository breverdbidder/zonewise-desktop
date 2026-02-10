/**
 * VibeCodeMCPClient — Client for the vibe-code-best-practices MCP server
 * 
 * Provides structured access to 627+ curated modern dev tools including
 * AI agents, MCP servers, skills, UI components, and full-stack resources.
 * 
 * @endpoint https://vibe-code-best-practices.vercel.app/api/mcp
 * @protocol MCP 2024-11-05 (Streamable HTTP)
 * @author Gal Havkin (original), ZoneWise.AI (integration)
 */

const MCP_ENDPOINT = "https://vibe-code-best-practices.vercel.app/api/mcp";

interface MCPTool {
  name: string;
  description: string;
  url: string;
  category?: string;
  platform?: "web" | "mobile" | "both";
}

interface MCPSubcategory {
  id: string;
  name: string;
  description: string;
  toolCount: number;
  hasGuides: boolean;
  tools?: MCPTool[];
}

interface MCPSection {
  id: string;
  name: string;
  group: string;
  subcategories: MCPSubcategory[];
}

interface MCPResponse<T> {
  result: {
    content: Array<{ type: string; text: string }>;
  };
  jsonrpc: string;
  id: number;
}

let requestId = 1;

async function mcpCall<T>(method: string, params: Record<string, unknown>): Promise<T> {
  const response = await fetch(MCP_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: requestId++,
      method,
      params,
    }),
  });

  const data: MCPResponse<T> = await response.json();
  const text = data.result?.content?.[0]?.text;
  if (!text) throw new Error(`MCP call failed: ${method}`);
  return JSON.parse(text) as T;
}

/**
 * Initialize MCP connection (required before first call)
 */
export async function initialize(): Promise<boolean> {
  const response = await fetch(MCP_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: requestId++,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "zonewise-ai", version: "1.0.0" },
      },
    }),
  });

  const data = await response.json();
  return !!data.result?.serverInfo;
}

/**
 * List all available sections and subcategories
 */
export async function listSections(): Promise<MCPSection[]> {
  return mcpCall("tools/call", {
    name: "list-sections",
    arguments: {},
  });
}

/**
 * Search for tools by keyword with optional filters
 */
export async function searchTools(
  query: string,
  options?: { platform?: "web" | "mobile" | "both"; section?: string }
): Promise<MCPTool[]> {
  return mcpCall("tools/call", {
    name: "search-tools",
    arguments: { query, ...options },
  });
}

/**
 * Get full details of a section including all tools
 */
export async function getSection(sectionId: string): Promise<MCPSection & { subcategories: (MCPSubcategory & { tools: MCPTool[] })[] }> {
  return mcpCall("tools/call", {
    name: "get-section",
    arguments: { sectionId },
  });
}

/**
 * Get all tools from all sections (full catalog dump)
 * Used for initial marketplace seeding
 */
export async function getFullCatalog(): Promise<Record<string, MCPSection>> {
  const sections = await listSections();
  const catalog: Record<string, MCPSection> = {};

  for (const section of sections) {
    catalog[section.id] = await getSection(section.id);
  }

  return catalog;
}

/**
 * Search across the catalog with ZoneWise marketplace category mapping
 */
export const MARKETPLACE_CATEGORIES = {
  "ai-agents": { label: "Agent Frameworks & AI Tools", priority: "P0" },
  "mcp": { label: "MCP Server Marketplace", priority: "P0" },
  "skills": { label: "Skills Marketplace", priority: "P0" },
  "modern-stack": { label: "Modern Stack & Infrastructure", priority: "P1" },
  "web": { label: "Desktop App UI Components", priority: "P1" },
  "design": { label: "Design & Theming", priority: "P2" },
  "dev-tools": { label: "Developer Tools", priority: "P2" },
  "getting-started": { label: "Project Templates", priority: "P2" },
  "mobile": { label: "Mobile (Future)", priority: "P3" },
} as const;

export type MarketplaceCategory = keyof typeof MARKETPLACE_CATEGORIES;
