import { listPackages } from "./list";
import { installPackage } from "./install";
import { konsole } from "shared/client";

export async function updatePackages() {
    const packages = await listPackages("SILENT");

    for (const pkg of packages) {
        await installPackage(pkg.pkg, "update");
    }

    konsole.suc(`Successfully updated all (${packages.length}) your packages!`);
}
