<!-- markdownlint-disable md007 md028 md001 -->

# Becoming a developer and publishing packages

## Registering as a developer

Both profile registration and package registration are GitHub Pull Request-based. You open a single PR on the registry repository, and if it merges, you are automatically in. We manually review PRs to ensure only legitimate developers (and no scammers) join Konbini.

**Your Pull Request MUST comply with the following criteria**, where `USER` is your (unique) author name:

- Your PR **must include a `USER.yaml` file.** This is your "author manifest" and includes relevant info about you, following [this specification](#author-manifest-specification).
- Your PR **must include a `USER.asc` file IF publishing directly to Konbini.** This signature will be used to validate binaries of your package against it. **Each binary you distribute must be signed with this PGP key.**
    - If you **do not publish directly to Konbini**, meaning all your packages are aliased, you still need an author manifest but not a PGP signature.
    - For convenience, Konbini can automatically generate a compliant PGP signature, and make it faster to sign your executables with it. Run `kbi learn sign` from the Konbini CLI to learn to use it.
- Your PR **must be properly routed.** Files you make should be in a `/SCOPE/LEVEL/` directory.
    - The root of the repo contains two "scope" directories: `org/` and `usr/`. Use `usr/` if you are publishing software by yourself or `org/` if you are publishing software by an organization.
    - Inside `org/` or `usr/`, you'll find "level" subdirectories named using the first two letters of any existing username. If your `USER` is called "foobar", for example, you should contribute your files to `fo/foobar.*` (well, `usr/fo/foobar.*` or `org/fo/foobar.*`, more precisely).
- Your PR **must use lowercase for all filenames.** Unix systems differentiate `foobar.file` and `Foobar.file` - and we use filenames to define usernames. This could lead to `usr.foobar` and `usr.Foobar` existing as separate users, therefore your filenames must be entirely lowercase.

### Author manifest specification

Depending on whether the manifest is for a USER or an ORGANIZATION, two different specifications apply. Below proceed both specifications in the format of YAML files - **same format you'll use to create them**. After each key, the data type is provided.

> [!IMPORTANT]
> **In both manifest files**, `name` defines your DISPLAY name, not username. Your username is filesystem based and follows a `scope.username` format. If your manifest file is called `foobar.yaml` and exists in the `org/` directory, your unique author ID is `org.foobar`; and if your package's manifest file is `foo.yaml`, your package's unique ID is `foo`.
>
> **Manifest filenames (and thus package and user IDs) must be of at least two characters.**

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
# Your biography - a text visible inside your profile.
biography: string # (optional)
# Whether you're for hire or not.
for_hire: boolean # (optional)
# Your socials, if any.
socials: # (optional - inner props are all optional too)
    # Twitter handle, without the AT (@) symbol.
    twitter: string
    # Bluesky handle, without the AT (@) symbol.
    bluesky: string
    # Instagram handle, without the AT (@) symbol.
    instagram: string
    # GitHub username
    github: string
    # GitLab username
    gitlab: string
```

#### Organization manifest

```yaml
# Your organization's name.
name: string
# Your organization's website.
website: string
# Your organization's email.
email: string
# Whether it's a private, non profit, public, or collab organization. Required for transparency purposes.
# For other types of organizations, use `OTHER`, as some organizations are hard to catalog.
type: "PRIVATE_CORP" OR "NON_PROFIT" OR "GOVT_ORG" OR "COLLAB_ORG" OR "OTHER"
# Your organization's biography - a text visible inside your profile.
socials: # Your organization's socials, if any. Optional - inner props are all optional too.
    # Twitter handle, without the AT (@) symbol.
    twitter: string
    # Bluesky handle, without the AT (@) symbol.
    bluesky: string
    # Instagram handle, without the AT (@) symbol.
    instagram: string
    # GitHub username
    github: string
    # GitLab username
    gitlab: string
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
    linuxArm: null | KPS
    # 64-bit / Intel macintoshOS KPS.
    mac64: null | KPS
    # ARM / Apple Silicon macintoshOS KPS.
    macArm: null | KPS
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
author: AUTHOR_ID

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

Where `AUTHOR_ID` is your author ID as previously defined (`scope.username`), `KPS` is a [Konbini Package Scope](./kps.md), and `LICENSE` is one of the following codes:

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

## Releasing your package

To avoid making a PR for each version, we use GitHub/GitLab/Codeberg releases for package publishing. Once your manifest is uploaded, if the GitHub/GitLab/Codeberg repository was properly specified and you have at least one public (Konbini compliant) release, your package becomes instantly downloadable.

This means, once you PR the manifest file, you do not need to make changes to it, and just by making a GitHub/GitLab/Codeberg release (with proper [safety practices](#safety-requirements-for-publishing)), you are done. Your package's version are taken from the tag of the release.

> [!IMPORTANT]
> Not any release is valid, however. You need to follow the safety practices latterly described. To avoid added complexity, we recommend using GitHub actions for release, or a manually defined automation to generate required files.

## Safety requirements for publishing

> [!IMPORTANT]
> **This is NOT required for aliased packages (those with a non-`kbi` source).**

Suppose a normal release of your package comes with these files attached:

```txt
my-app.linux64.AppImage
my-app.linuxArm.AppImage
my-app.mac64
my-app.macArm
my-app.exe
```

Now you will need to add the following files to it:

```diff
 my-app.linux64.AppImage
+my-app.linux64.AppImage.asc
 my-app.linuxArm.AppImage
+my-app.linuxArm.AppImage.asc
 my-app.mac64
+my-app.mac64.asc
 my-app.macArm
+my-app.macArm.asc
 my-app.exe
+my-app.exe.asc

+konbini.hash.yaml
```

**You need to generate a PGP signature using the** _**same signature**_ **you used to generate the public key you initially uploaded to the author's registry.** Upload each file's signature using EXACTLY THE SAME NAME AND FILE EXTENSION, then appending `.asc` to it.

**You also need a konbini.hash.yaml file (a "hashfile") that looks like this** (but with real hashes, obviously):

```yaml
linux64: SOME-HASH-abcdefghijk...
linuxArm: SOME-HASH-abcdefghijk...
mac64: SOME-HASH-abcdefghijk...
macArm: SOME-HASH-abcdefghijk...
win64: SOME-HASH-abcdefghijk...
```

Each platform you make a release for (you do not need to specify hashes for platforms you do not build for) should get its binary hashed, to assert its integrity upon download.

> [!TIP]
> For generating hashes, **use Konbini's builtin hasher (via `kbi hash`)**, and for generating signatures, **use Konbini's builtin signer (via `kbi sign`)**.

---

If all the steps above were properly followed (you PRed both manifest files, your signature, and made a GitHub/GitLab/Codeberg release with valid PGP signatures and SHA3-512 hashes), Konbini will be able to directly download your package's binaries and make them usable to users who download it.

Welcome to Konbini!
