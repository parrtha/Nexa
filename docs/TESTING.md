# Nexa Testing Checklist

## Backend

Start:

`python -m uvicorn main:app --reload --port 8000`

Test:

`GET /api/health`

Then test `/api/command`.

## Example commands

### Calculator
- open calculator
- launch calculator
- start calculator
- please open the calculator

Expected intent:
`OPEN_CALCULATOR`

### Downloads
- show my downloads
- open downloads folder
- open my downloads
- take me to downloads

Expected intent:
`OPEN_DOWNLOADS`

### Volume
- increase volume
- make volume louder
- turn volume up

Expected intent:
`VOLUME_UP`

### Search
- search Google for Python
- search YouTube for Java tutorials

Expected query entity should contain the search phrase.

## Safety

Test destructive Recycle Bin actions carefully.
