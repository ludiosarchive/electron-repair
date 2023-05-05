#!/usr/bin/env node

import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import crypto from "node:crypto";
import asar from "@electron/asar";

// e.g. %LOCALAPPDATA%\Programs\signal-desktop
const signal_desktop_path = process.argv[2];
if (!signal_desktop_path) {
    throw new Error(`Required argument not given: path to Signal-Desktop directory, e.g. %LOCALAPPDATA%\\Programs\\signal-desktop`);
}
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

const extract_path = path.join(os.tmpdir(), `patch-signal-desktop-${crypto.randomUUID()}`);
console.log(`Extracting ${asar_path} to ${extract_path} ...`);
await asar.extractAll(asar_path, extract_path);
