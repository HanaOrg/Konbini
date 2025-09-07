# Konbini Data

This is the Konbini Data API (codename KData), hosted on Vercel. It serves data from packages, including manifests, downloads, and changelogs. Raw data is fetched from a GitHub action, then parsed, analyzed, and properly uploaded to this API.

To see how data is fetched, refer to Konbini Guard (this repo/packages/client/guard).

> [!NOTE]
> KData uses CommonJS instead of ESM, like the rest of the project does. This is intentional, as it was the only way we found to fix an issue caused by some dependency using `with()` syntax or something like that. Sorry.
