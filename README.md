# Konbini &middot; [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-blue)](https://github.com/hanaorg/konbini/blob/master/CONTRIBUTING.md) &middot; [![CLI-ready](https://img.shields.io/badge/CLI-ready-white)](#command-line-interface) &middot; [![GUI-ready](https://img.shields.io/badge/GUI-ready-white)](#graphical-user-interface) &middot; [![Cross-platform](https://img.shields.io/badge/Cross_platform-ready-white)](#cross-platform)

> Konbini, Your convenience store.

Konbini is a package manager and software center meant to provide the most easy, beautiful, and straightforward experience to both users and developers.

## Features

### Easy publishing

Konbini's main advantage is bureaucracy-less publishing. You only need _one_ Pull Request to register as a developer, then _one_ Pull Request to publish your package. Any update you publish will be instantly available (if you publish correctly, of course). No need for making another PR for each version like WinGet or Nix do.

### Cross-platform support

Another advantage is aliasing, so you can have a WinGet, Nix, APT, or Homebrew package available from Konbini. This way, if the user attempts to install the package, it'll be automatically installed with the package manager that should be used instead, and will let it manage updates. The main reason for doing this is that you'll get a frontend link (for our store) to share with your users.

As of now, Konbini _per se_ (not aliased) only supports self-packaged releases, like raw executables or `.AppImage` files.

### Safety

Konbini requires all executables to be digitally signed using PGP, and to be hashed using the SHA3-512 hashing algorithm, ensuring secure distribution.

These can be generated using Konbini itself, via `kbd-sign` and `kbd-hash` respectively.

We also have a periodically running task that scans all downloadable projects with ClamAV. [More onto this here](./packages/client/guard/README.md).

### Cross-platform

Konbini removes the need to learn different publishing methods depending on the platform. Instead of learning WinGet process for Windows and Homebrew for macOS and Linux (for example), Konbini can handle all major platforms, and in macOS and Linux it supports both 64-bits and ARM.

## Usage

### Command Line Interface

Run `kbi` once installed and you will be shown a list of available commands and a brief description of what do they do.

Developers must compile (via `bun run build`) Konbini before execution - this is because Konbini relies on `sudo` in order to function, so `bun . <command>` usually won't work as it should.

### Graphical User Interface

Head to `https://konbini.vercel.app`. It's just a frontend, similar to Flathub, you'll still need the [CLI to be installed](#command-line-interface) anyway.

## Credits

Konbini is brought to you by [@ZakaHaceCosas](https://github.com/ZakaHaceCosas) and published under the name of "Hana" (this GitHub organization and a yet-to-be-born company).

A huge "thank you" to [MrSerge01](https://github.com/MrSerge01), [Dimkauzh](https://github.com/dimkauzh), and especially [pico190](https://github.com/pico190) for helping out.
