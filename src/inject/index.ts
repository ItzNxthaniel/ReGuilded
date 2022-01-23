import platform from "./util/platform";
import { resolve, join } from "path";
import { exec, spawnSync } from "child_process";
import * as tasks from "./tasks.js";
import minimist from "minimist";

const argv: { _: string[]; d?: string; dir?: string; e?: string; doas?: boolean; elevator?: string } = minimist(
    process.argv.slice(2)
);

(async function () {
    // Directory to install ReGuilded configuration to
    const dir = argv.d || argv.dir,
        elevator = argv.e || argv.elevator || (argv.doas ? "doas" : "sudo"),
        [taskArg] = argv._;

    // If task argument is null, return error
    if (taskArg === undefined) throw new Error("First argument expected");
    console.log("Performing task", taskArg);

    if (dir !== undefined && typeof dir !== "string") throw new TypeError("Argument -d or --dir must be a string");

    if (tasks[taskArg] !== null) {
        const restartNeeded = taskArg === (
            "injectbare" ||
            "inject" ||
            "uninjectbare" ||
            "uninject"
        );

        // Only close Guilded if the arguments are Injection or Uninjection related.
        await new Promise<void>((resolve) => {
            if (restartNeeded) {
                console.log("Force closing Guilded");
                exec(platform.close).on("exit", resolve);
            } else resolve()
        });

        // Creates path for ReGuilded
        const reguildedPath = resolve(
            dir || process.platform === "linux"
                ? "/usr/local/share/ReGuilded"
                : join(process.env.APPDATA || process.env.HOME, ".reguilded")
        );

        await tasks[taskArg](platform, reguildedPath, elevator)
            .then(() => {
                if (restartNeeded) {
                    console.info("The task is done, and you can restart your guilded.")
                }
            })
            .catch(err => {
                console.error("Failed to do task", taskArg, ":", err);
            });
    } else console.error("Unknown task", taskArg);
})();
