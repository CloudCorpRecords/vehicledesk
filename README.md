# vehicledesk

Ask questions of a published vehicle dataset without downloading the whole thing first. vehicledesk is a small forwarding client for the hosted KnownVehicle service: the tool list is answered from your own machine using captured definitions, and each call travels upstream, with the service's answer handed back exactly as it arrived.

Nine of the ten captured tools are exposed — a labelled subset. Seven cover the dataset itself: its columns and shape, full-text row search, exact-match row lookup, side-by-side comparison, numeric column statistics, top and bottom rows by a numeric column, and the provenance record you need to cite a figure correctly. Two more are documentation reads about the enquiry flow: what an enquiry is and is not, who receives the details and the consent wording, and the full list of fields the enquiry asks. The captured `submit_enquiry` tool, which submits a person's enquiry answers to human providers, is deliberately not included.

## The tools

- **`dataset_columns`** — The columns of the dataset, which of them are numeric, the row count and the provenance banner. Call this first to learn the schema. Takes no arguments.
- **`dataset_search`** — Rows whose cells contain the `query` text (case-insensitive), up to 50. An optional `limit` narrows the count.
- **`dataset_row`** — Rows where a named `column` equals a `value` exactly (case-insensitive).
- **`dataset_compare`** — Rows whose `column` is any of the given `values` (2 to 10), in the order given — the shape for "X vs Y" questions.
- **`dataset_stats`** — Count, min, max, mean, median and sum of a numeric `column`; grouping commas and currency are handled upstream and non-numeric rows are excluded and counted.
- **`dataset_top`** — The highest rows by a numeric `column`, or the lowest when `ascending` is true. An optional `limit` narrows the count.
- **`dataset_provenance`** — The source, the date the dataset was computed, its licence and the citation for it. Takes no arguments.
- **`enquiry_describe`** — Read first before any enquiry: what the enquiry does, that nothing is bought or guaranteed, who receives the details, the consent wording, and how the person confirms. Takes no arguments.
- **`enquiry_fields`** — Every field the enquiry asks: key, label, type, whether required, help text and allowed options. Takes no arguments.

There is no `submit_enquiry` tool in this rebuild, at the registry, MCP or CLI level.

## Install and run

As an MCP server via npm:

```bash
npx -y @reneturcios/vehicledesk mcp
```

MCP client configuration:

```json
{
  "mcpServers": {
    "vehicledesk": {
      "command": "npx",
      "args": ["-y", "@reneturcios/vehicledesk", "mcp"]
    }
  }
}
```

As a container:

```bash
docker run -i ghcr.io/cloudcorprecords/vehicledesk
docker run --rm ghcr.io/cloudcorprecords/vehicledesk dataset_provenance '{}'
```

## CLI

A single binary covers both the command line and the MCP server. Every tool is a subcommand whose one argument is a JSON string of that tool's inputs:

```bash
vehicledesk dataset_columns '{}'
vehicledesk dataset_search '{"query":"ford"}'
vehicledesk dataset_row '{"column":"make","value":"Ford"}'
vehicledesk dataset_compare '{"column":"make","values":["Ford","Toyota"]}'
vehicledesk dataset_stats '{"column":"price"}'
vehicledesk dataset_top '{"column":"price","limit":10}'
vehicledesk dataset_provenance '{}'
vehicledesk enquiry_describe '{}'
vehicledesk enquiry_fields '{}'
vehicledesk --version
```

Exit codes: `0` for a successful forwarded call, `1` when the result that comes back is an error, and `2` for usage mistakes like an unknown subcommand or a JSON argument that does not parse.

## Configuration

- `KNOWNVEHICLE_MCP_URL` — Replaces the upstream endpoint. Defaults to the pinned hosted endpoint, `https://knownvehicle.com/mcp`. (This override variable is a reconstruction introduced by this rebuild.)

The KnownVehicle registry record lists no headers for its remote, so vehicledesk never attaches an authentication header — every call goes upstream keyless.

When the upstream cannot answer — it returns a JSON-RPC error, answers with a non-2xx status, sends a body that cannot be read, or the request itself fails — the caller receives an error result whose text begins with `vehicledesk error:`.

## How forwarding works

The first call of a process opens a session against the upstream: an `initialize` request (protocol version `2025-03-26`), a `notifications/initialized` notification, and then the `tools/call`. If the service issues an `Mcp-Session-Id` header during initialize, vehicledesk repeats it on subsequent requests and keeps reusing that one session until the process ends. Replies are understood in both plain JSON and server-sent-events framing. Successful results are passed through untouched, `isError` flag and any extra fields included.

## Development

```bash
npm install
npm run build   # tsc -> dist/ (dist/cli.js is the bin)
npm test        # tsx --test test/*.test.ts — stubbed upstream, no network
npm run dev     # run the CLI from source
```

The suite compares the served tool list against the captured surface tool for tool, asserts the omitted tool is absent at every level, walks the session handshake and its reuse, proves no `Authorization` header is sent under any environment, and confirms that arguments travel upstream unchanged and results return unchanged for every one of the nine tools.

## License

MIT — see `LICENSE`. Copyright (c) 2026 Rene Turcios.
