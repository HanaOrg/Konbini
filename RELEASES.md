# Konbini releases

Konbini releases follow a simple, predictable format. Each component appears five times, in the form of `[module name]-[platform]`.

There are three modules (two required); KBI, KBU, and KPAK SFX. KBI is Konbini itself, KBU is the updater, and KPAK SFX is an optional module for creating self extracting Konpaks.

```txt
kbi-win64.exe
kbi-linux-x64
...
kbu-win64.exe
...
kpak-sfx-win64.exe
...
```

All releases include PGP signatures and hashes. While not published to Konbini, these follow the Konbini format (a YAML hashfile then a signature file for each binary, being our public signature the same `org.hana` uses for Konbini).

The hashfile isn't fully Konbini compliant though, as the keys are different (since there's more than one hash per platform). Keys look like this:

```yaml
kbi_win64: HASH
# ...
kbu_win64: HASH
# ...
```
