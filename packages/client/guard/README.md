# Konbini Guard

"Konbini Guard" is a set of code scheduled to run on a schedule, updating data for the store and scanning all served binaries for security purposes.

## Requirements for running

These only apply if you're running the antivirus scan.

- A Linux machine (preferably Debian, though any distribution should do). Otherwise, WSL.
- ClamAV installed.
- A not too high internet bill.

## How it works

This basically goes through every package, downloads its manifest and CHANGELOG.md file, and updates certain .JSON files to later be automatically uploaded to our data server.

For _pure_ Konbini packages, it also downloads all executables, validates SHA hashes and GPA signatures, and scans them with ClamAV.

Then the results are written to the guard file, and if a package is infected, it'll also add its name to a list that Konbini is scheduled to query every hour, to notify the user.

The guard file is automatically committed and pushed for transparency purposes. It uses a fairly readable format:

```txt
KGuard Mon Aug 11 2025 17:02:21 GMT+0200 (Central European Summer Time) | Keeping Konbini safe
PACKAGE ID@VERSION@PLATFORM=STATUS FLAGS
...
```

Flags are pipe-separated keywords, allowing to instantly find infected packages even if the list grows large.

| Item         | Description                                                                                     | Keyword if good | Keyword if bad |
| ------------ | ----------------------------------------------------------------------------------------------- | --------------: | -------------: |
| Safety       | Whether the package was flagged secure by ClamAV or not.                                        |          `SAFE` |     `INFECTED` |
| Integrity    | Whether the package's Konbini hash is valid.                                                    |      `INTEGRAL` |    `CORRUPTED` |
| Authenticity | Whether the package's PGP signature is valid when tested against the author's public signature. |     `AUTHENTIC` |  `UNAUTHENTIC` |

## Konbini's schedule

This is scheduled on [our own hardware](https://icecat.biz/rest/product-pdf?productId=16700539&lang=en) to run periodically. Package data is updated every 48 hours. Antivirus scans happen on an irregular basis, but at least one per week is supposed to happen.

You don't have to commit any updates to the `guard.txt` file by yourself (and for trust reasons, PRs that modify it won't be accepted). You're only supposed to rn this script just for testing (if you want to), in case you wanted to contribute a fix or improvement (which we're REALLY thankful for!).
