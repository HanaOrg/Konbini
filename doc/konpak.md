# Konpak

Konpaks are basically app bundles made by Konbini. They're meant to be a simple way to bundle apps that depend on assets or DLLs.

As of now they're highly experimental and lack some basic features, but they're already capable of becoming self-extractable for Windows and Linux + "integrate" themselves (list your package as an installed programs, add itself to the Windows Start Menu, have an uninstaller, a proper icon...).

Refer to TODO.md at the root of this repo for info on what we plan to add / change from Konpaks.

## Usage

Use the Konbini CLI to bundle a Konpak. You need a Konbini manifest, an icon (.ico for Windows, .png for Linux), and a main executable. Put all of that in the same folder, and put any dependency, DLL, or whatever you want to bundle your app with inside of the same directory. Anything that isn't the aforementioned "important" files will be considered a file your program depends on.

> As of now, all dependencies are stored in the same path as your binary (we thought about it this way so you can get the path of the current executable and use its directory for any of your dependencies).
>
> While we think this works well enough, we also plan to support specifying specific folders like APPDATA for you to indicate where does each file go.

Once everything's in the folder, run the following (with the real data, of course):

```sh
kbi konpak PATH_TO_FOLDER --platform=PLATFORM --id=ID --icon=ICON --binary=BINARY --ver=VERSION
```

- PLATFORM: `windows` or `linux`.
- ID: Package ID. E.g., `usr.me.my-app`.
- ICON: Filename, with extension but without directory, of the icon file.
- BINARY: Filename, with extension but without directory, of the main binary of your app.
- VER: App version. Can be any string, but avoid spaces.

By default, Konpaks result in a file that only Konbini can extract. You will be presented with the optional to make it self-extractable (SFX), though.

> [!NOTE]
> SFX Konpaks are 100 MB more in filesize.

The non-SFX Konpak will be created before this prompt is shown, anyway. It uses the `.kpak` file extension.

> [!WARNING]
> While on Windows SFX Konpaks end with `.kpak.exe`, both SFX and non-SFX Konpaks end with `.kpak` on Linux. We'll figure this out later on.

## How it works

Konpaks work like DEB files; they're an archive under the hood. ZIP archives, more precisely. A KPAK file is basically a ZIP file with a `KPAK` header prepended to the file.

An SFX Konpak is the above file appended to a binary with the code to extract _any_ Konpak. Its instructed to read itself and seek the last instance of `KPAK` (which should be this header), then read anything after it as a regular ZIP.

## Limitations

- Konpaks are not expected to work on macOS.
- As mentioned, regular and SFX Konpaks use the same file extension on Linux.
- Konbini cannot recognize SFX Konpaks, so a SFX Konpak cannot be used for a Konbini release.
- On Windows, when installing Konbini (required for locally running non-SFX Konpaks), the "Choose default app" modal pops up the first time, and looks weird.
- It's an overall incomplete and unstable system (for now, of course).
