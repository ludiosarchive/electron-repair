#!/usr/bin/env node

import path from "node:path";
import os from "node:os";
import { inspect } from "node:util";
import { promises as fs } from "node:fs";
import crypto from "node:crypto";
import asar from "@electron/asar";

// https://stackoverflow.com/questions/17699599/node-js-check-if-file-exists
function file_exists(path) {
    return fs.stat(path).then(() => true, () => false);
}

async function replace_in_file(path, replacements) {
    let content = await fs.readFile(path, 'utf8');
    for (const [matcher, replacement] of replacements) {
        const new_content = content.replace(matcher, replacement);
        if (new_content === content) {
            throw new Error(`Nothing in ${path} was changed when attempting ` +
                `to replace \n${inspect(matcher)} with \n${inspect(replacement)}`);
        }
        content = new_content;
    }
    await fs.writeFile(path, content, 'utf8');
}

// e.g. %LOCALAPPDATA%\Programs\signal-desktop
const signal_desktop_path = process.argv[2];
if (!signal_desktop_path) {
    throw new Error(`Required argument not given: path to Signal-Desktop directory, e.g. %LOCALAPPDATA%\\Programs\\signal-desktop`);
}
console.log(`Patching Signal-Desktop in ${signal_desktop_path} ...`);

const asar_path = path.join(signal_desktop_path, "resources", "app.asar");
if (!await file_exists(asar_path)) {
    throw new Error(`Expected file ${asar_path} to exist, but it does not.`);
}

const asar_orig_path = path.join(signal_desktop_path, "resources", "app.asar.orig");
if (!await file_exists(asar_orig_path)) {
    console.log(`Backing up \n  ${asar_path} -> \n  ${asar_orig_path} ...`);
    await fs.copyFile(asar_path, asar_orig_path);
} else {
    console.log(`Backup at ${asar_orig_path} already exists, not overwriting.`);
}

if (!await file_exists(`${asar_orig_path}.unpacked`)) {
    // A copy of the .unpacked directory that we have to make just for the asar module
    // to be able to extract. https://github.com/electron/asar/issues/71
    console.log(`Backing up \n  ${asar_path}.unpacked -> \n  ${asar_orig_path}.unpacked ...`);
    await fs.cp(`${asar_path}.unpacked`, `${asar_orig_path}.unpacked`, {recursive: true});
} else {
    console.log(`Backup at ${asar_orig_path}.unpacked already exists, not overwriting.`);
}

const extract_path = path.join(os.tmpdir(), `patch-signal-desktop-${crypto.randomUUID()}`);
console.log(`Extracting ${asar_orig_path} -> ${extract_path} ...`);
await asar.extractAll(asar_orig_path, extract_path);

// Signal-Desktop introduced a verified checkmark badge on "Notes to Self" to
// prevent someone from impersonating "Notes to Self", but the blue color matches
// the "new message" badge, making it look like you have a new message when you do not.
//
// Patch it to to make it grayscale.
//
// https://github.com/signalapp/Signal-Desktop/issues/6339
console.log(`Making the "Note to Self" badge grayscale ...`);
await replace_in_file(
    path.join(extract_path, "stylesheets", "manifest.css"), [
        [
            "\n.ContactModal__official-badge {\n",
            "\n.ContactModal__official-badge {\n  filter: grayscale(1);\n",
        ],
        [
            "\n.ContactModal__official-badge__large {\n",
            "\n.ContactModal__official-badge__large {\n  filter: grayscale(1);\n",
        ],
    ]
);

// Signal-Desktop people really like Inter, but system-ui (on Windows, Segoe UI)
// is a little easier to read by virtue of being crisper and more familiar.
console.log(`Fixing the typography ...`);
for (const css_file of ["manifest.css", "manifest_bridge.css"]) {
    await replace_in_file(
        path.join(extract_path, "stylesheets", css_file), [
            [
                /\bfont-family: Inter, [^;]+;/g,
                "font-family: system-ui, sans-serif; /* was Inter, ... */",
            ],
            [
                /\bfont-size: 14px;/g,
                "font-size: 15px; /* was 14px */",
            ],
            [   
                /\bline-height: 20px;/g,
                "line-height: 23px; /* was 20px */",
            ],
            [
                /\bletter-spacing: ([^;]+);/g,
                "/* was letter-spacing: $1; */",
            ],
        ]
    );
}

// Signal servers work with old builds for a very long time, but Signal-Desktop
// ships with a short (~31 day?) timebomb with each Signal-Desktop build that
// forces you to update frequently.
console.log(`Disabling the build expiration timebomb ...`);
await replace_in_file(
    path.join(extract_path, "preload.bundle.js"), [
        [
            "(buildExpiration, autoDownloadUpdate, now2) => {",
            "(buildExpiration, autoDownloadUpdate, now2) => { return false; /* no timebomb */",
        ],
    ]
);

console.log(`Writing patched archive to ${asar_path} ...`);
// Don't pack the .node files into the .asar; they need to go into .asar.unpacked/
// Note that asar archives include unpacked files in their metadata.
await asar.createPackageWithOptions(extract_path, asar_path, {unpack: "*.node"});

console.log(`Removing ${extract_path} ...`);
await fs.rm(extract_path, {recursive: true});
