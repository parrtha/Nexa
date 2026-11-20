# Nexa Architecture

## Layered architecture

1. User interface
2. Speech recognition
3. NLP preprocessing
4. Rule-based intent classification
5. Entity extraction
6. FastAPI
7. Windows command execution
8. Response generation
9. Text-to-speech

## Why rule-based NLP?

The project requirement is to demonstrate NLP without an AI model. Nexa therefore uses deterministic rules that are transparent and easy to test.

## Example

Input:
"Can you please launch my calculator?"

Normalization:
"can you please launch my calculator"

Detected action:
"launch"

Detected object:
"calculator"

Intent:
`OPEN_CALCULATOR`

Execution:
`calc.exe`

Response:
"Opening Calculator."
