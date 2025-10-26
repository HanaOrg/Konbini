# Konpak

**Konpak** (stylized short for _Konbini Package_) is an archive-based packaging format for distributing fully-contained applications—apps that include dependencies, icons, and other resources—all bundled into a single file.

These packages require **Konbini** to be installed _by default_. Self-extracting Konpaks ("SFX Konpaks") are possible for Windows and Linux.

We recommend Konpak for:

- Applications that ship with dependencies, requiring an installer or distributing on a ZIP file.
- GUI apps (for system integration).
- Distributing inside and outside of Konbini at the same time, via SFX Konpaks.

Konpak will automatically set up your app by:

- On **Windows**: Registering it in the system as an installed program (Start Menu + "Programs and Features" listing).
- On **Linux**: Creating a `.desktop` file for launcher integration.

All dependencies are stored alongside the main executable of the package, using Konbini's default installation route. In the future we will make this customizable on the user-end.

> [!TIP]
> To avoid issues with paths, just use paths relative to your executable in your code (`./lib/dependency1` instead of assuming stuff like `/usr/local/bin/my-app/lib/dependency1`).
> This is actually recommended for developing anywhere, not just with Konpaks.

## How it works

Konpak files are essentially ZIP archives, similar in spirit to `.deb` packages on Linux. When a user installs a Konpak file, Konbini extracts its contents, places everything in the appropriate location, and registers the app on the system.

- On **Linux**, this is straightforward, a `.desktop` file is created and filled up.
- On **Windows** however, it's more complex. Konbini performs a system-wide installation, using the HKLM registry hive, to add the app to the Start Menu and make it appear in “Programs and Features”. A basic uninstaller is also included.

> [!NOTE]
> On Windows, support for user-based (non-admin) installs is viable and planned for a future update.

As a fun fact, the complexity of Windows installers was actually the motivation behind creating Konpak. Konpaks are much simpler and faster to set up than MSI/MSIX/APPX or NSIS installers.

## Learn more

Check [this file](../../doc/konpak.md) for documentation and more information.
