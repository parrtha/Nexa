from datetime import datetime
from pathlib import Path

def take_screenshot():
    try:
        from PIL import ImageGrab
        folder = Path.home() / "Pictures" / "Nexa Screenshots"
        folder.mkdir(parents=True, exist_ok=True)
        filename = folder / f"screenshot_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        image = ImageGrab.grab()
        image.save(filename)
        return True, f"Screenshot saved to {filename}."
    except Exception as exc:
        return False, f"I couldn't take the screenshot: {exc}"
