const fs = require("fs");
const path = require("path");
import {remote} from "electron";
const semverRcompare = require("semver/functions/rcompare");
const semverValid = require("semver/functions/valid");

/** @typedef {{basedir: string, dir: string, version: string}} VersionPath  */

/**
 * @param {string} basedir 
 * @returns {VersionPath[]}
 */
const getDiscordVersionsForBaseDir = function(basedir) {
    return fs.readdirSync(basedir).filter(
                dir => 
                    fs.lstatSync(path.join(basedir, dir)).isDirectory() && // filter for directories
                    semverValid(dir.replace("app-","")) && // which have valid semver name (ignoring the app- prefix)
                    fs.existsSync(path.join(basedir, dir, "modules", "discord_desktop_core")) // that have a modules/discord_desktop_core folder
            ).map(
                dir => ({
                    basedir,
                    dir,
                    version: dir.replace("app-","")
                })
            );
};

// TODO: try some deduplication with the windows version
/**
 * @param {VersionPath[]} versions 
 * @returns {string} path
 */
const getHighestVersion = function(versions) {
    const highest = versions.sort((v1,v2)=>semverRcompare(v1.version,v2.version))[0];
    return path.join(highest.basedir, highest.dir, "modules", "discord_desktop_core");
};

export const getDiscordPath = function(releaseChannel) {
    const basedir = path.join(remote.app.getPath("appData"), releaseChannel.toLowerCase().replace(" ", ""));
    if (!fs.existsSync(basedir)) return "";
    
    const detectedVersions = getDiscordVersionsForBaseDir(basedir);
    console.debug(`Detected versions for channel "${releaseChannel}":`, detectedVersions);
    
    if (!detectedVersions.length) return "";

    return getHighestVersion(detectedVersions);
};

export const validate = function(channel, proposedPath) {
    if (proposedPath.includes("/snap/")) {
        remote.dialog.showErrorBox("BetterDiscord Incompatible", "BetterDiscord is currently incompatible with Snap installs of Discord. Support for snap installs is coming soon!");
        return "";
    }
    const channelName = platforms[channel].toLowerCase().replace(" ", "");

    let resourcePath = "";
    const selected = path.basename(proposedPath);
    if (selected === channelName) {
        const version = fs.readdirSync(proposedPath).filter(f => fs.lstatSync(path.join(proposedPath, f)).isDirectory() && f.split(".").length > 1).sort().reverse()[0];
        if (!version) return "";
        resourcePath = path.join(proposedPath, version, "modules", "discord_desktop_core");
    }
    if (semverValid(selected)) resourcePath = path.join(proposedPath, "modules", "discord_desktop_core");
    if (selected === "modules") resourcePath = path.join(proposedPath, "discord_desktop_core");
    if (selected === "discord_desktop_core") resourcePath = proposedPath;

    const asarPath = path.join(resourcePath, "core.asar");
    if (fs.existsSync(asarPath)) return resourcePath;
    return "";
};