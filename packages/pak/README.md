# Konpak

**Konpak** (short for *Konbini Package*) is an archive-based packaging format for distributing fully-contained applications—apps that include dependencies, icons, and other resources—all bundled into a single file. These packages require **Konbini** to be installed.

We recommend Konpak for:

- Applications with dependencies (to keep them self-contained)
- GUI apps (for system integration)

Konpak will automatically set up your app by:

- On **Windows**: Registering it in the system as an installed program (Start Menu + "Programs and Features" listing)
- On **Linux**: Creating a `.desktop` file for launcher integration

All dependencies are stored alongside the main executable of the package.

## How it works

Konpak files are essentially ZIP archives, similar in spirit to `.deb` packages on Linux. When a user installs a Konpak file, Konbini extracts its contents, places everything in the appropriate location, and registers the app on the system.

- On **Linux**, this is straightforward: create a `.desktop` file and you're done.
- On **Windows** however, it's more complex. Konbini performs a system-wide installation (using the HKLM registry), adds the app to the Start Menu, and makes it appear in “Programs and Features”. A proper uninstaller is also included.

> [!NOTE]
> On Windows, support for user-based (non-admin) installs is viable and planned for a future update.

As a fun fact, the complexity of Windows installers was actually the motivation behind creating Konpak. Konpaks are much simpler and faster to set up than MSI/MSIX/APPX or NSIS installers—with the *only* drawback being that Konpaks are not self-executable.
