# Stuff to do

> [!TIP]
> This file shows our overall plans short and long term.
> It's maintained by us only and PRs should not modify it.

## SHORT TERM / High priority

Items with a **!** must be done before release.

- [ ] **!** Allow users to disable/"prohibit" certain package managers.
- [ ] Cache everything; cache locally too.
    - [ ] In exchange, perhaps lower cache duration? Now it doesn't depend on the GitHub API so...
- [ ] Support things other than standalone executables.
    - [ ] deb installers (gotta find out how, they're AR archives).
        - [ ] (For internals): See `ar/` proj, includes code for DEB extraction. Works, somewhat.
    - [ ] msi installers **CMD/**`msiexec /i "FILE.msi" /quiet /norestart`.
    - [ ] msix installers **PS1/**`Add-AppxPackage -Path "FILE.msix" -ForceApplicationShutdown -NoRestart`.
    - [ ] exe installers, invoke them `.\installer.exe`, they have UI. this is what WinGet does.
- [ ] Support release schema overrides.
    - [ ] HASH override (`hashfile`(default), `sumsfile`(common SHA256SUMS file), `gh256`(use github's SHA256 HASH), `inline`(inline in the release's description, like [this example](https://github.com/danirod/cartero/releases/tag/v0.2.4), will require a specific \`\`\`lang\`\`\` to be specified for it to work))
    - [ ] Signature override (specify specific filenames for each signature)
- [ ] Support ZIP and TAR archives as downloadable.
    - [ ] Must've been validated by KGuard (TODO: add a field in results for that).
    - [ ] If it's a single file contained in a ZIP, behave as a regular install. Else, behave as a KPAK.
        - Allow for deeper config just in case.
- [ ] Support integration for bare (non-KPAK) installs.

## MID TERM / Mid priority

- [ ] Improve Konpak.
    - [ ] Allow to define where does each thing go (maybe APPDATA or that kind of stuff).
    - [ ] Different file extensions for Konpaks and SFX Konpaks outside of Windows.
    - [ ] Add the option to make GUI installers.
    - [ ] Rewrite to native and reduce bundle size.
        - Probably will use Golang, though the thing in general and specially the UI will be hard to figure out.
    - [ ] Make Konbini able to handle SFX Konpaks as regular ones.

## LONG TERM / Low priority

- [ ] Make the page mobile-friendly.
- [ ] Support closed source software (besides aliased), by defining URL based scopes.
    - e.g., `vnd:sample.com/downloads` (vnd of vendor? or something like that)
    - should follow the same scheme: `my-app.exe`, `my-app.exe.asc`, and `konbini.hash.yaml` should all be available from the same URL (in this case `sample.com/downloads/*`)
    - just as regular users, one user PR and then one PR per program should be enough
    - no HTTP prefix to be included, `https` will always be used
    - if the URL differs entirely from the organization / author URL, the PR should explain why do they differ, or it won't be accepted
- [ ] Add support for defined launchpad shortcuts, so e.g., a tool called `tool` could define `tl` as a valid CLI shortcut from their manifest file, and for feature "A", for example, `tla` which maps to `tool a`.
    - Set a per-package limit.
    - If conflict, give the user the option to keep old one or new one.
    - [ ] Maybe allow users to create their own shortcuts to things they use the most with their apps?
- [ ] Add more links to manifests (report issue, get help, help translate, donate(VERIFIED ONLY)).
- [ ] Add more options for system requirements (graphics maybe).
- [ ] Show more download count details (country, version, and date, all we collect).
- [ ] Improve Konpak even more.
    - [ ] Quiet installs.
    - [ ] Configurable installs (install location, enable/disable features, etc).
    - [ ] Enterprise-ish, reproducible installs.
        - Configure a Konpak once, then generate a pre-configured, quiet-by-default copy of the Konpak.
