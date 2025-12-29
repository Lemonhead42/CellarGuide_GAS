# CellarGuide

CellarGuide is a lightweight, conversational wine cellar management system built around Google Sheets, Google Apps Script, and a CustomGPT interface.

It is designed for private wine lovers who want **clarity, enjoyment, and good decisions** – not spreadsheets for their own sake or enterprise-grade wine ERPs.

👉 **Conceptual background & design philosophy:** see `PROJECT_INTENT.md`

---

## What CellarGuide Does

CellarGuide helps you:

* keep track of which wines you own and in what quantity
* understand which wines are ready to drink or should be consumed soon
* get food-oriented wine recommendations based on your *actual* cellar
* add, correct, and manage wines using natural language

It combines:

* **Google Sheets** as a transparent data store
* **Google Apps Script** as a small, explicit API layer
* **CustomGPT** as a conversational sommelier and controller

---

## Core Concepts (Short Version)

CellarGuide deliberately separates three things:

* **Wine** – the identity and description of a wine (producer, vintage, style, etc.)
* **Transaction** – a concrete stock movement (IN / OUT)
* **Inventory** – the current cellar state, derived from transactions

Inventory is **never written directly**. All stock changes happen via transactions.

---

## Main Capabilities

### Read

* List current cellar inventory (merged wine metadata + stock state)
* View statistics (total bottles, drinkable wines, cellar value)

### Write

* Add new wines
* Update wine metadata
* Add stock transactions (purchase, consumption, corrections)

### Recommend

* Suggest wines from the existing cellar based on food and context
* Prefer drinkable wines and sufficient quantities
* Explain recommendations briefly and pragmatically

---

## Interaction Model

CellarGuide is used entirely via **natural language**.

Typical interactions:

* "What do I have in my cellar right now?"
* "Which wines should I drink soon?"
* "What would you open for pasta with mushrooms?"
* "Add this wine and book 6 bottles into my cellar"

The CustomGPT:

* always starts by checking the current inventory
* translates natural language into explicit actions
* never invents wines, stock levels, or prices

---

## Design Principles

* Pragmatic over perfect
* Food first, not labels first
* Explain decisions briefly
* No hallucinations: missing data stays missing
* English internally, German externally

---

## What CellarGuide Is *Not*

* Not a wine marketplace
* Not an investment or valuation tool
* Not a wine encyclopedia
* Not a full accounting system

---

## Repository Structure (Overview)

* `PROJECT_INTENT.md` – conceptual background and design philosophy

* `README.md` – project overview and usage

*

* `src/` – all Google Apps Script source files

  * `main.gs` – request routing and authentication
  * `inventory.gs` – inventory-related logic
  * `wines.gs` – wine metadata handling
  * `transactions.gs` – stock movement handling
  * `sheets.gs` – Google Sheets access helpers
  * `config.gs` – configuration and secrets access
  * `utils.gs` – helper utilities (ID generation for wines and transactions)

* `actions/` – CustomGPT action definitions

  * `openapi.yaml` – OpenAPI schema for the CellarGuide API

---

## Daily Workflow (VS Code → Git → clasp)

```bash
# Repo aktualisieren (falls es Änderungen auf GitHub gibt)
git pull

# Code bearbeiten
code .

# Änderungen prüfen
git status

# Änderungen versionieren
git add .
git commit -m "Describe change"

# Nach Google Apps Script pushen
clasp push

# (optional) Web App neu bereitstellen
clasp deploy

# Nach GitHub pushen
git push
```

---

## Status

## Philosophy (One Line)

CellarGuide helps you decide **what to open next**, not what to optimize forever.

Sometimes the answer is 42.
Most of the time, it’s just a good bottle at the right moment.
