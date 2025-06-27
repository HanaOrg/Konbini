#!/bin/bash

# borrowed from https://fuckingnode.github.io/install.sh

# error handling
set -e
set -u

# constants
PACKAGES_DIR="/usr/local/kbi/exe"

# get platform so we know what to install
get_platform_arch() {
    case "$(uname -s)" in
    Darwin)
        case "$(uname -m)" in
        arm64)
            echo "macos_arm"
            ;;
        x86_64)
            echo "macos64"
            ;;
        *)
            echo "Unsupported macOS architecture."
            exit 1
            ;;
        esac
        ;;
    Linux)
        case "$(uname -m)" in
        armv7l)
            echo "linux_arm"
            ;;
        x86_64)
            echo "linux64"
            ;;
        *)
            echo "Unsupported Linux architecture."
            exit 1
            ;;
        esac
        ;;
    *)
        echo "Unsupported operating system, are you on TempleOS or wth?"
        exit 1
        ;;
    esac
}

ARCH=$(get_platform_arch)

# get url
get_latest_release_url() {
    local TARGET=$1 # "kbi" or "kbu"

    URL=$(curl -s "https://api.github.com/repos/HanaOrg/Konbini/releases/latest" |
        grep -o '"browser_download_url": "[^"]*' |
        grep "$ARCH" |
        grep "$TARGET" |
        grep -v "\.asc" |
        sed 's/"browser_download_url": "//')

    if [ -z "$URL" ]; then
        echo "No matching file found for $ARCH. This is likely our fault for not properly naming executables, please raise an issue."
        exit 1
    fi

    echo "$URL"
}

# install
install_app() {
    local TARGET=$1 # the same
    echo "Fetching latest release for $TARGET $ARCH from GitHub..."
    local url=$(get_latest_release_url $TARGET)
    echo "Fetched successfully."
    echo "Downloading..."
    sudo mkdir -p "$PACKAGES_DIR"
    sudo curl -L "$url" -o "$PACKAGES_DIR/$TARGET"
    sudo chmod +x "$PACKAGES_DIR/$TARGET"
    echo "Downloaded successfully to $PACKAGES_DIR/$TARGET"
}

# add app to path
add_app_to_path() {
    echo "Adding executables to PATH..."

    if [ -z "$PACKAGES_DIR" ]; then
        echo "Install directory is undefined or empty."
        exit 1
    fi

    # check if it's already in PATH
    if [[ ":$PATH:" == *":$PACKAGES_DIR:"* ]]; then
        echo "$PACKAGES_DIR is already in PATH. No changes made."
        return
    fi

    # define target files
    FILES=("$HOME/.bashrc" "$HOME/.bash_profile" "$HOME/.profile")

    # append to each file if it exists and doesn't already contain the entry
    for file in "${FILES[@]}"; do
        if [ -f "$file" ]; then
            if ! grep -q "export PATH=\"$PACKAGES_DIR:\$PATH\"" "$file"; then
                echo "export PATH=\"$PACKAGES_DIR:\$PATH\"" >>"$file"
                MODIFIED=true
            else
                echo "$PACKAGES_DIR is already in $file."
            fi
        fi
    done

    # apply changes if any file was modified
    if [ "$MODIFIED" = true ]; then
        source "$HOME/.profile" 2>/dev/null
        source "$HOME/.bashrc" 2>/dev/null
        source "$HOME/.bash_profile" 2>/dev/null
        echo "Successfully added $PACKAGES_DIR to PATH."
    else
        echo "No config files were modified."
    fi
}

# installer itself
installer() {
    echo "[ > ] Hi! We'll install Konbini ($ARCH edition) for you. Just a sec!"
    echo "[ W ] Please note we'll use sudo for this process."
    install_app
    add_app_to_path
    echo "[ > ] Installed successfully! Restart your terminal, then run 'kbi' to get started."
    echo "Thank you for installing!"
}

# less go
installer
