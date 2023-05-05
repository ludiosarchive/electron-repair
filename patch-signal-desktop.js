#!/usr/bin/env node

import path from "node:path";
import fs from "node:fs";

// e.g. %LOCALAPPDATA%\Programs\signal-desktop
const signal_desktop_path = process.argv[2];
console.log(`Patching Signal-Desktop in ${signal_desktop_path} ...`);

const asar_path = path.join(signal_desktop_path, "resources", "app.asar");
if (!fs.existsSync(asar_path)) {
    throw new Error(`Expected file ${asar_path} to exist, but it does not.`);
}

const asar_orig_path = path.join(signal_desktop_path, "resources", "app.asar.orig");
if (!fs.existsSync(asar_orig_path)) {
    console.log(`Backing up \n${asar_path} to \n${asar_orig_path} ...`);
    fs.copyFileSync(asar_path, asar_orig_path);
} else {
    console.log(`Backup at ${asar_orig_path} already exists, not overwriting.`);
}
