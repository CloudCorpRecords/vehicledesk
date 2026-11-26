# BUILD REPORT — vehicledesk

Clean-room rebuild of `com.knownvehicle/site` v1.0.1
(remote-only MCP server at `https://knownvehicle.com/mcp`),
built 2026-10-28 as a forwarding client. Package: `@reneturcios/vehicledesk`
0.1.0, registry name `io.github.CloudCorpRecords/vehicledesk`.

## Surface built

**LABELLED SUBSET: 9 of the 10 captured tools built**, one omitted (below).

| Tool | Required fields as served |
|------|---------------------------|
| `dataset_columns` | *(none — no `required` key in the capture, served verbatim)* |
| `dataset_search` | `query` |
| `dataset_row` | `column`, `value` |
| `dataset_compare` | `column`, `values` |
| `dataset_stats` | `column` |
| `dataset_top` | `column` |
| `dataset_provenance` | *(none — no `required` key in the capture, served verbatim)* |
| `enquiry_describe` | *(none — no `required` key in the capture, served verbatim)* |
| `enquiry_fields` | *(none — no `required` key in the capture, served verbatim)* |

Each served tool carries exactly the keys `name`,
`title`, `description`, `inputSchema` — the capture
carries a `title` key per tool, so the fixture carries
it and it is served verbatim. `dataset_search`,
`dataset_row`, `dataset_compare`, `dataset_stats` and
`dataset_top` carry `additionalProperties: false` and
the `inputSchema.$schema` marker
(`http://json-schema.org/draft-07/schema#`) exactly as
captured; the four no-argument tools carry no
`additionalProperties` key and no `required` key — none
was captured, none was invented. Property shapes are
served verbatim, including `dataset_search`'s `limit`
(integer 1..50), `dataset_compare`'s `values` (array of
2..10 non-empty strings), and `dataset_top`'s optional
`limit` and `ascending` boolean.
The tool literals were generated programmatically from
`harness/fixtures/knownvehicle-tools-original.json` by
the script at `/tmp/laneb9-vehicledesk-scratch/gen.py`
(parse + re-serialise, spliced into `src/forward.ts`
between the TOOL_DEFS_GENERATED markers) — never
retyped — and the generator's round-trip check confirmed
the spliced block parses back deep-equal to the
fixture's 9 tool objects, in order. Tools are
registered via the MCP SDK low-level Server API
(`ListToolsRequestSchema` / `CallToolRequestSchema`
handlers), not McpServer+zod.

The kept surface is a published vehicle dataset and its
documentation: the dataset's schema and provenance
(source, date computed, licence, citation), row search,
exact-match rows, multi-value comparisons, numeric
column statistics and top/bottom rows — plus
`enquiry_describe` and `enquiry_fields`, published
documentation reads about the enquiry flow (what the
submission does, who receives the details, the consent
wording, the field list).

**OMITTED:** `submit_enquiry` — submits a person's
enquiry answers (keyed answers plus `consent`) to human
providers who quote directly: a send-a-person's-details
tool. It is absent at registry, MCP-layer and CLI level,
and tests assert that absence at all three levels
(registry lists, MCP tools/list, MCP-layer
MethodNotFound rejection with no upstream hop, MCP
tools/call rejection, and CLI usage exit 2).

## Fixture conflicts

**None.** The spec and the fixture agree on the tools'
names, titles, descriptions, the `required` arrays
(none; `query`; `column`+`value`; `column`+`values`;
`column`; `column`; none; none; none), the presence of
a `title` key on every tool, and the property shapes.

## Labelled reconstructions (from the spec's Wire section)

- Upstream endpoint pinned: `https://knownvehicle.com/mcp`.
- Env override `KNOWNVEHICLE_MCP_URL` — labelled reconstruction.
- The registry record declares NO headers on the remote: no auth
  header is ever sent, under any environment. Tests assert that no
  `Authorization` header (and no `X-API-Key` header) is sent with an
  empty environment, with a `KNOWNVEHICLE_API_KEY`-style variable
  present, and with `AUTHORIZATION` / `API_KEY` /
  `KNOWNVEHICLE_TOKEN` variables present.
