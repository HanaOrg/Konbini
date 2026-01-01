# borrowed from https://fuckingnode.github.io/install.ps1
$ErrorActionPreference = "Stop"

$ROOT_DIR = Join-Path -Path $Env:USERPROFILE -ChildPath "kbi"
$PACKAGES_DIR = Join-Path -Path $ROOT_DIR -ChildPath "exe"
$LAUNCHPAD_DIR = Join-Path -Path $ROOT_DIR -ChildPath "launchpad"
$KBI_PATH = Join-Path -Path $PACKAGES_DIR -ChildPath "kbi.exe"

Function Remove-IfNeeded() {
    if ($null -ne $args[0] -as [double]) {
        Stop-Process -Id $args[0] -Force
        Remove-Item $KBI_PATH -Force
    }
}

# get latest release URL
Function Get-LatestReleaseUrl {
    try {
        Write-Host "Fetching latest release from GitHub..."
        $response = Invoke-RestMethod -Uri "https://api.github.com/repos/HanaOrg/Konbini/releases/latest"
        $asset = $response.assets | Where-Object { $_.name -notlike "*.asc" -and $_.name -like "*.exe" }
        if (-not $asset) {
            Throw "No .exe file found in the latest release."
        }
        Write-Host "Fetched."
        return $asset.browser_download_url
    }
    catch {
        if ($null -ne $_.Exception.Response) {
            $errorResponse = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorResponse)
            $errorContent = $reader.ReadToEnd() | ConvertFrom-Json

            if ($errorContent.message -match "API rate limit exceeded") {
                Write-Error "API rate limit exceeded. To avoid this, authenticate your requests with a GitHub token."
                Write-Error "Visit the following documentation for more information: $($errorContent.documentation_url)"
            }
            else {
                Write-Error "An error occurred: $($errorContent.message)"
            }
        }
        else {
            Write-Error "An unknown error occurred: $($_.Exception.Message)"
        }
    }
}

# download the app
Function Install-App {
    param (
        [string]$url
    )
    try {
        Write-Host "Downloading from $url..."

        if (-not (Test-Path $ROOT_DIR)) {
            New-Item -ItemType Directory -Path $ROOT_DIR | Out-Null
        }

        if (-not (Test-Path $PACKAGES_DIR)) {
            New-Item -ItemType Directory -Path $PACKAGES_DIR | Out-Null
        }

        if (-not (Test-Path $LAUNCHPAD_DIR)) {
            New-Item -ItemType Directory -Path $LAUNCHPAD_DIR | Out-Null
        }

        Invoke-WebRequest -Uri $url -OutFile $KBI_PATH
        Write-Host "Downloaded successfully to $KBI_PATH"
    }
    catch {
        Throw "Failed to download or save the file: $_"
    }
}

