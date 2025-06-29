<!-- markdownlint-disable md007 md028 md001 -->

# Konbini Developer Documentation

The following document explains in detail how to publish your package to Konbini.

## Registering as a developer

Both profile registration and package registration are GitHub Pull Request-based. You open a single PR on the registry repository, and if it merges, you are automatically in. We manually review PRs to ensure only legitimate developers (and no scammers) join Konbini.

**Your Pull Request MUST comply with the following criteria**, where `USER` is your unique author name:

- **Includes a `USER.yaml` file.** This is your "author manifest" and includes relevant info about you, following [this specification](#author-manifest-specification).
- **Includes a `USER.asc` file.** _**Developers are required to provide a public PGP key.**_ This signature will be used to validate binaries of your package against it. Each binary you distribute must be signed with this PGP key.
- **Is properly routed.** Both files you made should be in a `/SCOPE/LEVEL/` directory.
    - The root of the repo contains two directories: `org/` and `usr/`. These are the two SCOPE directories; use `usr/` if you are publishing software by yourself or `org/` if you are publishing software by an organization (does not need to be legally established whatsoever; a "collab org" you and your friends made, for example, should use the `org/` directory).
    - Inside `org/` or `usr/`, you'll find subdirectories named using the first two letters of your username, used to group entries by initials and optimize HTTP queries. These are the LEVEL directories, and use THE INITIALS of the content that lives inside. In other words: if your `USER` is called "foobar", for example, you should contribute your files to `fo/foobar.*` (well, `usr/fo/foobar.*` more precisely).
- **Uses lowercase for all filenames.** UNIX systems differentiate `foobar.file` and `Foobar.file` - and we use filenames to define usernames. This could lead to `usr.foobar` and `usr.Foobar` existing as separate users, therefore your filenames must be entirely lowercase.

### Author manifest specification

Depending on whether the manifest is for a USER or an ORGANIZATION, two different specifications apply. Below proceed both specifications in the format of YAML files - same format you'll use to create them. After each key, the data type (as in JavaScript) is displayed.

> [!IMPORTANT] > **In both manifest files**, `name` defines your DISPLAY name, not username. Your username is filesystem based and follows a `scope.username` format. If your manifest file is called `foobar.yaml` and exists in the `org/` directory, your unique `author_id` is `org.foobar`; and if your package's manifest file is `foo.yaml`, your package's unique ID is `foo`.
>
> **Manifest filenames (and thus package and user IDs) must be of at least two characters.**

> [!NOTE]
> You must use YAML format for the manifest file.

#### User manifest

```yaml
# Your name. Should be real, but doesn't have to, a username works.
name: string
# Name of an organization you belong to.
org: string # (optional)
# A publicly visible e-mail address.
email: string # (optional)
# A link to your personal website of choice.
website: string # (optional)
# Your biography - a text they visible inside your profile.
biography: string # (optional)
# Whether you're for hire or not.
for_hire: boolean # (optional)
# Your socials, if any.
socials: # (optional - inner props are all optional too)
    # Twitter handle, without the AT (@) symbol.
    twitter: string
    # GitHub username
    github: string
```

#### Organization manifest

```yaml
# Your organization's name.
name: string
# Your organization's website. Required for transparency and verification purposes. Publicly visible.
website: string
# Your organization's email. Required for transparency and verification purposes. Publicly visible.
email: string
# Whether it's a private, non profit, public, or collab organization. Required for transparency purposes.
# For other types of organizations, use `OTHER`, as some organizations are hard to catalog.
type: "PRIVATE_CORP" OR "NON_PROFIT" OR "GOVT_ORG" OR "COLLAB_ORG" OR "OTHER"
# Your organization's socials, if any. Optional - inner props are all optional too.
socials:
    # Twitter handle, without the AT (@) symbol.
    twitter: string
    # GitHub username
    github: string
```

## Registering a package

If you correctly did everything, your PR to the authors registry should be merged. After that, you are ready to publish a package.

Just as when you made your profile, you will need to make a Pull Request including a manifest file (and nothing else this time). This file must be called `PACKAGE.yaml`, where PACKAGE will be the unique identifier of your package. So, if you created `cool-package.yaml`, `kbi install cool-package` would point to your package.

#### Package manifest specification

```yaml
# GitHub/GitLab/Codeberg repository where the package _itself_ is stored.
repository: string/string
# Supported platforms for the package, with their Konbini Package Scope (KPS).
platforms:
    # 64-bit Linux KPS.
    linux64: null | KPS
    # ARM Linux KPS.
    linuxARM: null | KPS
    # 64-bit / Intel macintoshOS KPS.
    mac64: null | KPS
    # ARM / Apple Silicon macintoshOS KPS.
    macARM: null | KPS
    # 64-bit Microsoft Windows KPS.
    win64: null | KPS

# Package name, as displayed in the Konbini UI.
name: string

# Package slogan, as displayed in the Konbini UI and the Konbini CLI.
slogan: string

# Package description, as displayed in the Konbini UI. Supports basic MarkDown.
desc: string

# Package license.
license: LICENSE

# Author's unique identifier.
author_id: AUTHOR_ID

# A list of persons who have contributed to the development of this package.
maintainers:
    - name: string
      # Optional email
      email: string

# App icon to be displayed in the Konbini UI. Only WEBP over HTTPS is supported.
icon: https://example.com/icon.webp

# App screenshots to be displayed in the Konbini UI. Only WEBP over HTTPS is supported.
screenshot_urls:
    - "https://example.com/image1.webp"

# A category that represents the type of tool or software the app is meant to be.
# - SYSTEM_UTIL: Tools for system management (e.g., disk cleaner, sys info viewer).
# - PERSONAL: Personal-related tools (e.g., health, digital wellbeing).
# - PRODUCTIVITY: Tools for productivity and task management (e.g., to-do lists, reminders).
# - PRODUCTION: Tools for creating or editing content (e.g., photo/video editors, music production software).
# - EFFICIENCY: Tools aimed at improving efficiency (e.g., automation tools, time trackers).
# - DEVELOPMENT: Tools for developers (e.g., IDEs, code editors, debugging tools).
# - GAMING: Gaming-related tools (e.g., game launchers, mods, game-related utilities).
# - OFFICE: Office tools (e.g., word processors, spreadsheets, presentations).
# - ENTERTAINMENT: Tools for media consumption (e.g., music, video streaming, e-books).
# - COMMUNICATION: Tools for communication (e.g., messaging apps, email clients, video conferencing).
# - EDUCATION: Tools for learning and knowledge management (e.g., note-taking apps, educational platforms).
categories:
    - "EDUCATION"
    # ...

# Age rating of the app. This works by specifying if the following items (which restrict age) are present.
#
# For anyone wondering where nudity references are, that kind of content is prohibited from Konbini.
age_rating:
    # Does the app allow to use real currency in any way?
    money: true
    # Does the app allow to use unmonitored chats, media reels, whatsoever?
    social: true
    # Does the app reference illegal substances or legalized drugs / alcohol in any way?
    substances: false
    # Does the app show scenes of real, graphical violence in any case?
    violence: false
```

Where `AUTHOR_ID` is your author ID as previously defined (`scope.username`), `LICENSE` is one of the following codes:

```ts
| "MIT"
| "GPLv3"
| "GPLv2"
| "Apache2"
| "BSD2Clause"
| "BSD3Clause"
| "ISC"
| "MPLv2"
| "LGPLv3"
| "EPLv2"
| "Unlicense"
| "Zlib"
| "PublicDomain"
```

and `KPS` is the following:

## Konbini Package Scope (KPS)

A scope is defined in the `SOURCE:VALUE` format, where `SOURCE` can be one of the following:

- `std` (Konbini)
- `apt` (DPKG)
- `nix` (Nix)
- `brew` (Homebrew)
- `brew-k` (Homebrew, packages that need `--cask`)
- `fpak` (Flatpak)
- `wget` (WinGet)

and `VALUE` is:

**_IF `SOURCE` EQUALS `std`_**: **the FILENAME of the binary associated with that scope.** Since we grab binaries from your GitHub/GitLab/Codeberg release, you specify on each scope (you define a scope for each platform) the filename we should look for.

**If you write version codes in your file names**, you don't need to modify the manifest each time, don't worry. Use `[[VER]]` in the manifest to reference the place where it appears (we assume your naming is consistent, as it should be). Be sure the version is equal to your release's `tag_name`.

> [!TIP]
> If your executable is called `my-program-v2.0.0.exe`, the scope should be `std:my-program-[[VER]].exe` and your release's tag name should be exactly "`v2.0.0`". Do this for every platform scope you plan to add.

**_IF `SOURCE` EQUALS ANYTHING ELSE_**: **the PACKAGE NAME as defined in the package manager denoted by the SOURCE itself**. This must be the same unique name used for identifying the package when using the corresponding package manager.

By supporting all scopes, Konbini instantly becomes a superset of `apt`, `nix`, `brew`, `flatpak`, and `winget` at the same time, including packages from all registries _without needing additional setup_ - as they're trusted, and we thus do not require signatures or extra overhead.

## Releasing your package

To avoid making a PR for each version, we use GitHub/GitLab/Codeberg releases for package publishing. Once your manifest is uploaded, if the GitHub/GitLab/Codeberg repository was properly specified and you have at least one public (Konbini compliant) release, your package becomes instantly downloadable.

This means, once you PR the manifest file, you do not need to make changes to it, and just by making a GitHub/GitLab/Codeberg release (with proper [safety practices](#safety-requirements-for-publishing)), you are done. Your package's version are taken from the tag of the release.

> [!IMPORTANT]
> Not any release is valid, however. You need to follow the safety practices latterly described. To avoid added complexity, we recommend using GitHub actions for release, or a manually defined automation to generate required files.

## Safety requirements for publishing

> [!IMPORTANT] > **This is NOT required for aliased packages (those with a non-`std` source).**

Suppose a normal release of your package comes with these files attached:

```txt
my-app.linux64.AppImage
my-app.linuxARM.AppImage
my-app.macOs64
my-app.macOsARM
my-app.exe
```

Now you will need to add the following files to it:

```diff
 my-app.linux64.AppImage
+my-app.linux64.AppImage.asc
 my-app.linuxARM.AppImage
+my-app.linuxARM.AppImage.asc
 my-app.macOS64
+my-app.macOS64.asc
 my-app.macOsARM
+my-app.macOsARM.asc
 my-app.exe
+my-app.exe.asc

+konbini.hash.yaml
```

**You need to generate a PGP signature using the** _**same signature**_ **you used to generate the public key you initially uploaded to the author's registry.** Upload each file's signature using EXACTLY THE SAME NAME AND FILE EXTENSION, then appending `.asc` to it.

**You also need a konbini.hash.yaml file (a "hashfile") that looks like this** (but with real hashes, obviously):

```yaml
linux_64_sha: >-
    SOME-HASH-abcdefghijk...
linux_arm_sha: >-
    SOME-HASH-abcdefghijk...
mac_64_sha: >-
    SOME-HASH-abcdefghijk...
mac_arm_sha: >-
    SOME-HASH-abcdefghijk...
win64_sha: >-
    SOME-HASH-abcdefghijk...
```

Each platform you make a release for (you do not need to specify hashes for platforms you do not build for) should get its binary hashed, to assert its integrity upon download.

For generating a file hash, you should **use Konbini's builtin hasher (via `kbi kbd-hash <filepath>`), or any other tool capable of generating a `SHA3-512` hash**. SHA3-512 is not too widely used as of now (thus we ship Konbini with a builtin hasher), however it is the strongest SHA algorithm made yet, which is why we enforce its usage.

---

If all the steps above were properly followed (you PRed both manifest files, your signature, and made a GitHub/GitLab/Codeberg release with valid PGP signatures and SHA3-512 hashes), Konbini will be able to directly download your package's binaries and make them usable to users who download it.

Welcome to Konbini!
