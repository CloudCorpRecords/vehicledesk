/**
 * vehicledesk core: a forwarding client for the hosted
 * KnownVehicle MCP server.
 *
 * No dataset computation happens on this machine.
 * tools/list is answered from the literal definitions
 * below, which reproduce a live capture of the upstream
 * server word for word (name, title, description and
 * inputSchema exactly as captured). A tools/call travels
 * upstream over a streamable-HTTP JSON-RPC session: an
 * initialize POST, a notifications/initialized POST,
 * then the tools/call POST, carrying the
 * Mcp-Session-Id response header on later requests when
 * the upstream issues one. The session opens lazily on
 * the first forwarded call and is reused for the
 * client's lifetime.
 *
 * This is a LABELLED SUBSET: 9 of the 10 captured tools
 * are registered. The kept surface is a published
 * vehicle dataset (its columns and provenance, row
 * search, exact-match rows, multi-value comparisons,
 * numeric column statistics and top/bottom rows) plus
 * enquiry_describe and enquiry_fields, published
 * documentation reads about the enquiry flow. The
 * captured submit_enquiry tool is OMITTED: it submits a
 * person's enquiry answers, keyed answers plus consent,
 * to human providers who quote directly, so it is not
 * registered here at any level.
 *
 * The endpoint is pinned to https://knownvehicle.com/mcp
 * and may be replaced with the KNOWNVEHICLE_MCP_URL
 * environment variable (that override is a labelled
 * reconstruction). The registry record declares NO
 * headers on the remote: no auth header is ever sent,
 * under any environment.
 *
 * A successful upstream result is returned exactly as
 * received, isError flag and extra fields included.
 * Failures — an upstream JSON-RPC error, a non-2xx
 * status, a body that cannot be parsed, or a fetch that
 * throws or times out — become an isError result whose
 * text begins with `vehicledesk error:` (that rendering
 * is a labelled reconstruction). Replies may be plain
 * JSON or SSE (`data:` lines); the JSON-RPC message
 * whose id matches the request wins.
 */
import type {
  FetchFn,
  FetchResponseLike,
  ForwardDeps,
  ToolArgs,
  ToolDef,
  ToolResult,
} from "./types.js";

export const VERSION = "0.1.0";

export const DEFAULT_ENDPOINT_URL = "https://knownvehicle.com/mcp";

export const DEFAULT_TIMEOUT_MS = 30000;

export const PROTOCOL_VERSION = "2025-03-26";

/* ------------------------------------------------------------------ */
/* Tool definitions (tools/list literals, verbatim from the live       */
/* capture in harness/fixtures/knownvehicle-tools-original.json;      */
/* generated programmatically by parsing and re-serialising the        */
/* fixture JSON, never retyped)                                        */
/* ------------------------------------------------------------------ */