# ngl copied this from bun.sh/install.ps1
# 'HKCU:' = hkey_current_user btw
# i don't know what does this shi- do but it works flawlessly so it'll do i guess
function Publish-Env {
    if (-not ("Win32.NativeMethods" -as [Type])) {
        Add-Type -Namespace Win32 -Name NativeMethods -MemberDefinition @"
  [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
  public static extern IntPtr SendMessageTimeout(
      IntPtr hWnd, uint Msg, UIntPtr wParam, string lParam,
      uint fuFlags, uint uTimeout, out UIntPtr lpdwResult);
"@
    }
    $HWND_BROADCAST = [IntPtr] 0xffff
    $WM_SETTING_CHANGE = 0x1a
    $result = [UIntPtr]::Zero
    [Win32.NativeMethods]::SendMessageTimeout($HWND_BROADCAST,
        $WM_SETTING_CHANGE,
        [UIntPtr]::Zero,
        "Environment",
        2,
        5000,
        [ref] $result
    ) | Out-Null
}

function Write-Env {
    param([String]$Key, [String]$Value)

    $RegisterKey = Get-Item -Path 'HKCU:'

    $EnvRegisterKey = $RegisterKey.OpenSubKey('Environment', $true)
    if ($null -eq $Value) {
        $EnvRegisterKey.DeleteValue($Key)
    }
    else {
        $RegistryValueKind = if ($Value.Contains('%')) {
            [Microsoft.Win32.RegistryValueKind]::ExpandString
        }
        elseif ($EnvRegisterKey.GetValue($Key)) {
            $EnvRegisterKey.GetValueKind($Key)
        }
        else {
            [Microsoft.Win32.RegistryValueKind]::String
        }
        $EnvRegisterKey.SetValue($Key, $Value, $RegistryValueKind)
    }

    Publish-Env
}

function Get-Env {
    param([String] $Key)

    $RegisterKey = Get-Item -Path 'HKCU:'
    $EnvRegisterKey = $RegisterKey.OpenSubKey('Environment')
    $EnvRegisterKey.GetValue($Key, $null, [Microsoft.Win32.RegistryValueOptions]::DoNotExpandEnvironmentNames)
}
  
# Function: Add App to PATH
Function Add-ToPath {
    param([String] $Key)

    try {
        Write-Host "Adding shorthand to PATH..."

        if ([string]::IsNullOrWhiteSpace($Key)) {
            Throw "Key is undefined or empty."
        }

        $Path = (Get-Env -Key "Path") -split ';'

        # Add to PATH if not already present
        if ($Path -notcontains $Key) {
            $Path += $Key
            Write-Env -Key 'Path' -Value ($Path -join ';')
            $env:PATH = $Path -join ';'
            Write-Host "[ i ] Added $Key to PATH"
        }
        else {
            Write-Host "[ i ] '${Key}' is already in your PATH."
        }
    }
    catch {
        Write-Error "Error adding to PATH: $_"
        Throw $_
    }
}

Function Register-CronJob {
    $taskExists = Get-ScheduledTask | Where-Object { $_.TaskName -like 'Konbini Guard' };
    if ($taskExists) {
        Write-Host "[ i ] ScheduledTask seems to already exist (this is probably an update). Not modifying." 
        return
    }
    SCHTASKS /Create /SC DAILY /TN "Konbini Guard" /TR "$KBI_PATH ensure-security" /ST 15:00 /NP /RL HIGHEST /HRESULT /F

    # https://stackoverflow.com/a/69266147
    $task = Get-ScheduledTask "Konbini Guard"
    $task.Description = "This ensures software downloaded through Konbini is secure. It updates our database in a daily base and immediately removes from your machine any package reported as malicious. This task was automatically created and you can leave it as is. If you delete it (please do not) it won't be created again when running Konbini, but it will when updating it."
    $task | Set-ScheduledTask
}

# Registers .kpak files so they're opened with Konbini when used.
# It doesn't look "good", I mean: since Windows 10, if an app touches the default apps from the registry, a confirmation prompt appears first time, calling the app `"C:\Users\...\kbi" unpack "%1"` which is weird, but it gets the job done, so yeah.
Function Register-Konpak {
    New-Item -Path "Registry::HKEY_CLASSES_ROOT\\.kpak" -Force | Out-Null
    Set-ItemProperty -Path "Registry::HKEY_CLASSES_ROOT\\.kpak" -Name "(default)" -Value "konpak"
    Set-ItemProperty -Path "Registry::HKEY_CLASSES_ROOT\\.kpak" -Name "Content Type" -Value "application/x-kpak"
    Set-ItemProperty -Path "Registry::HKEY_CLASSES_ROOT\\.kpak" -Name "PerceivedType" -Value "compressed"

    # register the filetype
    New-Item -Path "Registry::HKEY_CLASSES_ROOT\\konpak" -Force | Out-Null
    Set-ItemProperty -Path "Registry::HKEY_CLASSES_ROOT\\konpak" -Name "(default)" -Value "Konpak archive"

    # default icon
    New-Item -Path "Registry::HKEY_CLASSES_ROOT\\konpak\\DefaultIcon" -Force | Out-Null
    Set-ItemProperty -Path "Registry::HKEY_CLASSES_ROOT\\konpak\\DefaultIcon" -Name "(default)" -Value "$KBI_PATH,0"

    # be able to install it from right click menu
    New-Item -Path "Registry::HKEY_CLASSES_ROOT\\konpak\\shell\\open" -Force | Out-Null
    Set-ItemProperty -Path "Registry::HKEY_CLASSES_ROOT\\konpak\\shell\\open" -Name "(default)" -Value "Install Konpak"
    New-Item -Path "Registry::HKEY_CLASSES_ROOT\\konpak\\shell\\open\\command" -Force | Out-Null
    Set-ItemProperty -Path "Registry::HKEY_CLASSES_ROOT\\konpak\\shell\\open\\command" -Name "(default)" -Value "`"$KBI_PATH`" unpack `"%1`""
}

Function Find-Installed {
    Write-Host "[ i ] Analyzing already installed packages"
    & "$KBI_PATH\\kbi.exe" find
    Write-Host "[ i ] Done searching"
}

Function Installer {
    try {
        Write-Host "[ > ] Hi! We'll install Konbini for you. Just a sec!\n"
        Write-Host "[ ! ] This script will create a privileged scheduled task, so you might need to run it as administrator if it fails."
        Write-Host "[ i ] Also, please be sure to not delete this scheduled task later on."
        Remove-IfNeeded
        Install-App -url (Get-LatestReleaseUrl)
        Add-ToPath $PACKAGES_DIR
        Add-ToPath $LAUNCHPAD_DIR
        Register-Konpak
        Register-CronJob
        Find-Installed
        Write-Host "[ > ] Installed successfully! Restart your terminal for it to work."
        Write-Host "Welcome to Konbini!"
    }
    catch {
        Write-Error $_
    }
}

# start installation
Installer
