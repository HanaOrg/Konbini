<!-- markdownlint-disable md007 -->

# Stuff to do

> [!TIP]
> This file shows our overall plans short and long term. It's maintained by us only and PRs should not modify it.

## SHORT TERM (Mid/High priority)

- [ ] **High Priority.** Cache everything; cache locally too.
    - [ ] In exchange, perhaps lower cache duration? Now it doesn't depend on the GitHub API so...
- [ ] **High Priority.** Support things other than standalone executables.
    - [ ] deb installers (gotta find out how, they're AR archives).
        - [ ] (For internals): See `ar/` proj, includes code for DEB extraction. Works, somewhat.
    - [ ] msi installers **CMD/**`msiexec /i "FILE.msi" /quiet /norestart`.
    - [ ] msix installers **PS1/**`Add-AppxPackage -Path "FILE.msix" -ForceApplicationShutdown -NoRestart`.
    - [ ] exe installers, invoke them `.\installer.exe`, they have UI. this is what WinGet does.
- [ ] Improve Konpak.
    - [ ] Allow to define where does each thing go (maybe APPDATA or that kind of stuff).
    - [ ] Different file extensions for Konpaks and SFX Konpaks outside of Windows.
    - [ ] Rewrite to Tauri to add GUI (Tauri supports CLI too, for "silent" install) and reduce bundle size.
        - Because of WebView this actually may increase bundle size... Having the user to download WV is an option tho. Anyway, just in case, consider other options.
        - Or perhaps a native rewrite? Best option (if I knew how to do that :/).
    - [ ] Make Konbini able to handle SFX Konpaks as regular ones.
- [ ] Avoid launchpad duplications.
- [ ] Make KBU script-based and not a fucking binary.

## MID/LONG TERM (Low priority)

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
