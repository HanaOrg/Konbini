# Konbini Guard

"Konbini Guard" is a set of code scheduled to run on a schedule, updating data for the store and scanning all served binaries for security purposes.

## Requirements for running

Only if you're running the antivirus scan:

- A Linux machine (preferably Debian, though any distribution should do). Otherwise, WSL2.
- ClamAV installed.

Overall:

- A not too high internet bill (this is intense).

## How it works

This basically goes through every package, downloads its manifest and CHANGELOG.md file (if any), and updates certain JSON files to later be automatically uploaded to our data server.

For _pure_ Konbini packages, it also downloads all executables, validates SHA hashes and GPA signatures, and scans them with [ClamAV](https://github.com/Cisco-Talos/clamav/).

Then the results are written to the `guard.txt` file. Results are available from Konbini's API, from an endpoint that Konbini is scheduled to query every day, to automatically remove the package and notify the user.

The guard file itself is also committed for transparency purposes. It uses a fairly readable format:

```txt
KGuard Mon Aug 11 2025 17:02:21 GMT+0200 (Central European Summer Time) | Keeping Konbini safe
PACKAGE-ID@VERSION@PLATFORM=FLAGS
...
```

Flags are pipe-separated keywords, allowing to instantly search for invalid packages even if the list grows large.

| Item         | Description                                                                               | Keyword if good | Keyword if bad |
| ------------ | ----------------------------------------------------------------------------------------- | --------------: | -------------: |
| Safety       | Whether the package was flagged secure by ClamAV or not.                                  |          `SAFE` |     `INFECTED` |
| Integrity    | Whether the package's Konbini hash is valid.                                              |      `INTEGRAL` |    `CORRUPTED` |
| Authenticity | Whether the package's signature matches the author's public one. |     `AUTHENTIC` |  `UNAUTHENTIC` |

## Konbini's schedule

This is scheduled to run periodically on a GitHub Action every 48 hours.

You're not supposed to commit updates to the `guard.txt` file by yourself (and for trust reasons, PRs that modify it won't be accepted). You should only run this script for testing ot, in case you wanted to contribute a fix or improvement (which we're REALLY thankful for!).
