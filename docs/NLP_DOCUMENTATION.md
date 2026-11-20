# Nexa NLP Documentation

## Preprocessing

Input is:
- lowercased
- cleaned
- whitespace-normalized
- tokenized where required

## Intent classification

The classifier checks predefined phrase groups and application/folder aliases.

Example:

- open
- launch
- start
- run

can indicate an opening action.

## Entity extraction

Search queries are extracted with regular expressions.

Example:

`search youtube for python tutorials`

Intent:
`SEARCH_YOUTUBE`

Entity:
`query = python tutorials`

## Fuzzy matching

A lightweight string similarity check is used for selected phrases. It is not an AI model.

## Limitations

The rule system can only understand patterns that have been defined. New command families require new rules.
