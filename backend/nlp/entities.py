import re

from .synonyms import APP_ALIASES, FOLDER_ALIASES


def extract_search_query(text: str) -> str:
    """
    Extract the actual search query from a sentence.

    Examples:
        search google for machine learning
        -> machine learning

        find Python tutorials on YouTube
        -> Python tutorials

        search youtube for cricket highlights
        -> cricket highlights
    """

    patterns = [
        r"search\s+(?:google\s+)?(?:for\s+)?(.+)$",
        r"search\s+youtube\s+(?:for\s+)?(.+)$",
        r"find\s+(?:on\s+youtube\s+)?(.+)$",
        r"look\s+for\s+(.+)$",
        r"look\s+up\s+(.+)$",
        r"google\s+(.+)$",
        r"youtube\s+(.+)$",
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            text,
            re.IGNORECASE
        )

        if match:

            query = match.group(1).strip(" .")

            # Remove trailing YouTube reference.
            query = re.sub(
                r"\s+on\s+youtube$",
                "",
                query,
                flags=re.IGNORECASE
            )

            query = re.sub(
                r"\s+youtube$",
                "",
                query,
                flags=re.IGNORECASE
            )

            if query:
                return query

    return ""


def extract_application(text: str) -> str | None:
    """
    Detect an application entity.
    """

    for app, aliases in APP_ALIASES.items():
        for alias in aliases:
            if alias in text:
                return app

    return None


def extract_folder(text: str) -> str | None:
    """
    Detect a folder entity.
    """

    for folder, aliases in FOLDER_ALIASES.items():
        for alias in aliases:
            if alias in text:
                return folder

    return None


def extract_entities(text: str, intent: str) -> dict:
    """
    Extract entities based on detected intent.
    """

    entities = {}

    if intent in {
        "OPEN_CALCULATOR",
        "OPEN_CHROME",
        "OPEN_VSCODE",
        "OPEN_NOTEPAD",
    }:
        application = extract_application(text)

        if application:
            entities["application"] = application

    elif intent in {
        "OPEN_DOWNLOADS",
        "OPEN_DESKTOP",
        "OPEN_DOCUMENTS",
        "OPEN_PICTURES",
        "OPEN_VIDEOS",
        "OPEN_MUSIC",
    }:
        folder = extract_folder(text)

        if folder:
            entities["folder"] = folder

    elif intent in {
        "SEARCH_GOOGLE",
        "SEARCH_YOUTUBE",
    }:
        query = extract_search_query(text)

        if query:
            entities["query"] = query

    return entities