from difflib import SequenceMatcher


def similarity(text: str, phrase: str) -> float:
    """
    Calculate similarity between two strings.
    """
    return SequenceMatcher(
        None,
        text.lower(),
        phrase.lower()
    ).ratio()


def phrase_match_score(text: str, phrase: str) -> float:
    """
    Calculate how strongly a phrase matches the input.
    """

    text = text.lower().strip()
    phrase = phrase.lower().strip()

    # Exact phrase contained in the sentence.
    if phrase in text:
        return 1.0

    # Fuzzy similarity.
    return similarity(text, phrase)


def calculate_confidence(
    text: str,
    matched_phrases: list[str],
    intent: str,
    entities: dict | None = None,
) -> float:
    """
    Calculate confidence using deterministic NLP signals.

    Signals:
    1. Phrase matching
    2. Entity matching
    3. Number of matched phrases
    """

    if not matched_phrases:
        return 0.0

    text_lower = text.lower()

    # ---------------------------------------------------------
    # 1. Find strongest phrase match
    # ---------------------------------------------------------

    phrase_scores = [
        phrase_match_score(text_lower, phrase)
        for phrase in matched_phrases
    ]

    best_phrase_score = max(phrase_scores)

    # ---------------------------------------------------------
    # 2. Exact phrase detection
    # ---------------------------------------------------------

    exact_matches = [
        phrase
        for phrase in matched_phrases
        if phrase.lower() in text_lower
    ]

    has_exact_match = len(exact_matches) > 0

    # ---------------------------------------------------------
    # 3. Entity signal
    # ---------------------------------------------------------

    entity_bonus = 0.0

    if entities:
        valid_entities = [
            value
            for value in entities.values()
            if value
        ]

        if valid_entities:
            entity_bonus = 0.04

    # ---------------------------------------------------------
    # 4. Multiple matching phrases
    # ---------------------------------------------------------

    multiple_match_bonus = 0.0

    if len(matched_phrases) >= 2:
        multiple_match_bonus = 0.02

    # ---------------------------------------------------------
    # 5. Calculate final score
    # ---------------------------------------------------------

    if has_exact_match:
        confidence = 0.90 + entity_bonus + multiple_match_bonus

        # Very clear exact matches can reach 99%.
        if best_phrase_score >= 1.0:
            confidence += 0.03

    else:
        confidence = (
            best_phrase_score * 0.90
            + entity_bonus
            + multiple_match_bonus
        )

    # Keep score within 0–1.
    confidence = min(
        max(confidence, 0.0),
        0.99
    )

    return round(confidence, 2)


def confidence_label(confidence: float) -> str:
    """
    Convert numeric confidence into a human-readable label.
    """

    if confidence >= 0.90:
        return "High"

    if confidence >= 0.70:
        return "Medium"

    if confidence >= 0.50:
        return "Low"

    return "Very Low"