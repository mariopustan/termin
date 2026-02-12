# Entwicklungsteam für regulierte Software – IT Warehouse AG

## Übersicht

Dieses Verzeichnis enthält die System-Prompts für ein agentenbasiertes Entwicklungsteam, das speziell für die Entwicklung regulierter Softwarelösungen im deutschen Versicherungsmarkt konzipiert ist. Das Team besteht aus 14 spezialisierten Agenten, die von einem Orchestrator (CLAUDE.md) koordiniert werden.

## Struktur

```
Entwicklerteam/
├── CLAUDE.md                              ← Orchestrator (Haupteinstiegspunkt)
├── README.md                              ← Diese Datei
├── ANALYSE-Entwicklerteam.md              ← Analyse und Optimierungshistorie
├── agents/
│   ├── product-owner.md                   ← Anforderungen, User Stories, Regulatory Impact
│   ├── solution-architect.md              ← Architektur, Datenmodell, API-Design, ADRs
│   ├── frontend-engineer.md               ← UI/UX, Barrierefreiheit, CI-konforme Oberflächen
│   ├── backend-engineer.md                ← API-Logik, Mandantenisolation, Audit-Trail
│   ├── security-engineer.md               ← Security Review, SBOM, OWASP, Zero Trust
│   ├── qa-engineer.md                     ← Tests, Accessibility, Performance, Chaos Engineering
│   ├── compliance-officer.md              ← Compliance-Matrix, Dokumentation, Audit-Readiness
│   ├── devops-engineer.md                 ← CI/CD, Monitoring, Betrieb, Disaster Recovery
│   ├── refactoring-engineer.md            ← Code-Refactoring, Anti-Patterns, Legacy-Migration
│   ├── ui-ux-reviewer.md                  ← Visuelle Validierung, CI-Konformität, WCAG-Verifikation
│   ├── agent-architect.md                 ← Neue Agenten erstellen, Team erweitern
│   ├── technical-writer.md                ← API-Docs, Benutzerhandbücher, Release Notes
│   ├── integration-engineer.md            ← Externe APIs, Contract Testing, Webhook-Management
│   └── performance-engineer.md            ← Profiling, DB-Optimierung, Chaos Engineering, Resilienztests
└── shared/
    ├── tech-stack.md                      ← Verbindliche Technologie-Entscheidungen
    ├── glossar.md                         ← Einheitliche Fachbegriffe (bAV, Versicherung, Technik)
    ├── personas.md                        ← 6 Nutzer-Personas mit Barrierefreiheits-Anforderungen
    └── architecture-principles.md         ← Architekturprinzipien, NFR-Template, C4-Modell
```

---

## Team-Übersicht (14 Agenten)

| # | Agent | Phase | Schwerpunkt |
|---|-------|-------|-------------|
| 1 | Product Owner | Phase 1 | Anforderungen, User Stories, Regulatory Impact Assessment |
| 2 | Solution Architect | Phase 1 | Architektur, Datenmodell, API-Design, ADRs, C4-Modell |
| 3 | Frontend Engineer | Phase 2 | UI/UX, Barrierefreiheit, Design Tokens, Performance-Budgets |
| 4 | Backend Engineer | Phase 2 | API-Logik, Caching, Events, Health Checks, Mandantenisolation |
| 5 | Security Engineer | Phase 3 | Security Review, SBOM, Zero Trust, Penetrationstest-Konzept |
| 6 | QA Engineer | Phase 3 | Testing Pyramid, Contract Tests, Chaos Engineering, Visual Regression |
| 7 | Compliance Officer | Phase 3+4 | Compliance-Matrix, KI-VO, Zertifikat-Inventar, Release-Freigabe |
| 8 | DevOps Engineer | Phase 4 | CI/CD, Container Security, Observability Stack, Game Days |
| 9 | Refactoring Engineer | On-Demand | Code-Refactoring, Anti-Pattern-Beseitigung, Strangler Fig Pattern |
| 10 | UI/UX Reviewer | Phase 2b | Visuelle Validierung, CI-Konformität, Usability-Testing |
| 11 | Agent Architect | On-Demand | Neue Agenten erstellen, Team erweitern |
| 12 | Technical Writer | Phase 4 | API-Docs, Benutzerhandbücher, Release Notes, Knowledge Base |
| 13 | Integration Engineer | Phase 2 | Externe APIs, Contract Testing, Webhook-Management, DORA-Drittparteien |
| 14 | Performance Engineer | Phase 3 | Profiling, DB-Optimierung, Chaos Engineering, DORA-Resilienztests |

