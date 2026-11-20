import re


# Common words that usually do not determine the command.
STOP_WORDS = {
    "can",
    "could",
    "would",
    "will",
    "you",
    "please",
    "my",
    "me",
    "the",
    "a",
    "an",
    "for",
    "to",
    "i",
    "want",
    "like",
    "kindly",
    "just",
}


def normalize_text(text: str) -> str:
    """
    Convert user input into a predictable form.
    """

    if not text:
        return ""

    text = text.lower().strip()

    # Replace punctuation with spaces.
    text = re.sub(r"[^\w\s.+-]", " ", text)

    # Remove extra spaces.
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def tokenize(text: str) -> list[str]:
    """
    Split normalized text into tokens.
    """

    normalized = normalize_text(text)

    if not normalized:
        return []

    return normalized.split()


def remove_stop_words(tokens: list[str]) -> list[str]:
    """
    Remove common conversational words.
    """

    return [
        token
        for token in tokens
        if token not in STOP_WORDS
    ]


def preprocess(text: str) -> dict:
    """
    Complete preprocessing pipeline.
    """

    normalized = normalize_text(text)
    tokens = tokenize(normalized)
    meaningful_tokens = remove_stop_words(tokens)

    return {
        "original": text,
        "normalized": normalized,
        "tokens": tokens,
        "meaningful_tokens": meaningful_tokens,
    }