# Google Sheets Schema – CellarGuide

This document describes the structure, intent, and rules of the Google Sheets used by CellarGuide.
It contains **no data**, only schema, column definitions, and logic.

The Sheets together form a **data contract** between Google Sheets, Google Apps Script, and the CustomGPT.

---

## Sheet: Wines

### Purpose

The **Wines** sheet stores the *identity and descriptive metadata* of a wine.

Each row represents one **conceptual wine** (producer + wine + vintage), independent of how many bottles are currently owned.

This sheet contains **no stock information**.

---

### Ownership & Responsibility

**Written by**

* `addWine`
* `updateWine`

**Read by**

* `listInventory`
* recommendation logic
* statistics

**Never written by**

* Inventory logic
* Transactions logic

---

### Key Rules

* `WineID` is the primary key and never changes
* One row = one conceptual wine
* No quantities or stock-related fields exist here
* Duplicate detection uses: **Winery + Name + Vintage**

---

### Columns

| Column | Name            | Type   | Description                          |
| ------ | --------------- | ------ | ------------------------------------ |
| A      | WineID          | string | Unique wine identifier (`WXXXXXXXX`) |
| B      | Name            | string | Wine name                            |
| C      | Winery          | string | Producer / winery                    |
| D      | Region          | string | Wine region                          |
| E      | Country         | string | Country                              |
| F      | Vintage         | number | Year                                 |
| G      | Color           | enum   | `White` / `Red` / `Rosé`             |
| H      | Grapes          | string | Grape varieties (free text)          |
| I      | Style           | string | General style descriptor             |
| J      | Sweetness       | enum   | `Dry` / `Off-Dry` / `Sweet`          |
| K      | Alcohol         | number | ABV in percent                       |
| L      | DrinkFrom       | number | Start of drinking window (year)      |
| M      | DrinkUntil      | number | End of drinking window (year)        |
| N      | FoodPairing     | string | Suggested food pairings              |
| O      | Occasion        | string | Typical occasions                    |
| P      | Price           | number | Estimated price per bottle           |
| Q      | BottleSize      | string | Bottle size (e.g. `0.75l`)           |
| R      | StorageLocation | string | Default cellar location              |
| S      | Notes           | string | Free notes                           |

---

### Data Conventions

* All values are stored **in English** (technical language)
* Human-facing translation (e.g. German terms) happens outside the sheet
* Missing or unknown values are left **empty**, not guessed

---

### Field Semantics (Clarifications)

* **Color** describes only the wine color, not carbonation
* Sparkling vs. still is handled separately (not encoded in `Color`)
* **Price** is an approximate reference value, not an accounting figure
* **DrinkFrom / DrinkUntil** are guidance, not hard rules

---

### Formulas

The **Wines** sheet contains **no formulas**.
All fields are written explicitly by the API or manually corrected.

---

### Notes

The Wines sheet is intentionally stable and slow-changing.
It represents *what a wine is*, not *what happens to it*.

All quantity, timing, and history information lives elsewhere.

---

*Next sections will describe: Transactions, Inventory and Statistics.*

---

## Sheet: Transactions

### Purpose

The **Transactions** sheet records all stock movements of wines.

Each row represents one **atomic inventory change** (incoming or outgoing bottles).
Inventory levels are derived exclusively from this sheet.

This sheet is the **single source of truth** for quantities and history.

---

### Ownership & Responsibility

**Written by**

* `addTransaction`
* `addWine` (optional initial stock booking)

**Read by**

* Inventory formulas
* `listInventory`
* statistics

**Never written by**

* manual inventory edits
* Inventory logic

---

### Key Rules

* All stock changes must be represented as transactions
* Inventory is never written directly
* Each transaction is immutable once written
* OUT transactions must not exceed available stock

---

### Columns

| Column | Name          | Type   | Description                                         |
| ------ | ------------- | ------ | --------------------------------------------------- |
| A      | TransactionID | string | Unique transaction identifier (`TXXXXXXXX`)         |
| B      | Date          | date   | Transaction date                                    |
| C      | WineID        | string | Reference to `Wines.WineID`                         |
| D      | Quantity      | number | Positive integer number of bottles                  |
| E      | Type          | enum   | `IN` or `OUT`                                       |
| F      | Reason        | string | Reason for movement (e.g. Purchase, Consumed, Gift) |
| G      | Person        | string | Optional person reference                           |
| H      | Comment       | string | Optional free comment                               |

