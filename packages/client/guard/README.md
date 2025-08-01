# Konbini Guard

This folder contains an `avs.ts` file (AntiVirus Scan). If you run it locally, it'll generate a `guard.txt` file containing the cached data from your guard scan, in case you chose to run it again later.

## Requirements for running

- A Linux machine (preferably Debian, though any distribution should do). Otherwise, WSL.
- ClamAV installed.
- A not too high internet bill.

## What this does

This basically goes through every release that was not logged into the guard file, downloads all executable, ~~validates SHA hashes and GPA signatures~~, and scans them with ClamAV.

Then the results are written to the guard file, awaiting for human intervention in case a file was infected.

## Konbini's schedule

This is scheduled on [our own hardware](https://icecat.biz/rest/product-pdf?productId=16700539&lang=en) to run periodically. The frequency isn't fixed, but it's assured to run at least twice a month. See the automated commits to the `guard.txt` file.

You don't have to commit any updates to the `guard.txt` file by yourself. Run this script just for testing (if you want to), in case you wanted to contribute a fix or improvement (which we're REALLY thankful for!).
