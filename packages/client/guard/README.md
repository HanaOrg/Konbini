# Konbini Guard

"Konbini Guard" is a set of code scheduled to run on a schedule, updating data for the store and scanning all served binaries for security purposes.

## Requirements for running

- A Linux machine (preferably Debian, though any distribution should do). Otherwise, WSL.
- ClamAV installed.
- A not too high internet bill.

## What this does

This basically goes through every package, downloads its manifest and CHANGELOG.md file, and updates certain .JSON files to later be automatically uploaded to our data server.

For _pure_ Konbini packages, it also downloads all executables, ~~validates SHA hashes and GPA signatures~~, and scans them with ClamAV.

Then the results are written to the guard file, and if a package is infected, it'll also update all data-related endpoints to show a warning and block downloads, while waiting for human intervention.

## Konbini's schedule

This is scheduled on [our own hardware](https://icecat.biz/rest/product-pdf?productId=16700539&lang=en) to run periodically.

You don't have to commit any updates to the `guard.txt` file by yourself (and for trust reasons, PRs that modify it won't be accepted). You're only supposed to rn this script just for testing (if you want to), in case you wanted to contribute a fix or improvement (which we're REALLY thankful for!).