---

### Data Conventions

* `Quantity` is always positive
* Direction is encoded only via `Type`
* Dates are stored as real date values, not text
* Reasons are short, descriptive, and consistent

---

### Validation Rules (Logical)

* `WineID` must exist in the Wines sheet
* OUT transactions are blocked if resulting stock would be negative
* Transactions are append-only; corrections require compensating transactions

---

### Formulas

The **Transactions** sheet contains **no formulas**.

All rows are appended explicitly via the API.

---

### Notes

Transactions represent *what happens to wine bottles over time*.

They are intentionally verbose and historical.

Any correction (mistake, forgotten booking) is handled by an additional transaction, never by editing history.

---

## Sheet: Inventory

### Purpose

The **Inventory** sheet represents the **current cellar state**.

It is a **derived view** built from:

* `Transactions` (quantities, history, last movement)
* `Wines` (descriptive metadata)

This sheet exists for convenience, filtering, and API consumption.

It is not a primary data source.

---

### Ownership & Responsibility

**Written by**

* Google Sheets formulas only

**Read by**

* `listInventory`
* statistics
* recommendation logic

**Never written by**

* `addWine`, `updateWine`, `addTransaction`
* any manual edits to derived columns

---

### Key Rules

* Inventory is derived; it must be reproducible from `Transactions` + `Wines`
* Inventory must include wines that ever appeared in `Transactions`, even if stock is 0
* A wine can exist in `Wines` without appearing in `Inventory` until the first transaction is booked
* Derived columns should be kept formula-driven and not edited manually

---

### Columns

Inventory columns are a **merged subset** used for day-to-day management.

| Column | Name                | Type    | Source                                   |
| ------ | ------------------- | ------- | ---------------------------------------- |
| A      | WineID              | string  | derived from `Transactions`              |
| B      | Name                | string  | lookup from `Wines`                      |
| C      | Winery              | string  | lookup from `Wines`                      |
| D      | Vintage             | number  | lookup from `Wines`                      |
| E      | Color               | enum    | lookup from `Wines`                      |
| F      | StorageLocation     | string  | lookup from `Wines`                      |
| G      | CurrentStock        | number  | derived from `Transactions`              |
| H      | LastTransactionDate | date    | derived from `Transactions`              |
| I      | IsDrinkableNow      | boolean | derived from drink window (if available) |
| J      | DrinkSoon           | boolean | derived from drink window (if available) |

---

### Formulas

> Note: formulas below assume **German function names** and typical column mapping.
> If your sheet locale changes, function names must be adapted.
> 
> These formulas are intentionally optimized for correctness and stability,
> not for minimal complexity.
>
> Readability in Sheets was preferred over compactness.

#### A2: Wine list (all wines that ever appeared in Transactions)

```gs
=UNIQUE(FILTER(Transactions!C2:C;Transactions!C2:C<>""))
```

#### B2: Name

```gs
=ARRAYFORMULA(
  WENN(
    A2:A="";
    "";
    WENNFEHLER(
      XVERWEIS(A2:A;Wines!A:A;Wines!B:B);
      ""
    )
  )
)
```

#### C2: Winery

```gs
=ARRAYFORMULA(
  WENN(
    A2:A="";
    "";
    WENNFEHLER(
      XVERWEIS(A2:A;Wines!A:A;Wines!C:C);
      ""
    )
  )
)
```

#### D2: Vintage

```gs
=ARRAYFORMULA(
  WENN(
    A2:A="";
    "";
    WENNFEHLER(
      XVERWEIS(A2:A;Wines!A:A;Wines!F:F);
      ""
    )
  )
)
```

#### E2: Color

```gs
=ARRAYFORMULA(
  WENN(
    A2:A="";
    "";
    WENNFEHLER(
      XVERWEIS(A2:A;Wines!A:A;Wines!G:G);
      ""
    )
  )
)
```

#### F2: StorageLocation

```gs
=ARRAYFORMULA(
  WENN(
    A2:A="";
    "";
    WENNFEHLER(
      XVERWEIS(A2:A;Wines!A:A;Wines!R:R);
      ""
    )
  )
)
```

#### G2: CurrentStock

