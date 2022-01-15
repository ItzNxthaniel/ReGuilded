import reGuildedInfo from "../common/reguilded.json";
import { stream } from "got";
import { createWriteStream, statSync, constants, accessSync } from "fs-extra";
import { join } from "path";

export default async function handleUpdate(updateInfo: VersionJson) {
    const downloadUrl = updateInfo.assets[0].browser_download_url;
    const zipPath = join(__dirname, "ReGuilded.zip");

    return new Promise<void>(async (resolve, reject) => {
        await new Promise<void>((zipResolve) => {
            stream(downloadUrl)
                .pipe(createWriteStream(zipPath))
                .on("finish", async function () {
                    console.log("Download Finished");
                    
                    // UNZIP LOGIC HERE.

                    zipResolve();
                });
        });

        resolve()
    });
}

export type AssetObj = {
    browser_download_url: string,
    name: string
}

export type VersionJson = {
    version: string;
    assets: Array<AssetObj>;
};

export async function checkForUpdate(): Promise<[boolean, VersionJson]> {
    return new Promise<VersionJson>((resolve, reject) => {
        fetch("https://api.github.com/repos/ItzNxthaniel/ReGuilded/releases/latest").then(response => response.json(), e => reject(e)).then(json => {
            resolve({
                version: json.tag_name,
                assets: json.assets
            });
        });
    }).then(json => [(window.updateExists = json.version !== reGuildedInfo.version), (window.latestVersionInfo = json)])
}