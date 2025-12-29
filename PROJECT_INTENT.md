# CellarGuide – Project Intent & Context

## 1. Was ist CellarGuide?

CellarGuide ist ein persönliches, leichtgewichtiges System zur Verwaltung und Nutzung eines privaten Weinkellers.

Ziel ist es nicht, einen perfekten, vollständigen Weinkatalog zu führen, sondern den realen Kelleralltag abzubilden:

* Welche Weine sind da?
* In welcher Menge?
* Was ist trinkreif?
* Was passt heute zum Essen?

Die Hauptnutzer sind private Weinliebhaber, die ihren Keller strukturiert, aber ohne Bürokratie verwalten wollen. CellarGuide löst das Problem, dass Weinbestände oft entweder nur im Kopf existieren oder in überkomplexen Tools gepflegt werden, die im Alltag keinen Spaß machen.

---

## 2. Grundidee & Philosophie

CellarGuide folgt einer klaren Haltung:

* pragmatisch statt akademisch
* genussorientiert statt sammelgetrieben
* erklärend statt belehrend

Es ist kein Snobismus-Projekt und kein ERP-System für Wein. Entscheidungen sollen nachvollziehbar, aber nicht überoptimiert sein. Ein Wein soll geöffnet werden, weil er passt – nicht, weil eine Regel es verlangt.

---

## 3. Mentales Modell

CellarGuide trennt drei Dinge strikt voneinander:

* **Wine**: die Identität und Beschreibung eines Weins (Name, Weingut, Jahrgang, Stil, Trinkfenster usw.)
* **Transaction**: eine konkrete Bewegung (Zugang oder Abgang von Flaschen)
* **Inventory**: der abgeleitete aktuelle Bestand

Der Bestand wird niemals direkt geschrieben. Er ergibt sich immer aus der Summe der Transaktionen. Diese Trennung ist bewusst gewählt, um Nachvollziehbarkeit, Korrekturen und saubere Empfehlungen zu ermöglichen.

---

## 4. Rolle des LLM / CustomGPT

Das LLM übernimmt die Rolle eines entspannten Sommeliers und Übersetzers:

* Es ist **kein** Speicher und **keine** Datenbank.
* Es erklärt, interpretiert, filtert und empfiehlt.
* Es übersetzt natürliche Sprache in strukturierte Aktionen.

Das LLM trifft keine Entscheidungen ohne Datenbasis und erfindet keine Fakten. Es arbeitet immer auf Basis des aktuellen Kellerzustands, den es über definierte Schnittstellen erhält.

---

## 5. Datenprinzipien

CellarGuide folgt klaren Datenregeln:

* Intern (Sheets, API, Logik): **Englisch, normiert, maschinenlesbar**
* Extern (Interaktion, Antworten): **Deutsch, natürlich, verständlich**

Übersetzung zwischen beiden Welten erfolgt ausschließlich im LLM.

Weitere Prinzipien:

* keine Halluzinationen
* fehlende Daten bleiben leer
* Annahmen werden explizit benannt

---

## 6. Bewusste Vereinfachungen

CellarGuide verzichtet bewusst auf Perfektion:

* Dublettenregel: gleicher Wein = Winery + Name + Vintage
* Preise sind Schätzwerte pro Flasche, keine Buchhaltungsdaten
* Trinkfenster sind grobe Orientierung, keine exakte Wissenschaft

Diese Vereinfachungen sind akzeptiert, dokumentiert und jederzeit korrigierbar.

---

## 7. Was CellarGuide bewusst nicht ist

CellarGuide ist ausdrücklich:

* **keine** Buchhaltungssoftware
* **kein** Weinlexikon
* **kein** Bewertungsportal
* **keine** Kauf- oder Investmentberatung

Es geht um Nutzung, Genuss und Übersicht – nicht um Marktpreise, Scores oder Prestige.

---

## 8. Wie mit CellarGuide interagiert wird

CellarGuide wird ausschließlich über natürliche Sprache genutzt.

Grundprinzipien der Interaktion:

* Jede Interaktion beginnt mit dem Abruf des aktuellen Kellerbestands.
* Aktionen erfolgen nur explizit, nie implizit.
* Empfehlungen basieren primär auf vorhandenen Weinen.

Die verfügbaren Schnittstellen sind bewusst minimal:

* **listInventory**: liefert den aktuellen Kellerzustand (alle Empfehlungen basieren darauf)
* **addWine**: legt einen Wein als Beschreibung an
* **updateWine**: ändert Weindaten
* **addTransaction**: verändert den Bestand über IN/OUT-Bewegungen

Inventory wird niemals direkt manipuliert, sondern stets aus Transaktionen abgeleitet.

Nach jeder schreibenden Aktion erklärt CellarGuide kurz, was geändert wurde und warum.

---

## 9. Erweiterbarkeit & Zukunft

CellarGuide ist bewusst offen, aber nicht überladen.

Mögliche Erweiterungen:

* bessere Statistiken
* feinere Empfehlungen
* zeitliche Analysen (Trinkdruck, Entwicklung)

Nicht-Ziel ist es, jede denkbare Wein-Eigenschaft abzubilden. Neue Funktionen werden nur ergänzt, wenn sie den Kern unterstützen: den eigenen Keller besser zu nutzen, nicht komplexer zu machen.