from .apps import open_app
from .folders import open_folder, open_recycle_bin
from .system import (
    battery_status, volume_up, volume_down, volume_mute,
    brightness_change
)
from .browser import open_search
from .screenshot import take_screenshot
from .recycle_bin import empty_recycle_bin

def execute_intent(intent, entities):
    if intent in {
          "OPEN_CALCULATOR",
    "OPEN_CHROME",
    "OPEN_VSCODE",
    "OPEN_NOTEPAD",
    "OPEN_TASK_MANAGER",
    "OPEN_SETTINGS"
    }:
        success, response = open_app(intent)

    elif intent in {
        "OPEN_DOWNLOADS", "OPEN_DESKTOP", "OPEN_DOCUMENTS",
        "OPEN_PICTURES", "OPEN_VIDEOS", "OPEN_MUSIC"
    }:
        success, response = open_folder(intent)

    elif intent == "OPEN_RECYCLE_BIN":
        success, response = open_recycle_bin()

    elif intent == "EMPTY_RECYCLE_BIN":
        success, response = empty_recycle_bin()

    elif intent == "CHECK_BATTERY":
        success, response = battery_status()

    elif intent == "VOLUME_UP":
        success, response = volume_up()

    elif intent == "VOLUME_DOWN":
        success, response = volume_down()

    elif intent == "VOLUME_MUTE":
        success, response = volume_mute()

    elif intent == "BRIGHTNESS_UP":
        success, response = brightness_change("up")

    elif intent == "BRIGHTNESS_DOWN":
        success, response = brightness_change("down")

    elif intent == "TAKE_SCREENSHOT":
        success, response = take_screenshot()

    elif intent in {"SEARCH_GOOGLE", "SEARCH_YOUTUBE", "WEB_SEARCH"}:
        success, response = open_search(intent, entities)

    else:
        return {
            "success": False,
            "response": "That command is not implemented yet."
        }

    return {
        "success": success,
        "response": response
    }