```gs
=ARRAYFORMULA(
  WENN(
    A2:A="";
    "";
    WENNFEHLER(
      SVERWEIS(
        A2:A;
        QUERY(
          {Transactions!C2:C\WENN(Transactions!E2:E="IN";Transactions!D2:D;-Transactions!D2:D)};
          "select Col1, sum(Col2) where Col1 is not null group by Col1 label sum(Col2) ''";
          0
        );
        2;
        FALSCH
      );
      0
    )
  )
)
```

#### H2: LastTransactionDate

```gs
=ARRAYFORMULA(
  WENN(
    A2:A="";
    "";
    WENNFEHLER(
      SVERWEIS(
        A2:A;
        QUERY(
          Transactions!B2:C;
          "select Col2, max(Col1) where Col2 is not null group by Col2 label max(Col1) ''";
          0
        );
        2;
        FALSCH
      );
      ""
    )
  )
)
```

#### I2: IsDrinkableNow (based on DrinkFrom/DrinkUntil if present)

```gs
=ARRAYFORMULA(
  WENN(
    A2:A="";
    "";
    WENNFEHLER(
      HEUTE() >= DATUM(XVERWEIS(A2:A; Wines!A:A; Wines!L:L); 1; 1);
      FALSCH
    )
  )
)
```

#### J2: DrinkSoon (true if within 12 months of DrinkUntil)

```gs
=ARRAYFORMULA(
  WENN(
    A2:A="";
    "";
    WENNFEHLER(
      HEUTE() >= DATUM(XVERWEIS(A2:A;Wines!A:A;Wines!M:M)-1;1;1);
      FALSCH
    )
  )
)
```

---

### Notes

* Inventory is intentionally “opinionated”: it surfaces the fields most useful for daily cellar decisions.
* The API may return a richer merged view by joining Inventory with Wines.
* If `MAXWENNS` is not available in the sheet locale, LastTransactionDate must be derived differently.

---

## Sheet: Statistics

### Purpose
The **Statistics** sheet provides a deterministic, spreadsheet-native source of truth for key cellar metrics.

It exists to avoid LLM calculation errors and to keep the most important numbers (bottles, counts, distributions) reproducible and testable directly in Google Sheets.

---

### Ownership & Responsibility

**Written by**
- Google Sheets formulas only

**Read by**
- Apps Script API (via `listInventory` response enrichment)
- CustomGPT for summary views

**Never written by**
- manual edits in the Value column
- API endpoints

---

### Structure

The sheet is a simple key/value table:

| Column | Name | Type | Description |
|------|------|------|-------------|
| A | Key | string | Stable identifier for a metric |
| B | Value | number / boolean / string | Formula result |
| C | Comment | string | Human-readable explanation |

Keys must be stable over time. Values are derived by formulas.

---

### Keys (Top 10)

| Key | Value Formula (German locale) | Comment |
|---|---|---|
| TotalPositions | `=ANZAHL2(Inventory!A2:A)` | Number of distinct wines in Inventory |
| TotalBottles | `=SUMME(Inventory!G2:G)` | Total bottles in cellar |
| DrinkableCount | `=ZÄHLENWENN(Inventory!I2:I;WAHR)` | Wines currently drinkable |
| DrinkSoonCount | `=ZÄHLENWENN(Inventory!J2:J;WAHR)` | Wines to drink soon |
| DrinkableBottles | `=SUMMEWENNS(Inventory!G2:G;Inventory!I2:I;WAHR)` | Bottles that are drinkable |
| DrinkSoonBottles | `=SUMMEWENNS(Inventory!G2:G;Inventory!J2:J;WAHR)` | Bottles to drink soon |
| WhiteBottles | `=SUMMEWENNS(Inventory!G2:G;Inventory!E2:E;"White")` | Bottles of white wine |
| RedBottles | `=SUMMEWENNS(Inventory!G2:G;Inventory!E2:E;"Red")` | Bottles of red wine |
| RoseBottles | `=SUMMEWENNS(Inventory!G2:G;Inventory!E2:E;"Rosé")` | Bottles of rosé |
| EmptyPositions | `=ZÄHLENWENN(Inventory!G2:G;0)` | Wines with stock = 0 |

---

### Notes

- The API should treat the Statistics sheet as the canonical source for summary numbers.
- The CustomGPT must use `data.stats` from the API response instead of recalculating.
- Additional keys can be added over time without breaking existing consumers, as long as existing keys remain unchanged.


*This completes the schema for Wines, Transactions, Inventory and Statistics.*
