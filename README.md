# Konbini &middot; [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-blue)](https://github.com/hanaorg/konbini/blob/master/CONTRIBUTING.md)

Konbini, a package manager and software store meant to provide the simplest and most straightforward experience for users and developers.

> [!IMPORTANT]
> Konbini is currently on a VERY early stage; we still have A LOT of work to be done before considering this project usable. However, it does technically work as of now.

## Features

Konbini is, as aforementioned, still a very early project, although already capable of installing packages from the [package registry](https://github.com/HanaOrg/KonbiniPkgs), making it usable from the shell, updating and removing it, and validating downloads against SHA hashes and [author registry-provided](https://github.com/HanaOrg/KonbiniAuthors) GPG signatures.

Its main advantage is bureaucracy-less publishing. You only need _one_ Pull Request to register as a developer, then _one_ Pull Request to publish your package. Any update you publish will be instantly available (if you publish correctly, of course). No need for making another PR for each version like WinGet or Nix do.

Another advantage is aliasing, so you can have a WinGet, Nix, APT, or Homebrew package available from Konbini. This way, if the user attempts to install the package, it'll be automatically installed with the package manager that should be used instead, and will let it manage updates. The main reason for this is that you'll get a frontend link (for our store) to share with your users as soon as the Konbini UI version is ready.

As of now, Konbini _per se_ (not aliased) only supports self-packaged releases, like raw executables or `.AppImage` files.

## Safety

Konbini requires all executables to be digitally signed using PGP, and to be hashed using the `SHA3-512` hashing algorithm, ensuring secure distribution.

These can be generated using `GPG` (builtin to Linux) and Konbini itself using `kbd-hash <file>`, respectively. Hashes are generated using the builtin BunJS `CryptoHasher` utility.

We also have a weekly running task that scans all downloadable projects with ClamAV. [More onto this here](./guard/README.md).

## Usage

### Command Line Interface

Run `kbi` once installed and you will be shown a list of available commands and a brief description of what do they do.

Developers must compile (via `bun run build`) Konbini before execution - this is because Konbini relies on `sudo` in order to function, so `bun . <command>` usually won't work as it should.

### Graphical User Interface

Head to `https://konbini.vercel.app`. It requires the [CLI to be installed](#command-line-interface) anyway.

## Credits

Konbini is brought to you by [@ZakaHaceCosas](https://github.com/ZakaHaceCosas) and published under the name of "Hana" (this GitHub organization and a yet-to-be-born company).
