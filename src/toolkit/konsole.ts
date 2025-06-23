/** Konbini's beautiful console logging. */
export namespace konsole {
    const R = Bun.color("white", "ansi-16m");

    /** Colors a CLI string. */
    export function clr(color: Bun.ColorInput, string: string, res: boolean = true) {
        return `${Bun.color(color, "ansi-16m")}${string}${res ? R : ""}`;
    }
    /** Logs an error. */
    export function err(...stuff: any[]) {
        console.error(clr("crimson", "[ X ]", false), ...stuff, R);
    }
    /** Logs a warning. */
    export function war(...stuff: any[]) {
        console.warn(clr("yellow", "[ ~ ]", false), ...stuff, R);
    }
    /** Logs an information / "debug" message. */
    export function dbg(...stuff: any[]) {
        console.debug(clr("grey", "[ D ]", false), ...stuff, R);
    }
    /** Logs a success message. */
    export function suc(...stuff: any[]) {
        console.log(clr("lightgreen", "[ ✓ ]", false), ...stuff, R);
    }
    /** Logs an advancement message (signaling a step out of many on whatever process is going on). */
    export function adv(...stuff: any[]) {
        console.log("[ > ]", ...stuff, R);
    }
    /** Asks the user for confirmation. */
    export function ask(question: string) {
        return confirm(clr("gold", `[ ? ] ${question}`));
    }
}
