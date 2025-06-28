import { LOG_ACTION } from "shared/db";

console.log(
    await LOG_ACTION({
        app_id: "fuckingnode",
        action: "dwn",
    }),
);
console.log("works?");
process.exit(0);
