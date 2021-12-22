---
title: Installation
description: Instructions for downloading and installing the notion-enhancer.
order: 1
---

# Installation

The notion-enhancer works on MacOS, Linux and Windows.
It can be used within the desktop app or the web client
as a browser extension.

Due to system limitations, mobile clients are not and
will never be supported.

Once you've installed the notion-enhancer, read the
[Basic Usage](./basic-usage.md) page to get started with it.

> Note: though it is possible to have both vanilla Notion
> and enhanced Notion installed at once, running both at
> once may cause problems and should never be done.

## Browser Extension

Once installed, the browser extension should
update automatically.

### ![](../assets/icons/firefox.svg){.inline-icon .mr-1} Firefox →

Go to the [Firefox Add-on Store](//todo) and click "Add to Firefox".

### ![](../assets/icons/chrome.svg){.inline-icon .mr-1} Google Chrome, ![](../assets/icons/edge.svg){.inline-icon .mx-1} Microsoft Edge →

Go to the [Chrome Web Store](//todo) and click "Add to Chrome".

## notion-repackaged

notion-repackaged provides installable executables containing
both Notion and the notion-enhancer for all platforms.
This is the recommended method of installation.

Installations via notion-repackaged will need to be manually
updated with each new release of Notion and/or the notion-enhancer.

### ![](../assets/icons/windows.svg){.inline-icon .mr-1} Windows →

- Installer: [`.exe`](//todo)
- Portable build: [`.zip`](//todo)

### ![](../assets/icons/apple.svg){.inline-icon .mr-1} MacOS →

> Unfortunately, the M1 (arm64) build is currently non-functional
> due to a bug in the packager we depend on
> (see [electron-userland/electron-builder#5850](https://github.com/electron-userland/electron-builder/issues/5850)).
> This is not something we can currently fix.
> Until a solution is available, we recommend running the
> Intel build through Rosetta or using the browser extension instead.

- Intel installer: [`.dmg`](//todo)
- Portable Intel build: [`.zip`](//todo)

As it is a modified version of the Notion app,
it is unsigned. It may be detected as malware or
unable to be opened. To fix this, try following
[Apple's official instructions](https://support.apple.com/en-us/HT202491).

### ![](../assets/icons/tux.svg){.inline-icon .mr-1} Linux

Both `vanilla` and `enhanced` variants are available for Linux,
as there is no official vanilla Notion app for Linux-based operating
systems.

There are a number of installation methods available depending on the
distribution you are using. For a portable, distribution-agnostic build,
try one of the below:

- x86_64 build (vanilla): [`.AppImage`](//todo)
- x86_64 build (enhanced): [`.AppImage`](//todo)
- arm64 build (vanilla): [`.AppImage`](//todo)
- arm64 build (enhanced): [`.AppImage`](//todo)

- x86_64 build (vanilla): [`.zip`](//todo)
- x86_64 build (enhanced): [`.zip`](//todo)
- arm64 build (vanilla): [`.zip`](//todo)
- arm64 build (enhanced): [`.zip`](//todo)

#### ![](../assets/icons/debian.svg){.inline-icon .mr-1} Debian, ![](../assets/icons/ubuntu.svg){.inline-icon .mx-1} Ubuntu, ![](../assets/icons/pop-os.png){.inline-icon .mx-1} Pop!\_OS, ![](../assets/icons/linux-mint.svg){.inline-icon .mx-1} Linux Mint →

To add notion-repackaged to your package manager:

```
echo "deb [trusted=yes] https://apt.fury.io/notion-repackaged/ /" | sudo tee /etc/apt/sources.list.d/notion-repackaged.list
sudo apt update
```

The app can then be installed via:

```
sudo apt install notion-app-enhanced
// or
sudo apt install notion-app
```

Otherwise, you can download the `.deb` and install it manually:

- arm64 build (vanilla): [`.deb`](//todo)
- arm64 build (enhanced): [`.deb`](//todo)
- amd64 build (vanilla): [`.deb`](//todo)
- amd64 build (enhanced): [`.deb`](//todo)

```
sudo dpkg -i <downloaded file>.deb
```

#### ![](../assets/icons/fedora.svg){.inline-icon .mr-1} Fedora →

Add notion-repackaged to your package manager by creating the file
`/etc/yum.repos.d/notion-repackaged.repo` with the following contents:

```
[notion-repackaged]
name=notion-repackaged
baseurl=https://yum.fury.io/notion-repackaged/
enabled=1
gpgcheck=0
```

The app can then be installed via:

```
sudo dnf install notion-app-enhanced
// or
sudo dnf install notion-app
```

> `yum` may be used instead of `dnf`.

Otherwise, you can download the `.rpm` and install it manually:

- x86_64 build (vanilla): [`.rpm`](//todo)
- x86_64 build (enhanced): [`.rpm`](//todo)
- aarch64 build (vanilla): [`.rpm`](//todo)
- aarch64 build (enhanced): [`.rpm`](//todo)

```
sudo rpm -i <downloaded file>.rpm
```

#### ![](../assets/icons/arch-linux.svg){.inline-icon .mr-1} Arch Linux, ![](../assets/icons/manjaro.svg){.inline-icon .mx-1} Manjaro →

To install the app via package manager:

```
sudo pacman -Syu

sudo pacman -S notion-app-enhanced
// or
sudo pacman -S notion-app
```

Otherwise, you can download the `.rpm` and install it manually:

- x86_64 build (vanilla): [`.pacman`](//todo)
- x86_64 build (enhanced): [`.pacman`](//todo)
- aarch64 build (vanilla): [`.pacman`](//todo)
- aarch64 build (enhanced): [`.pacman`](//todo)

```
sudo pacman -U <downloaded file>.pacman
```

## Manual Enhancement

If you would prefer to apply the notion-enhancer
to an existing vanilla installation of Notion,
you can use the [notion-enhancer/desktop](https://github.com/notion-enhancer/desktop)
package directly.

Manual command-line installations will need to be re-applied
with each new release of Notion and/or the notion-enhancer.

> This is not available on Linux, but can be done through
> the Windows Subsystem for Linux in order to enhance the
> Windows app.

#### Prerequisites

- [Node.js](https://nodejs.org/en/) v16.0.0+
- A default installation of the [official Notion app](https://www.notion.so/desktop)

#### ![](../assets/icons/npm.svg){.inline-icon .mr-1} Enhancement →

1. Open a command line and install the
   [notion-enhancer NPM package](https://www.npmjs.com/package/notion-enhancer):

   ```
   npm i -g notion-enhancer
   // or
   yarn global add notion-enhancer
   ```

2. Insert the notion-enhancer into Notion:

   ```
   notion-enhancer apply
   ```

3. If you are using MacOS and experience any errors related
   to file permissions or corrupted/broken apps, run the following
   and then re-attempt step #2:
   ```
   sudo chmod -R a+wr /usr/local/lib/node_modules
   sudo chmod -R a+wr /usr/local/bin
   sudo chmod -R a+wr /Applications/Notion.app/Contents/Resources
   xcode-select --install
   codesign --force --deep --sign - /Applications/Notion.app
   ```
