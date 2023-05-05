# electron-trashfire-repair

This program patches [Signal-Desktop](https://github.com/signalapp/Signal-Desktop) to:
- [use `font-face: system-ui` instead of `font-face: Inter`](https://github.com/signalapp/Signal-Desktop/pull/2141)
- increase `font-size` and `line-height` slightly
- remove its `letter-spacing` adjustments
- make the "Notes to Self" badge grayscale so that it doesn't [look like you have new messages](https://github.com/signalapp/Signal-Desktop/issues/6339)
- remove the ~1 month build expiration timebomb

## Usage

First, install git, nodejs (18 or 20), and pnpm.

```
git clone https://github.com/ludios/electron-trashfire-repair
cd electron-trashfire-repair
pnpm install --ignore-scripts --no-optional
node patch-signal-desktop.js PATH_TO_SIGNAL_DESKTOP
```

where `PATH_TO_SIGNAL_DESKTOP` is e.g. `%LOCALAPPDATA%\\Programs\\signal-desktop`.

This will back up `resources/app.asar` to `resources/app.asar.orig` (if it doesn't already exist) and then patch and overwrite `resources/app.asar`.

## Annoyances not patched here that you can fix by other means

### [Media quality for images always resets to Standard](https://github.com/signalapp/Signal-Desktop/issues/5783)

Change the setting in the Preferences:

File -> Preferences... -> Chats -> Sent media quality -> High

### It has smooth scrolling

Add `--disable-smooth-scrolling` to the arguments in your Signal shortcut.

### The DevTools are missing

Add `--enable-dev-tools` to the arguments in your Signal shortcut.

### It doesn't GPU-accelerate its rendering on your ancient laptop

Add `--ignore-gpu-blocklist` to the arguments in your Signal shortcut.
