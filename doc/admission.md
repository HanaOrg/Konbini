# Package admission criteria

We'll initially review and test your application before admitting it into the store. The following criteria needs to be met.

## Apps cannot be unfinished

An app must be usable in order to be published. This means that its very base feature is properly implemented and usable. Beyond that, "work-in-progress" apps that plan to further implement stuff are allowed, but the base idea that the app markets must be usable and stable.

## Apps cannot be "insignificant"

Extremely simple apps, apps with very little functionality, or forks of apps with minimal modification won't be accepted.

## Apps must be apps

You cannot distribute apps that aren't purposed to be "apps". Better understood with an example: an "app" that is only a documentation for something, an "app" that is only serving media files glued with a binary, an "app" that is just an extension for the shell/WM/DE/etc...; aren't considered valid apps.

## Apps must not be duplicate

Duplicate submissions are not allowed. Same app distributed under different technology (e.g. trying to offer `usr.foo.my-app-qt` and `usr.foo.my-app-gtk`) aren't allowed.

## Apps must not be prehistoric

For security, we won't accept apps built on deprecated/EOL technology (we'll review the source code for that).

Forks of deprecated applications where the developer intends to maintain it will be accepted, but there must be already a minimal modification made to said application, including updating its stack to non-EOL technology if the app initially was running on it.

## Apps must not interfere with system security

The kind of apps that ask for system's antivirus (especially on Windows) to be disabled, or that get flagged by it, will be rejected, unless a very valid and verifiable explanation to things like Windows Defender interfering can be provided.

Privileged access (via elevation on Windows and sudo on Linux) should be either clear enough for the user to automatically understand its purpose or properly explained by the author.

---

If all of this criteria is met, your app will be able to join Konbini.
