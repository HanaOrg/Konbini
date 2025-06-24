# Konbini Guard

This folder contains an `avs.ts` file (AntiVirus Scan). If you run it locally, it'll generate a `*.guard.konbini` file containing the cached data from your guard scan, in case you chose to run it again later.

## Requirements for running

- A Linux machine (preferably Debian, though any distribution should do). Otherwise, WSL.
- ClamAV installed.
- A not too high internet bill.

## What this does

This basically goes through every release that was not logged into the Konbini Guard file, downloads all executable, ~~validates SHA hashes and GPA signatures~~, and scans them with ClamAV.

Then the results are written to the guard file, awaiting for human intervention in case a file was infected.

---

This is scheduled on our own hardware to run weekly, so you don't have to commit any updates to the `*.guard.konbini` file.