// TOOL_DEFS_GENERATED_START
export const TOOL_DEFS: ToolDef[] = [
  {
    "name": "dataset_columns",
    "title": "Dataset columns and shape",
    "description": "The columns, which of them are numeric, the row count and the provenance banner of the KnownVehicle dataset. Call this first to learn the schema.",
    "inputSchema": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "dataset_search",
    "title": "Search the dataset",
    "description": "Rows of the KnownVehicle dataset whose cells contain the query (case-insensitive), up to 50.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "query": {
          "type": "string",
          "minLength": 1,
          "description": "text to look for in any cell"
        },
        "limit": {
          "type": "integer",
          "description": "Maximum number of rows to return",
          "minimum": 1,
          "maximum": 50
        }
      },
      "required": [
        "query"
      ],
      "additionalProperties": false,
      "$schema": "http://json-schema.org/draft-07/schema#"
    }
  },
  {
    "name": "dataset_row",
    "title": "Look a row up by an exact key",
    "description": "The rows of the KnownVehicle dataset where a column equals a value exactly (case-insensitive).",
    "inputSchema": {
      "type": "object",
      "properties": {
        "column": {
          "type": "string",
          "description": "Name of the column to match on",
          "minLength": 1
        },
        "value": {
          "type": "string",
          "description": "Value the column must equal (case-insensitive)",
          "minLength": 1
        }
      },
      "required": [
        "column",
        "value"
      ],
      "additionalProperties": false,
      "$schema": "http://json-schema.org/draft-07/schema#"
    }
  },
  {
    "name": "dataset_compare",
    "title": "Compare rows side by side",
    "description": "The rows of the KnownVehicle dataset whose column is any of the given values, in the order given — for \"X vs Y\" questions.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "column": {
          "type": "string",
          "description": "Name of the column to match on",
          "minLength": 1
        },
        "values": {
          "type": "array",
          "description": "Values to match in the column, in the order given",
          "items": {
            "type": "string",
            "minLength": 1
          },
          "minItems": 2,
          "maxItems": 10
        }
      },
      "required": [
        "column",
        "values"
      ],
      "additionalProperties": false,
      "$schema": "http://json-schema.org/draft-07/schema#"
    }
  },
  {
    "name": "dataset_stats",
    "title": "Summary statistics for a numeric column",
    "description": "count, min, max, mean, median and sum of a numeric column of the KnownVehicle dataset (grouping commas and currency are handled; non-numeric rows are excluded and counted).",
    "inputSchema": {
      "type": "object",
      "properties": {
        "column": {
          "type": "string",
          "description": "Name of the column to match on",
          "minLength": 1
        }
      },
      "required": [
        "column"
      ],
      "additionalProperties": false,
      "$schema": "http://json-schema.org/draft-07/schema#"
    }
  },
  {
    "name": "dataset_top",
    "title": "Rank rows by a numeric column",
    "description": "The highest (or lowest) rows of the KnownVehicle dataset by a numeric column — \"which is the most/least X\".",
    "inputSchema": {
      "type": "object",
      "properties": {
        "column": {
          "type": "string",
          "description": "Name of the column to match on",
          "minLength": 1
        },
        "limit": {
          "type": "integer",
          "description": "Maximum number of rows to return",
          "minimum": 1,
          "maximum": 50
        },
        "ascending": {
          "type": "boolean",
          "description": "true for the lowest first; default highest first"
        }
      },
      "required": [
        "column"
      ],
      "additionalProperties": false,
      "$schema": "http://json-schema.org/draft-07/schema#"
    }
  },
  {
    "name": "dataset_provenance",
    "title": "Where this data comes from, and how to cite it",
    "description": "The source, the date it was computed, the licence and the citation for the KnownVehicle dataset. Read this to attribute a figure correctly.",
    "inputSchema": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "enquiry_describe",
    "title": "What you get: an ENQUIRY with a human (not a purchase, not a guaranteed quote)",
    "description": "Read first. States plainly what submit_enquiry does on KnownVehicle: it starts an enquiry with human providers who quote directly. Nothing is bought, ordered or paid; no quote is guaranteed; it is free. Also returns who receives the details, the consent wording, and how the person confirms.",
    "inputSchema": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "enquiry_fields",
    "title": "The questions the enquiry asks",
    "description": "Every field of the KnownVehicle enquiry: key, label, type, whether required, help text and the allowed options where there are any. Pass answers to submit_enquiry keyed by field key.",
    "inputSchema": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "properties": {}
    }
  }
];
// TOOL_DEFS_GENERATED_END

export const TOOL_NAMES = TOOL_DEFS.map((t) => t.name);

/** Whether `name` belongs to the kept subset. */
export function isKnownTool(name: string): boolean {
  return TOOL_NAMES.includes(name);
}

/* ------------------------------------------------------------------ */
/* Forwarding client                                                   */
/* ------------------------------------------------------------------ */

function errorResult(detail: string): ToolResult {
  return {
    content: [{ type: "text", text: `vehicledesk error: ${detail}` }],
    isError: true,
  };
}

function rpcErrorMessage(error: unknown): string {
  if (error !== null && typeof error === "object") {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message !== "") return message;
    return JSON.stringify(error);
  }
  return String(error);
}

/**
 * Read a JSON-RPC response body, tolerating SSE framing.
 * Returns the message whose id matches `expectedId` when
 * present, otherwise the last parseable message, otherwise
 * null when nothing in the body parses.
 */
export function parseRpcBody(
  text: string,
  expectedId?: number,
): Record<string, unknown> | null {
  const trimmed = text.trim();
  if (trimmed === "") return null;
  const candidates: Record<string, unknown>[] = [];
  const tryPush = (payload: string): void => {
    try {
      const parsed: unknown = JSON.parse(payload);
      if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
        candidates.push(parsed as Record<string, unknown>);
      }
    } catch {
      // Not a JSON payload; skip this candidate.
    }
  };
  if (trimmed.includes("data:")) {
    for (const line of trimmed.split("\n")) {
      const t = line.trim();
      if (!t.startsWith("data:")) continue;
      const payload = t.slice("data:".length).trim();
      if (payload !== "" && payload !== "[DONE]") tryPush(payload);
    }
  } else {
    tryPush(trimmed);
  }
  if (candidates.length === 0) return null;
  if (expectedId !== undefined) {
    const match = candidates.find((c) => c.id === expectedId);
    if (match !== undefined) return match;
  }
  return candidates[candidates.length - 1];
}

async function defaultFetch(
  url: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    signal?: AbortSignal;
  },
): Promise<FetchResponseLike> {
  return fetch(url, init) as unknown as FetchResponseLike;
}

