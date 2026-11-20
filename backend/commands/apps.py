import os
import shutil
import subprocess
from pathlib import Path


APP_COMMANDS = {
    "OPEN_CALCULATOR": "calc.exe",
    "OPEN_CHROME": "chrome.exe",
    "OPEN_VSCODE": "code",
    "OPEN_NOTEPAD": "notepad.exe",
    "OPEN_TASK_MANAGER": "taskmgr.exe",
}


def find_chrome():
    """
    Find Google Chrome on Windows.
    """

    # 1. Check PATH
    chrome = shutil.which("chrome.exe")

    if chrome:
        return chrome

    # 2. Check common Chrome installation locations
    possible_paths = [
        Path(os.environ.get("PROGRAMFILES", ""))
        / "Google"
        / "Chrome"
        / "Application"
        / "chrome.exe",

        Path(os.environ.get("PROGRAMFILES(X86)", ""))
        / "Google"
        / "Chrome"
        / "Application"
        / "chrome.exe",

        Path(os.environ.get("LOCALAPPDATA", ""))
        / "Google"
        / "Chrome"
        / "Application"
        / "chrome.exe",
    ]

    for path in possible_paths:
        if path.exists():
            return str(path)

    return None


def open_app(intent):
    print("DEBUG OPEN_APP CALLED:", intent)
    try:

        # -----------------------------------------
        # Windows Settings
        # -----------------------------------------
        if intent == "OPEN_SETTINGS":
            subprocess.Popen(
                ["cmd", "/c", "start", "", "ms-settings:"],
                shell=False
            )
            return True, "Opening Settings."

        # -----------------------------------------
        # Chrome
        # -----------------------------------------
        if intent == "OPEN_CHROME":

            executable = find_chrome()

            if not executable:
                return (
                    False,
                    "Google Chrome was not found on this computer."
                )

        # -----------------------------------------
        # Other applications
        # -----------------------------------------
        else:

            command = APP_COMMANDS[intent]

            executable = shutil.which(command)

            if not executable:
                executable = command

        subprocess.Popen(
            [executable],
            shell=False
        )

        app_name = (
            intent
            .replace("OPEN_", "")
            .replace("_", " ")
            .title()
        )

        return True, f"Opening {app_name}."

    except Exception as exc:

        return (
            False,
            f"I couldn't open that application: {exc}"
        )