---

## Shared Context

Das Verzeichnis `shared/` enthält teamübergreifende Referenzdokumente, die von allen Agenten genutzt werden:

| Datei | Inhalt | Pflicht für |
|-------|--------|-------------|
| `shared/tech-stack.md` | Angular, NestJS, PostgreSQL, Docker, Monitoring | Alle Agenten |
| `shared/glossar.md` | 30+ Fachbegriffe aus bAV, Versicherung, Technik, Regulatorik | Alle Agenten |
| `shared/personas.md` | 6 Personas: Makler, HR-Manager, Arbeitnehmer, Admin, API-Partner, Prüferin | PO, FE, UI/UX, TW |
| `shared/architecture-principles.md` | Architekturprinzipien, NFR-Template, Caching, Events, C4, API-Design | SA, BE, SE, PE |

---

## Prozessmodell (5 Phasen)

```
Phase 1: PLANUNG
  → Product Owner + Solution Architect

Phase 2: ENTWICKLUNG
  → Frontend Engineer + Backend Engineer + Integration Engineer (parallel)

Phase 2b: VISUELLE PRÜFUNG
  → UI/UX Reviewer

Phase 3: PRÜFUNG
  → Security Engineer + QA Engineer + Performance Engineer (parallel)
  → Compliance Officer

Phase 4: BEREITSTELLUNG
  → DevOps Engineer + Technical Writer (parallel)
  → Compliance Officer (Release-Freigabe)

Phase 5: NACHBEREITUNG
  → Lessons Learned + Knowledge-Base-Update
```

---

## Installation und Nutzung

### Schritt 1: Dateien ins Projekt kopieren

Kopiere den gesamten Ordner in das `.claude/` Verzeichnis deines Projekts:

```bash
# Gesamte Struktur kopieren
cp -r Entwicklerteam/.  /pfad/zu/deinem/projekt/.claude/

# Oder selektiv:
mkdir -p /pfad/zu/deinem/projekt/.claude/{agents,shared}
cp Entwicklerteam/CLAUDE.md /pfad/zu/deinem/projekt/.claude/
cp Entwicklerteam/agents/*.md /pfad/zu/deinem/projekt/.claude/agents/
cp Entwicklerteam/shared/*.md /pfad/zu/deinem/projekt/.claude/shared/
```

### Schritt 2: Claude Code starten

**Option A – Claude Code Extension in VS Code (empfohlen):**

1. Installiere die "Claude Code" Extension aus dem VS Code Marketplace
2. Öffne dein Projekt in VS Code
3. Öffne das Claude Code Panel (Sidebar-Icon oder Cmd+Shift+P → "Claude Code")
4. Claude erkennt automatisch die CLAUDE.md und die Agenten

**Option B – Claude Code im Terminal:**

1. Öffne das Terminal im Projektverzeichnis
2. Starte Claude Code: `claude`
3. Claude erkennt automatisch die CLAUDE.md und die Agenten

### Schritt 3: Agenten prüfen

Prüfe ob die Agenten erkannt werden: `/agents`

---

## Wie du mit dem Team arbeitest

**Einfach loslegen:** Beschreibe dein Feature, der Orchestrator delegiert automatisch an die richtigen Agenten.

**Gezielt aufrufen:** "Nutze den security-engineer Agent für ein Security Review"

**Refactoring:** "Analysiere das Modul X auf Anti-Patterns und erstelle einen Refactoring-Plan"

**UI prüfen:** "Prüfe die neue Seite auf CI-Konformität und Barrierefreiheit"

**Performance:** "Führe ein Profiling der Datenbankabfragen für das Mandanten-Modul durch"

**Integration:** "Binde die DATEV-API an und erstelle Contract Tests"

**Dokumentation:** "Erstelle Release Notes für Version 2.4"

**Team erweitern:** "Erstelle einen neuen Agent für Datenbankmigrationen"

**Status prüfen:** "Wie ist der Compliance-Stand für Release 2.4?"

---

## Regulatorische Abdeckung

