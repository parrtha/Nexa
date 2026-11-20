import ctypes


def empty_recycle_bin():
    try:
        # Windows Shell API
        SHEmptyRecycleBinW = ctypes.windll.shell32.SHEmptyRecycleBinW

        # Flags:
        # 0x01 = No confirmation
        # 0x02 = No progress UI
        # 0x04 = No sound
        flags = 0x01 | 0x02 | 0x04

        result = SHEmptyRecycleBinW(
            None,   # All drives
            None,   # All recycle bins
            flags
        )

        if result == 0:
            return True, "Recycle Bin emptied successfully."

        return False, f"Windows could not empty the Recycle Bin. Error code: {result}"

    except Exception as exc:
        return False, f"I couldn't empty Recycle Bin: {exc}"