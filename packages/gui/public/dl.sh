#!/bin/bash
# borrowed from https://fuckingnode.github.io/install.sh

# error handling
set -e
#set -u

# constants
PACKAGES_DIR="$HOME/exe"
LAUNCHPAD_DIR="$HOME/launchpad"

# get where we are so it knows what to use
get_platform_arch() {
    case "$(uname -s)" in
    Darwin)
        case "$(uname -m)" in
        arm64)
            echo "macArm"
            ;;
        x86_64)
            echo "mac64"
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
            echo "linuxArm"
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

remove_if_needed() {
    if [[ "$1" =~ ^[0-9]+$ ]]; then
        kill -9 $1 2>/dev/null
        rm -f "$PACKAGES_DIR/kbi"
    fi
}

setup_cronjob() {
    echo "[ i ] Setting up CRONJOB"
    # TODO: macOS now prefers launchd over crontab
    # https://support.apple.com/guide/terminal/script-management-with-launchd-apdc6c1077b-5d5d-4d35-9c19-60f2397b2369/mac

    PREV_CJ=$(crontab -l)
    JOB="15 * * * * $PACKAGES_DIR/kbi ensure-security"

    if [[ $PREV_CJ == *"$JOB"* ]]; then
        echo "CRONJOB seems to already exist (probably an update). Not modifying."
        return
    fi

    # TODO: fails if the user doesn't have a crontab
    if [[ -z "$PREV_CJ" ]]; then
        echo "$JOB" | crontab -
    else
        printf "%s\n%s\n" "$PREV_CJ" "$JOB" | crontab -
    fi
}

# get url
get_latest_release_url() {
    URL=$(curl -s "https://api.github.com/repos/HanaOrg/Konbini/releases/latest" |
        grep -o '"browser_download_url": "[^"]*' |
        grep "$ARCH" |
        grep -v "\.asc" |
        grep -v "\kpak" |
        sed 's/"browser_download_url": "//')

    if [ -z "$URL" ]; then
        echo "No matching file found for $ARCH. This is likely our fault for not properly naming executables, please raise an issue."
        exit 1
    fi

    echo "$URL"
}

# install
install_app() {
    echo "Fetching latest release for $ARCH from GitHub..."
    local url=$(get_latest_release_url)
    echo "Fetched successfully."
    echo "Downloading from $url..."
    sudo mkdir -p "$PACKAGES_DIR"
    sudo curl -L "$url" -o "$PACKAGES_DIR/kbi"
    sudo chmod +x "$PACKAGES_DIR/kbi"
    echo "Downloaded successfully to $PACKAGES_DIR/kbi"
}

add_to_path() {
    echo "Adding executable to PATH..."

    if [ -z "$1" ]; then
        echo "Install directory is undefined or empty."
        exit 1
    fi

    # check if it's already in PATH
    if [[ ":$PATH:" == *":$1:"* ]]; then
        echo "$1 is already in PATH. No changes made."
        return
    fi

    # define target files
    FILES=("$HOME/.bashrc" "$HOME/.bash_profile" "$HOME/.profile")

    local MODIFIED=false

    # append to each file if it exists and doesn't already contain the entry
    for file in "${FILES[@]}"; do
        if [ -f "$file" ]; then
            if ! grep -q "export PATH=\"$1:\$PATH\"" "$file"; then
                echo "export PATH=\"$1:\$PATH\"" >>"$file"
                MODIFIED=true
            else
                echo "$1 is already in $file."
            fi
        fi
    done

    # apply changes if any file was modified
    if [ "$MODIFIED" = true ]; then
        source "$HOME/.profile" 2>/dev/null
        source "$HOME/.bashrc" 2>/dev/null
        source "$HOME/.bash_profile" 2>/dev/null
        echo "[ i ] Successfully added $1 to PATH."
    else
        echo "[ i ] No PATH was modified."
    fi
}

find_installed() {
    echo "[ i ] Analyzing already installed packages"
    echo "      (as of now this works with Flatpak only)"
    $PACKAGES_DIR/kbi find
    echo "[ i ] Done searching"
}

# installer itself
installer() {
    echo "[ > ] Hi! We'll install Konbini ($ARCH edition) for you. Just a sec!\n"
    echo "[ ! ] Please note we'll use sudo a few times."
    echo "[ i ] They're all found at $PACKAGES_DIR.\n"
    echo "[ ! ] This script relies on you running from Bash 4 or later."
    echo "[ ! ] Also, this script will create a safety-related cronjob. Please do not remove it under any circumstance.\n"
    remove_if_needed
    install_app
    add_to_path $PACKAGES_DIR
    add_to_path $LAUNCHPAD_DIR
    setup_cronjob
    find_installed
    echo "[ > ] Installed successfully! Restart your terminal, then run 'kbi' to get started."
    echo "Thank you and welcome to Konbini!"
}

# less go
installer
