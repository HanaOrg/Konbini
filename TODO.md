<!-- markdownlint-disable md007 -->

# Stuff to do

> [!TIP]
> This file shows our overall plans short and long term. It's maintained by us only and PRs should not modify it.

## BEFORE RELEASE

- [x] Finish up CONTRIBUTING.md, RELEASES.md, and the documentation.
- [x] Update launchpad.
    - [x] Use package name only ("foo" and not "org.foobar.foo").
    - [x] Tell the user about the new shortcut.
    - [x] Create vendor-specific aliases (e.g. flatpak runs stuff as `flatpak x`).
- [x] Prohibit download of unsafe packages + show a warning on website.
- [x] Add LICENSE file.
- [x] Make the CLI check every day (cronjob / MSTaskScheduler) for updates to the guard file, and immediately block from the system any infected program, showing a warning upon execution. **(Untested on POSIX).**
- [x] Allow Konbini to install package managers under demand. **(Untested).**
- [x] Add CHANGELOGs. Linked to _Internal fetch sys_.
- [x] Replace GitHub API with KData API.
- [x] Add Konbini support to Konpaks. **(Untested).**
- [x] Make the frontend page more similar to Flathub's.
- [x] Refactor to use `org|usr.author.pkg` to identify packages.
- [x] Internal fetch sys. **LFG.**
    - This is, besides KGuard, when fetching all stuff, read the data and create files with structured JSON -> KData endpoints like `/category?v=PRODUCTIVITY` or so, and also limit amounts, to minimize HTTP requests, especially to GitHub. Make the following:
        - [x] Base logic.
        - [x] Sorting
            - [x] Most downloaded.
            - [x] Specific category.
            - [x] Recently updated.
            - [x] Make it provide per user apps too.
        - [x] Make KData and not GitHub provide manifests, with an endpoint that returns extended data, like read CHANGELOG + download amounts + install size + date of last update + date created, reducing requests.
- [x] Make webapp show errors if they happened instead of loading endlessly.
- [x] Replace stupid OS_VER with normal strings.
- [x] Fix KGuard. **LFG.**
- [x] Remove "`grab+`", you can still call it grabbing but since `:` is not allowed in package names, you can look for that to detect grabbing.

## IMMEDIATELY AFTER RELEASE

- [ ] Avoid launchpad duplications.
- [ ] Handle duplicate package names (for launchpad).
- [ ] **Priority.** Cache everything; cache locally too.
    - [ ] In exchange, perhaps lower cache duration? Now it doesn't depend on the GitHub API so...
- [ ] Make KBU script-based and not a fucking binary.
- [ ] Show more download count details (country, version, and date, all we collect).
- [ ] Add more links to manifests (report issue, get help, help translate, donate(VERIFIED ONLY)).
- [ ] Add more options for system requirements (graphics maybe).
- [ ] Add support for defined launchpad shortcuts, so e.g., a tool called `tool` could define `tl` as a valid CLI shortcut from their manifest file, and for feature "A", for example, `tla` which maps to `tool a`. Limit shortcuts to 20 perhaps.
    - If conflict, give the user the option to keep old one or new one.
- [ ] **Priority.** Support things other than standalone executables.
    - [ ] deb installers (gotta find out how, they're AR archives).
        - [ ] See `ar/` proj.
    - [ ] msi installers (CMD/`msiexec /i "FILE.msi" /quiet /norestart`).
    - [ ] msix installers (PS1/`Add-AppxPackage -Path "FILE.msix" -ForceApplicationShutdown -NoRestart`).
    - [ ] exe installers (just invoke them `.\installer.exe`, they have UI. this is what WinGet does.)
    - [ ] flatpak (via their CLI, knowing the [CDN](https://dl.flathub.org/repo/appstream/org.inkscape.Inkscape.flatpakref), or something)
- [ ] Improve Konpak.
    - [ ] Allow to define where does each thing go (maybe APPDATA or that kind of stuff).
    - [ ] Rewrite to Tauri to add GUI (Tauri supports CLI too, for "silent" install) and reduce bundle size.
        - Because of WebView this actually may increase bundle size... Having the user to download WV is an option tho. Anyway, just in case, consider other options.
        - Or perhaps a native rewrite? Best option (if I knew how to do that :/).
    - [ ] Think of more ideas...

## The rest

- [ ] Make the page mobile-friendly.
- [ ] Support closed source software (besides aliased), by defining URL based scopes.
    - e.g., `vnd:sample.com/downloads` (vnd of vendor? or something like that)
    - should follow the same scheme: `my-app.exe`, `my-app.exe.asc`, and `konbini.hash.yaml` should all be available from the same URL (in this case `sample.com/downloads/*`)
    - just as regular users, one user PR and then one PR per program should be enough
    - no HTTP prefix to be included, `https` will always be used
    - if the URL differs entirely from the organization / author URL, the PR should explain why do they differ, or it won't be accepted