| Vorschrift | Abgedeckt durch |
|------------|----------------|
| DORA (IKT-Risiko, Art. 5-16) | Alle Agenten, Schwerpunkt: Compliance Officer, Security Engineer |
| DORA (Incident Management, Art. 17-23) | Security Engineer, DevOps Engineer, Compliance Officer |
| DORA (Resilienztests, Art. 24-27) | Performance Engineer, QA Engineer, DevOps Engineer |
| DORA (Drittparteien, Art. 28-44) | Integration Engineer, Compliance Officer, Security Engineer |
| DSGVO | Product Owner (RIA), Solution Architect (Privacy by Design), Compliance Officer |
| VA IT 2 | Compliance Officer, DevOps Engineer, Technical Writer, Performance Engineer |
| NIS2 | Security Engineer, Compliance Officer, DevOps Engineer, Integration Engineer |
| KI-VO (EU AI Act) | Product Owner, Compliance Officer (detaillierte Risikokategorien) |
| BFSG / WCAG 2.2 AA | Frontend Engineer, QA Engineer, UI/UX Reviewer, Technical Writer |

---

## Tech-Stack (Kurzübersicht)

Die vollständigen Technologie-Entscheidungen sind in `shared/tech-stack.md` dokumentiert.

| Bereich | Technologie |
|---------|-------------|
| Frontend | Angular (TypeScript strict mode), SCSS, Open Sans |
| Backend | Node.js / NestJS (TypeScript strict mode) |
| Datenbank | PostgreSQL (Row-Level Security für Mandantenisolation) |
| Container | Docker |
| Hosting | akquinet GmbH Hamburg (TÜV IT TSI Level 3) + Hetzner |
| Mandanten | 40+ Maklerhäuser, strikte Isolation |

---

## Changelog

### Version 1.1 (2026-02-11)

**Neue Agenten:**
- Technical Writer (#12) – API-Docs, Benutzerhandbücher, Release Notes
- Integration Engineer (#13) – Externe APIs, Contract Testing, DORA-Drittparteien
- Performance Engineer (#14) – Profiling, Chaos Engineering, DORA-Resilienztests

**Neuer Shared Context (4 Dateien):**
- `shared/tech-stack.md` – Verbindliche Technologie-Entscheidungen
- `shared/glossar.md` – Einheitliches Glossar mit 30+ Fachbegriffen
- `shared/personas.md` – 6 Nutzer-Personas mit Barrierefreiheits-Anforderungen
- `shared/architecture-principles.md` – Architekturprinzipien, NFR-Template, C4-Modell

**Verbesserungen an bestehenden Agenten (alle auf v1.1):**
- Product Owner: Stakeholder-Mapping, Backlog-Priorisierung (P0-P3)
- Solution Architect: C4-Architektur-Visualisierung, NFR-Template, Caching-Strategie
- Frontend Engineer: Design Tokens, Storybook Pattern Library, Performance-Budgets
- Backend Engineer: Caching (Redis), Event-basierte Kommunikation, Health Checks
- Security Engineer: API-Security-Checkliste, Penetrationstest-Konzept, Zero Trust
- QA Engineer: Testing Pyramid, Contract Testing (Pact), Chaos Engineering, Visual Regression
- Compliance Officer: KI-VO Risikokategorien, Compliance-Audit, Zertifikat-Inventar
- DevOps Engineer: Infrastructure Security Baseline, Container Security, Observability Stack
- Refactoring Engineer: Legacy-Migrationsstrategie (Strangler Fig Pattern)
- UI/UX Reviewer: Visual Regression Tools, Usability-Testing (Nielsen's Heuristiken)
- Agent Architect: Shared-Context-Integration, Version-Feld im Template

**Orchestrator (CLAUDE.md):**
- Team erweitert von 11 auf 14 Agenten
- Shared Context Sektion hinzugefügt
- Phase 5 (Nachbereitung) ergänzt
- Definition of Done (12 Kriterien)
- Feature-Lifecycle-Tracker Template
- WIP-Limit (max. 2 parallele Features)

**Strukturänderungen:**
- Agent-Dateien in `agents/` Unterordner verschoben
- Neues `shared/` Verzeichnis für teamübergreifende Referenzen

### Version 1.0 (2026-02-05 / erweitert 2026-02-09)

- Initiale Erstellung mit 8 Agenten
- Erweitert um Refactoring Engineer, UI/UX Reviewer, Agent Architect (11 Agenten)
- Erstellt für: IT Warehouse AG / smart!Cloud Services AG
