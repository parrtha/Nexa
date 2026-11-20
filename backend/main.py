from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from nlp.classifier import classify
from commands.executor import execute_intent


app = FastAPI(
    title="Nexa Local Assistant API",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
         "http://localhost:5174",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# REQUEST MODEL
# ============================================================

class CommandRequest(BaseModel):
    text: str


# ============================================================
# RECYCLE BIN CONFIRMATION STATE
# ============================================================

recycle_bin_confirmation_pending = False


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
def health():
    return {
        "status": "online",
        "assistant": "Nexa",
        "mode": "rule-based-local"
    }


# ============================================================
# NLP TEST ENDPOINT
# ============================================================

@app.post("/api/nlp/test")
def nlp_test(request: CommandRequest):

    result = classify(request.text)

    return {
        "success": True,
        "input": request.text,
        "intent": result["intent"],
        "confidence": result["confidence"],
        "confidence_label": result["confidence_label"],
        "entities": result["entities"],
        "normalized_text": result["normalized_text"],
        "tokens": result["tokens"],
        "meaningful_tokens": result["meaningful_tokens"],
        "matched_phrases": result.get(
            "matched_phrases",
            []
        )
    }


# ============================================================
# COMMAND ENDPOINT
# ============================================================

@app.post("/api/command")
def command(request: CommandRequest):

    global recycle_bin_confirmation_pending

    # --------------------------------------------------------
    # Step 1: NLP classification
    # --------------------------------------------------------

    result = classify(request.text)

    intent = result["intent"]
    normalized = result["normalized_text"].strip().lower()

    # --------------------------------------------------------
    # Step 2: HANDLE RECYCLE BIN CONFIRMATION FIRST
    # --------------------------------------------------------

    if recycle_bin_confirmation_pending:

        confirmation_words = {
            "yes",
            "yeah",
            "y",
            "yep",
            "confirm",
            "confirmed",
            "sure",
            "do it",
            "go ahead",
            "empty it"
        }

        cancellation_words = {
            "no",
            "nope",
            "n",
            "cancel",
            "stop",
            "don't",
            "do not",
            "never mind",
            "nevermind"
        }

        # ----------------------------------------------------
        # Positive confirmation
        # ----------------------------------------------------

        if normalized in confirmation_words:

            recycle_bin_confirmation_pending = False

            execution = execute_intent(
                "EMPTY_RECYCLE_BIN",
                {}
            )

            return {
                **result,
                "intent": "EMPTY_RECYCLE_BIN",
                "confirmation_required": False,
                **execution
            }

        # ----------------------------------------------------
        # Cancellation
        # ----------------------------------------------------

        if normalized in cancellation_words:

            recycle_bin_confirmation_pending = False

            return {
                **result,
                "intent": "EMPTY_RECYCLE_BIN",
                "success": True,
                "confirmation_required": False,
                "response": "Recycle Bin deletion cancelled."
            }

        # ----------------------------------------------------
        # Neither YES nor NO
        # ----------------------------------------------------

        return {
            **result,
            "success": False,
            "confirmation_required": True,
            "response": (
                "Please say yes to confirm or "
                "no to cancel."
            )
        }

    # --------------------------------------------------------
    # Step 3: Unknown command
    # --------------------------------------------------------

    if intent == "UNKNOWN":

        return {
            **result,
            "success": False,
            "response": (
                "I'm not sure what command you mean. "
                "Please try again."
            )
        }

    # --------------------------------------------------------
    # Step 4: Recycle Bin confirmation request
    # --------------------------------------------------------

    if intent == "EMPTY_RECYCLE_BIN":

        recycle_bin_confirmation_pending = True

        return {
            **result,
            "success": False,
            "confirmation_required": True,
            "response": (
                "Are you sure you want to permanently "
                "delete everything in the Recycle Bin?"
            )
        }

    # --------------------------------------------------------
    # Step 5: Execute normal Windows action
    # --------------------------------------------------------

    execution = execute_intent(
        intent,
        result.get("entities", {})
    )

    # --------------------------------------------------------
    # Step 6: Return NLP + execution result
    # --------------------------------------------------------

    return {
        **result,
        **execution
    }