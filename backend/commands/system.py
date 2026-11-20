import subprocess
import psutil

def battery_status():
    try:
        battery = psutil.sensors_battery()
        if battery is None:
            return False, "Battery information is not available."
        plugged = "charging" if battery.power_plugged else "not charging"
        return True, f"Battery is at {round(battery.percent)} percent and is {plugged}."
    except Exception as exc:
        return False, f"I couldn't read the battery status: {exc}"

def volume_up():
    # Windows built-in multimedia key through PowerShell.
    try:
        subprocess.run([
            "powershell", "-NoProfile", "-Command",
            "(New-Object -ComObject WScript.Shell).SendKeys([char]175)"
        ], check=True)
        return True, "Volume increased."
    except Exception as exc:
        return False, f"I couldn't change the volume: {exc}"

def volume_down():
    try:
        subprocess.run([
            "powershell", "-NoProfile", "-Command",
            "(New-Object -ComObject WScript.Shell).SendKeys([char]174)"
        ], check=True)
        return True, "Volume decreased."
    except Exception as exc:
        return False, f"I couldn't change the volume: {exc}"

def volume_mute():
    try:
        subprocess.run([
            "powershell", "-NoProfile", "-Command",
            "(New-Object -ComObject WScript.Shell).SendKeys([char]173)"
        ], check=True)
        return True, "Volume mute toggled."
    except Exception as exc:
        return False, f"I couldn't mute the volume: {exc}"

def brightness_change(direction):
    try:
        import screen_brightness_control as sbc
        current = sbc.get_brightness(display=0)[0]
        step = 10 if direction == "up" else -10
        new_value = max(0, min(100, current + step))
        sbc.set_brightness(new_value, display=0)
        return True, f"Brightness set to {new_value} percent."
    except Exception as exc:
        return False, f"I couldn't change the brightness: {exc}"
