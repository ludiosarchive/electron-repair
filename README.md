# electron-repair

This program patches [Signal-Desktop](https://github.com/signalapp/Signal-Desktop) to:
- make the "Notes to Self" badge grayscale instead of blue so that it doesn't [look like you have new messages](https://github.com/signalapp/Signal-Desktop/issues/6339)
- remove the ~1 month build expiration timebomb that suddenly prevents you from sending any messages
- [use `font-face: Inter Display` instead of `font-face: Inter`](https://github.com/rsms/inter/releases)
- increase `font-size` and `line-height` slightly
- remove `letter-spacing` adjustments
- reduce `font-weight` slightly on bold things
- reduce the brightness of message text to `rgb(216 216 216)`

This repository is CC0-licensed and can be used as a template for customizing other Electron programs.

## Usage

First, install git, nodejs (18 or 20), and pnpm.

```
git clone https://github.com/ludios/electron-repair
cd electron-repair
pnpm install --ignore-scripts --no-optional
node patch-signal-desktop.js PATH_TO_SIGNAL_DESKTOP
```

where `PATH_TO_SIGNAL_DESKTOP` is e.g. `%LOCALAPPDATA%\Programs\signal-desktop`.

This will back up `resources/app.asar` to `resources/app.asar.orig` (if it doesn't already exist) and then patch and overwrite `resources/app.asar`.

## Annoyances not patched here that you can fix by other means

### [Media quality for images always resets to Standard](https://github.com/signalapp/Signal-Desktop/issues/5783)

Change the setting in the Preferences:

File -> Preferences... -> Chats -> Sent media quality -> High

### Smooth scrolling is slower than desired

Add `--disable-smooth-scrolling` to the arguments in your Signal shortcut.

### DevTools are missing

Add `--enable-dev-tools` to the arguments in your Signal shortcut.

### Lack of GPU acceleration on your ancient laptop

Add `--ignore-gpu-blocklist` to the arguments in your Signal shortcut.
