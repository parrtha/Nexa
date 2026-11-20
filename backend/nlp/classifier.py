from difflib import SequenceMatcher

from .preprocess import preprocess
from .intents import (
    APP_INTENTS,
    FOLDER_INTENTS,
    SYSTEM_INTENTS,
    RECYCLE_BIN_INTENTS,
    SEARCH_INTENTS,
    GENERAL_INTENTS,
)
from .entities import extract_entities
from .confidence import calculate_confidence, confidence_label


def phrase_in_text(text: str, phrase: str) -> bool:
    """
    Check whether a phrase exists as complete words.

    Example:
        "hi" should NOT match "something"
    """

    text_words = text.split()
    phrase_words = phrase.lower().split()

    if len(text_words) < len(phrase_words):
        return False

    for i in range(len(text_words) - len(phrase_words) + 1):

        window = text_words[
            i:i + len(phrase_words)
        ]

        if window == phrase_words:
            return True

    return False


def fuzzy_match(
    text: str,
    phrase: str,
    threshold: float = 0.84
) -> bool:
    """
    Safe fuzzy matching for natural-language commands.
    """

    text = text.lower().strip()
    phrase = phrase.lower().strip()

    # Exact complete-word phrase.
    if phrase_in_text(text, phrase):
        return True

    words = text.split()
    target_words = phrase.split()

    if len(words) < len(target_words):
        return False

    for i in range(
        len(words) - len(target_words) + 1
    ):

        window = " ".join(
            words[
                i:i + len(target_words)
            ]
        )

        score = SequenceMatcher(
            None,
            window,
            phrase
        ).ratio()

        if score >= threshold:
            return True

    return False


def find_best_intent(
    text: str,
    intent_group: dict
):
    """
    Find the strongest intent inside one intent group.
    """

    best_intent = None
    best_phrases = []
    best_score = 0.0

    for intent, phrases in intent_group.items():

        matched = []

        for phrase in phrases:

            if fuzzy_match(text, phrase):
                matched.append(phrase)

        if not matched:
            continue

        confidence = calculate_confidence(
            text,
            matched,
            intent
        )

        if confidence > best_score:

            best_score = confidence
            best_intent = intent
            best_phrases = matched

    return (
        best_intent,
        best_phrases,
        best_score
    )


def classify(raw_text: str) -> dict:
    """
    Complete deterministic NLP pipeline.
    """

    data = preprocess(raw_text)

    text = data["normalized"]

    print("DEBUG RAW:", raw_text)
    print("DEBUG NORMALIZED:", text)

    if not text:
        return {
            "intent": "UNKNOWN",
            "confidence": 0.0,
            "confidence_label": "Very Low",
            "entities": {},
            "normalized_text": "",
            "tokens": [],
            "meaningful_tokens": [],
        }

    # ---------------------------------------------------------
    # Special handling for YouTube
    # ---------------------------------------------------------

    youtube_words = [
        "youtube",
        "on youtube",
        "youtube search",
    ]

    is_youtube = any(
        phrase in text
        for phrase in youtube_words
    )

    # ---------------------------------------------------------
    # Intent groups
    # ---------------------------------------------------------

    intent_groups = [
        APP_INTENTS,
        FOLDER_INTENTS,
        SYSTEM_INTENTS,
        RECYCLE_BIN_INTENTS,
    ]

    # Search group is handled separately.
    # This prevents "find" from automatically becoming Google
    # when the user explicitly mentions YouTube.

    best_intent = None
    best_phrases = []
    best_confidence = 0.0

    # ---------------------------------------------------------
    # Normal intent groups
    # ---------------------------------------------------------

    for group in intent_groups:

        intent, phrases, confidence = find_best_intent(
            text,
            group
        )

        if intent and confidence > best_confidence:

            best_intent = intent
            best_phrases = phrases
            best_confidence = confidence

    # ---------------------------------------------------------
    # Search handling
    # ---------------------------------------------------------

    if is_youtube:

        youtube_intent = {
            "SEARCH_YOUTUBE": SEARCH_INTENTS[
                "SEARCH_YOUTUBE"
            ]
        }

        intent, phrases, confidence = find_best_intent(
            text,
            youtube_intent
        )

        if intent:

            best_intent = intent
            best_phrases = phrases
            best_confidence = confidence

    else:

        google_intent = {
            "SEARCH_GOOGLE": SEARCH_INTENTS[
                "SEARCH_GOOGLE"
            ]
        }

        intent, phrases, confidence = find_best_intent(
            text,
            google_intent
        )

        if intent and confidence > best_confidence:

            best_intent = intent
            best_phrases = phrases
            best_confidence = confidence

    # ---------------------------------------------------------
    # General intents
    # ---------------------------------------------------------

    # Only check greetings when the command is short.
    #
    # This prevents:
    #
    # "open something"
    #
    # from accidentally matching:
    #
    # "hi"
    #
    if len(data["meaningful_tokens"]) <= 3:

        intent, phrases, confidence = find_best_intent(
            text,
            GENERAL_INTENTS
        )

        if intent and confidence > best_confidence:

            best_intent = intent
            best_phrases = phrases
            best_confidence = confidence

    # ---------------------------------------------------------
    # Unknown command
    # ---------------------------------------------------------

    if not best_intent:

        return {
            "intent": "UNKNOWN",
            "confidence": 0.0,
            "confidence_label": "Very Low",
            "entities": {},
            "normalized_text": text,
            "tokens": data["tokens"],
            "meaningful_tokens": data["meaningful_tokens"],
        }

    # ---------------------------------------------------------
    # Entity extraction
    # ---------------------------------------------------------

    entities = extract_entities(
        text,
        best_intent
    )

    return {
        "intent": best_intent,
        "confidence": best_confidence,
        "confidence_label": confidence_label(
            best_confidence
        ),
        "matched_phrases": best_phrases,
        "entities": entities,
        "normalized_text": text,
        "tokens": data["tokens"],
        "meaningful_tokens": data[
            "meaningful_tokens"
        ],
    }