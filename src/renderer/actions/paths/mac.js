const fs = require("fs");
const path = require("path");

// FIXME: use the same platforms object as index.js
const platforms = {stable: "Discord", ptb: "Discord PTB", canary: "Discord Canary"};

export const getDiscordPath = function(releaseChannel) {
    return path.join("/Applications", `${releaseChannel}.app`, "Contents", "Resources");
};

export const validate = function(channel, proposedPath) {
    let resourcePath = "";
    const selected = path.basename(proposedPath);
    if (selected === `${platforms[channel]}.app`) resourcePath = path.join(proposedPath, "Contents", "Resources");
    if (selected === "Contents") resourcePath = path.join(proposedPath, "Resources");
    if (selected === "Resources") resourcePath = proposedPath;

    const executablePath = path.join(resourcePath, "..", "MacOS", platforms[channel]);
    if (fs.existsSync(executablePath)) return resourcePath;
    return "";
};