/**
 * A forwarding client holding a single upstream session,
 * opened lazily on first use and reused from then on
 * (for the process lifetime in the MCP server, or for a
 * single invocation in the CLI).
 */
export class VehicledeskClient {
  private readonly deps: ForwardDeps;
  private sessionId: string | null = null;
  private ready = false;
  private sessionPromise: Promise<void> | null = null;
  private idCounter = 0;

  constructor(deps: ForwardDeps = {}) {
    this.deps = deps;
  }

  private fetchFn(): FetchFn {
    return this.deps.fetchFn ?? defaultFetch;
  }

  private endpointUrl(): string {
    if (this.deps.url && this.deps.url.trim() !== "") return this.deps.url.trim();
    const raw = (this.deps.env ?? process.env).KNOWNVEHICLE_MCP_URL;
    if (raw && raw.trim() !== "") return raw.trim();
    return DEFAULT_ENDPOINT_URL;
  }

  private timeoutMs(): number {
    if (typeof this.deps.timeoutMs === "number" && this.deps.timeoutMs > 0) {
      return this.deps.timeoutMs;
    }
    return DEFAULT_TIMEOUT_MS;
  }

  private nextId(): number {
    this.idCounter += 1;
    return this.idCounter;
  }

  private async post(
    body: unknown,
    withSession: boolean,
  ): Promise<FetchResponseLike> {
    // The registry record declares NO headers on the remote:
    // no Authorization (or any other auth) header is ever sent.
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    };
    if (withSession && this.sessionId !== null) {
      headers["Mcp-Session-Id"] = this.sessionId;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs());
    try {
      return await this.fetchFn()(this.endpointUrl(), {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  }

  private async ensureSession(): Promise<void> {
    if (this.ready) return;
    if (this.sessionPromise === null) {
      this.sessionPromise = (async () => {
        const initId = this.nextId();
        const initRes = await this.post(
          {
            jsonrpc: "2.0",
            id: initId,
            method: "initialize",
            params: {
              protocolVersion: PROTOCOL_VERSION,
              capabilities: {},
              clientInfo: { name: "vehicledesk", version: VERSION },
            },
          },
          false,
        );
        const sessionId = initRes.headers.get("mcp-session-id");
        if (sessionId) this.sessionId = sessionId;
        const initText = await initRes.text();
        const initParsed = parseRpcBody(initText, initId);
        if (initParsed !== null && initParsed.error) {
          throw new Error(rpcErrorMessage(initParsed.error));
        }
        if (initRes.status < 200 || initRes.status >= 300) {
          throw new Error(`HTTP ${initRes.status}`);
        }
        if (initParsed === null && initText.trim() !== "") {
          throw new Error("malformed response");
        }
        const initializedRes = await this.post(
          { jsonrpc: "2.0", method: "notifications/initialized" },
          true,
        );
        try {
          await initializedRes.text();
        } catch {
          // Nothing needed from the notification response body.
        }
        this.ready = true;
      })();
    }
    try {
      await this.sessionPromise;
    } catch (err) {
      this.sessionPromise = null;
      this.sessionId = null;
      throw err;
    }
  }

  /** Forward one tool call; upstream failures come back as isError results. */
  async callTool(name: string, args: ToolArgs): Promise<ToolResult> {
    try {
      await this.ensureSession();
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err));
    }

    const callId = this.nextId();
    let callRes: FetchResponseLike;
    try {
      callRes = await this.post(
        {
          jsonrpc: "2.0",
          id: callId,
          method: "tools/call",
          params: { name, arguments: args ?? {} },
        },
        true,
      );
    } catch (err) {
      return errorResult(
        `request failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    const parsed = parseRpcBody(await callRes.text(), callId);
    if (parsed !== null && parsed.error) {
      return errorResult(rpcErrorMessage(parsed.error));
    }
    if (callRes.status < 200 || callRes.status >= 300) {
      return errorResult(`HTTP ${callRes.status}`);
    }
    if (parsed === null) return errorResult("malformed response");
    const result = parsed.result as ToolResult | undefined;
    if (result === undefined || result === null || typeof result !== "object") {
      return errorResult("malformed response");
    }
    // Hand the upstream result back exactly as received.
    return result;
  }
}

/** Build a forwarding client; tests inject a fake fetch and env through deps. */
export function createClient(deps: ForwardDeps = {}): VehicledeskClient {
  return new VehicledeskClient(deps);
}

/** One-shot helper: a fresh client for a single call (the CLI path). */
export async function callTool(
  name: string,
  args: ToolArgs,
  deps: ForwardDeps = {},
): Promise<ToolResult> {
  return new VehicledeskClient(deps).callTool(name, args);
}
