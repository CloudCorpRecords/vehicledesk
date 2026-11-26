# Changelog

## 0.1.0 (2026-10-28)

- First release: a forwarding client for the hosted KnownVehicle MCP server, serving a labelled subset of 9 of the 10 captured tools. All nine tools are answered locally for tools/list, and every tools/call is forwarded upstream over a streamable-HTTP JSON-RPC session (initialize, notifications/initialized, tools/call, honouring the Mcp-Session-Id header when the upstream issues one).
- Tools: `dataset_columns`, `dataset_search`, `dataset_row`, `dataset_compare`, `dataset_stats`, `dataset_top`, `dataset_provenance`, `enquiry_describe`, `enquiry_fields` — schema and provenance reads for a published vehicle dataset, row search, exact-match rows, multi-value comparisons, numeric statistics and ranked rows, plus published documentation reads about the enquiry flow.
- Omitted: `submit_enquiry`, which submits a person's enquiry answers to human providers, is not registered at the registry, MCP or CLI level.
- Upstream results pass through verbatim, including the isError flag; upstream failures surface as `vehicledesk error:` text results.
- One bin serves the CLI (one subcommand per tool, plus `--version`) and the stdio MCP server (`mcp` subcommand). The upstream endpoint can be overridden via `KNOWNVEHICLE_MCP_URL`. The registry record declares no headers on the remote, so no auth header is ever sent.
