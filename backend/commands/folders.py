import os
import winreg
from pathlib import Path


HOME = Path.home()
ONEDRIVE = HOME / "OneDrive"


def get_windows_folder(folder_id):
    """
    Read a Windows known-folder location from
    the Windows User Shell Folders registry.
    """

    try:
        key_path = (
            r"Software\Microsoft\Windows\CurrentVersion"
            r"\Explorer\User Shell Folders"
        )

        with winreg.OpenKey(
            winreg.HKEY_CURRENT_USER,
            key_path
        ) as key:

            value, _ = winreg.QueryValueEx(
                key,
                folder_id
            )

            return Path(os.path.expandvars(value))

    except (FileNotFoundError, OSError):
        return None


def find_existing_path(paths):
    """
    Return the first path that exists.
    """

    for path in paths:

        if path is not None and path.exists():
            return path

    return None


def get_folder_paths():
    """
    Detect common Windows folders.
    """

    downloads = get_windows_folder(
        "{374DE290-123F-4565-9164-39C4925E467B}"
    )

    return {

        "OPEN_DOWNLOADS": find_existing_path([
            downloads,
            HOME / "Downloads",
            ONEDRIVE / "Downloads",
        ]),

        "OPEN_DESKTOP": find_existing_path([
            ONEDRIVE / "Desktop",
            HOME / "Desktop",
        ]),

        "OPEN_DOCUMENTS": find_existing_path([
            ONEDRIVE / "Apps" / "Desktop" / "Documents",
            ONEDRIVE / "Documents",
            HOME / "Documents",
        ]),

        "OPEN_PICTURES": find_existing_path([
            ONEDRIVE / "Pictures",
            HOME / "Pictures",
        ]),

        "OPEN_VIDEOS": find_existing_path([
            ONEDRIVE / "Videos",
            HOME / "Videos",
        ]),

        "OPEN_MUSIC": find_existing_path([
            ONEDRIVE / "Music",
            HOME / "Music",
        ]),
    }


def open_folder(intent):

    folders = get_folder_paths()

    path = folders.get(intent)

    if path is None:

        folder_name = (
            intent
            .replace("OPEN_", "")
            .replace("_", " ")
            .title()
        )

        return (
            False,
            f"The {folder_name} folder could not be found."
        )

    try:

        os.startfile(str(path))

        name = (
            intent
            .replace("OPEN_", "")
            .replace("_", " ")
            .title()
        )

        return True, f"Opening {name}."

    except Exception as exc:

        return (
            False,
            f"I couldn't open the folder: {exc}"
        )


def open_recycle_bin():

    try:

        os.startfile("shell:RecycleBinFolder")

        return True, "Opening Recycle Bin."

    except Exception as exc:

        return (
            False,
            f"I couldn't open Recycle Bin: {exc}"
        )