- Error rendering `vehicledesk error:` text for upstream failures
  — labelled reconstruction.
- Upstream results pass through verbatim, including `isError` and
  extra fields. tools/call is forwarded as streamable-HTTP JSON-RPC:
  initialize (protocolVersion `2025-03-26`) →
  notifications/initialized → tools/call, honouring `Mcp-Session-Id`
  when issued; plain-JSON and SSE replies are both parsed. The
  forwarding core takes an injectable fetch; tests stub the
  upstream — no live network calls in tests, and no live call is
  claimed beyond the coordinator's tools/list capture.

## Deviations

**None.** No write-guard workaround was needed in this session:
the lockfile, `npm ci`, `tsc` build and test suite all ran
through the normal routes (direct `node_modules/.bin/tsc` /
`tsx` binaries), and `dist/` is the direct output of
`tsc` on the validated sources.

## Lockfile

Generated clean from birth (Route 3, clean dir, no
`node_modules`, no pre-existing lockfile):
`npm install --package-lock-only --ignore-scripts --offline`
→ success. Parses as JSON; `name` == `@reneturcios/vehicledesk`;
exactly **128** package entries; sha256
`7f1554c7df6d7267442876f4fffd59ffaee5694ee11a2953c740d0ea23e6221e`.
`npm ci --ignore-scripts --offline` then succeeded and the
lockfile sha256 was re-verified **unchanged** afterwards.

## server.json

- Description exactly: "A published vehicle dataset: search, compare and summarise rows, with provenance." — **81 characters** (measured from the written file).
- npm package entry carries `"version": "0.1.0"`; the OCI entry
  (`ghcr.io/cloudcorprecords/vehicledesk:0.1.0`) carries **no**
  `version` field. Both entries carry packageArguments
  `[{type: positional, value: mcp}]` and transport stdio. Dockerfile
  (node:20-alpine, both stages) carries the label
  `io.modelcontextprotocol.server.name="io.github.CloudCorpRecords/vehicledesk"`.
  Container workflow `IMAGE` is `ghcr.io/cloudcorprecords/vehicledesk`
  and its smoke test asserts the server name `vehicledesk`.

## Verification (run 2026-10-28, builder session)

1. `npm install --package-lock-only --ignore-scripts --offline`
   → success; lockfile parses, name `@reneturcios/vehicledesk`,
   128 package entries (see Lockfile).
2. `npm ci --ignore-scripts --offline` → success; lockfile
   sha256 unchanged.
3. `tsc --noEmit` (direct `node_modules/.bin/tsc`) → exit 0.
4. `tsc` build → exit 0; `node dist/cli.js --version` → `0.1.0`.
5. Full suite (`tsx --test test/*.test.ts`, direct
   `node_modules/.bin/tsx`) → **71 tests,
   71 pass, 0 fail** (registration-integrity suite deep-equals
   the served tools/list against the fixture's 9 tools, in
   order, at both the registry level and through an
   in-memory-transport MCP `tools/list`; plus per-tool schema
   detail assertions including the title checks, omission-absence
   assertions for `submit_enquiry` at registry, MCP-layer and CLI
   level, session handling/reuse, env override, the
   no-Authorization-header assertions under every environment,
   verbatim argument forwarding for all 9 tools and result
   pass-through including upstream isError, SSE parsing, error
   rendering, MCP-layer validation, and CLI behaviour).
6. Parity (harness, tools-file mode):
   `python3 /home/hatch/workspace/mcp-rebuild-100/harness/parity.py --original /home/hatch/workspace/mcp-rebuild-100/harness/fixtures/knownvehicle-tools-original.json --rebuild "stdio:node /home/hatch/workspace/mcp-rebuild-100/builds/vehicledesk/dist/cli.js mcp" --out /home/hatch/workspace/mcp-rebuild-100/builds/vehicledesk/parity-out/`
   → **verdict PASS, parity 100.0** (9/9 identical, 0 missing,
   0 extra, no schema diffs). Output in `parity-out/`.
