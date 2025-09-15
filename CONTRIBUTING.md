# Contributing to Konbini

## Developer overview

Konbini is structured as a monorepo.

| Project                           | Path (`packages/*`) | Stack                |
| :-------------------------------- | :------------------ | -------------------- |
| Command Line Interface            | `client/`           | TypeScript + Bun     |
| Safety system and API data source | `guard/`            | TypeScript + Bun     |
| Konpak                            | `konpak/`           | TypeScript + Bun[^1] |
| Code shared between all packages  | `shared/`           | TypeScript           |
| Tests                             | `tests/`            | TypeScript + Bun     |
| Data HTTP API                     | `data/`             | TypeScript (CJS)     |
| Main website                      | `gui/`              | TypeScript + Preact  |

## Reporting issues

Bug reports are really appreciated! Make sure to include ANY information you can provide (every step you took that led to the error, console output, your OS/browser name and version, etc...).

Raise a GitHub issue properly explaining it everything and we'll do our best at fixing it.

## Contributing guides

We're glad you want to contribute! First step is to fork Konbini. [Make your own fork](https://github.com/HanaOrg/Konbini/fork), then create a new branch using a `type/description` name (as defined by [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)). For example, `feat/cool-new-feature`.

You'll need to have BunJS installed.

Clone your fork, run `bun install` from the root, then start working code! Once done, make sure to run the precommit (`bun run precommit`) script before committing. Commit names don't really matter as your contribution will be squashed before merging.

If the precommit task (which runs ESLint) highlights any issue, be sure to fix it before submitting your code.

Once done, make a Pull Request properly describing your contribution and we'll review and hopefully merge it!

> Don't forget to be nice to others whenever you receive feedback on your code.

### Things to keep in mind

- If a change you made implies changes to documentation (and you haven't done them yourself, which is acceptable), be sure to highlight it in your PR.
- Adding tests is not mandatory, but HIGHLY encouraged.

[^1]: Intention is to rewrite this to Golang.
