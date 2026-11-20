import webbrowser
from urllib.parse import quote_plus

def open_search(intent, entities):
    query = entities.get("query", "").strip()
    if not query:
        return False, "Please tell me what you want to search for."

    if intent == "SEARCH_YOUTUBE":
        url = "https://www.youtube.com/results?search_query=" + quote_plus(query)
        message = f"Searching YouTube for {query}."
    elif intent == "SEARCH_GOOGLE":
        url = "https://www.google.com/search?q=" + quote_plus(query)
        message = f"Searching Google for {query}."
    else:
        url = "https://www.google.com/search?q=" + quote_plus(query)
        message = f"Searching the web for {query}."

    webbrowser.open(url)
    return True, message
