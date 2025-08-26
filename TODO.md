<!-- markdownlint-disable md007 -->

# Stuff to do

> [!TIP]
> This file shows our overall plans short and long term.
> It's maintained by us only and PRs should not modify it.

## SHORT TERM / High priority

- [ ] Speed up startup by moving overhead to setup.
    - I mean, setup cronjobs and PATH from installer scripts, then rely on them existing. If they don't, and error will throw anyway.
- [ ] Cache everything; cache locally too.
    - [ ] In exchange, perhaps lower cache duration? Now it doesn't depend on the GitHub API so...
- [ ] Support things other than standalone executables.
    - [ ] deb installers (gotta find out how, they're AR archives).
        - [ ] (For internals): See `ar/` proj, includes code for DEB extraction. Works, somewhat.
    - [ ] msi installers **CMD/**`msiexec /i "FILE.msi" /quiet /norestart`.
    - [ ] msix installers **PS1/**`Add-AppxPackage -Path "FILE.msix" -ForceApplicationShutdown -NoRestart`.
    - [ ] exe installers, invoke them `.\installer.exe`, they have UI. this is what WinGet does.

## MID TERM / Mid priority

- [ ] Improve Konpak.
    - [ ] Allow to define where does each thing go (maybe APPDATA or that kind of stuff).
    - [ ] Different file extensions for Konpaks and SFX Konpaks outside of Windows.
    - [ ] Add the option to make GUI installers.
    - [ ] Rewrite to native and reduce bundle size.
        - Tauri (Rust, native) is easier, but because of WebView this actually may increase bundle size... Having the user to download WebView is an option, though.
        - Go seems like a better option, though the thing in general and specially the UI will be harder to figure out.
    - [ ] Make Konbini able to handle SFX Konpaks as regular ones.
- [ ] Avoid launchpad duplications.
- [ ] Make KBU script-based and not a fucking binary.

## LONG TERM / Low priority

- [ ] Make the page mobile-friendly.
- [ ] Support closed source software (besides aliased), by defining URL based scopes.
    - e.g., `vnd:sample.com/downloads` (vnd of vendor? or something like that)
    - should follow the same scheme: `my-app.exe`, `my-app.exe.asc`, and `konbini.hash.yaml` should all be available from the same URL (in this case `sample.com/downloads/*`)
    - just as regular users, one user PR and then one PR per program should be enough
    - no HTTP prefix to be included, `https` will always be used
    - if the URL differs entirely from the organization / author URL, the PR should explain why do they differ, or it won't be accepted
- [ ] Add support for defined launchpad shortcuts, so e.g., a tool called `tool` could define `tl` as a valid CLI shortcut from their manifest file, and for feature "A", for example, `tla` which maps to `tool a`. Limit shortcuts to 20 perhaps.
    - If conflict, give the user the option to keep old one or new one.
- [ ] Add more links to manifests (report issue, get help, help translate, donate(VERIFIED ONLY)).
- [ ] Add more options for system requirements (graphics maybe).
- [ ] Show more download count details (country, version, and date, all we collect).
- [ ] Improve Konpak even more.
    - [ ] Quiet installs.
    - [ ] Configurable installs (install location, enable/disable features, etc).
    - [ ] Enterprise-ish, reproducible installs.
        - Configure a Konpak once, then generate a pre-configured, quiet-by-default copy of the Konpak.
