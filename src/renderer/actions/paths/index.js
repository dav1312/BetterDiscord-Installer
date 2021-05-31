const fs = require("fs");
const path = require("path");
import {remote} from "electron";

import {validate as validateWindows, getDiscordPath as getWindowsDiscordPath} from "./windows";
import {validate as validateMac, getDiscordPath as getMacDiscordPath} from "./mac";
import {validate as validateLinux, getDiscordPath as getLinuxDiscordPath} from "./linux";

export const platforms = {stable: "Discord", ptb: "Discord PTB", canary: "Discord Canary"};
export const locations = {stable: "", ptb: "", canary: ""};

const getDiscordPath = function(releaseChannel) {
    let resourcePath = "";
    if (process.platform === "win32") {
        resourcePath = getWindowsDiscordPath(releaseChannel);
    }
    else if (process.platform === "darwin") {
        resourcePath = getMacDiscordPath(releaseChannel);
    }
    else {
        resourcePath = getLinuxDiscordPath(releaseChannel);
    }

    if (fs.existsSync(resourcePath)) {
        console.info(`Detected path "${resourcePath}" for channel "${releaseChannel}".`);
        return resourcePath;
    }
    return "";
};

for (const channel in platforms) {
    locations[channel] = getDiscordPath(platforms[channel]);
}

export const getBrowsePath = function(channel) {
    if (process.platform === "win32") return path.join(process.env.LOCALAPPDATA, platforms[channel].replace(" ", ""));
    else if (process.platform === "darwin") return path.join("/Applications", `${platforms[channel]}.app`);
    return path.join(remote.app.getPath("userData"), "..", platforms[channel].toLowerCase().replace(" ", ""));
};

export const validatePath = function(channel, proposedPath) {
    if (process.platform === "win32") return validateWindows(channel, proposedPath);
    else if (process.platform === "darwin") return validateMac(channel, proposedPath);
    return validateLinux(channel, proposedPath);
};
