# Analyse: Entwicklerteam für regulierte Software

**Datum:** 2026-02-11
**Erstellt für:** Mario Pustan, Vorstand IT Warehouse AG
**Gegenstand:** Review aller 11 Agenten-Systemprompts + Orchestrator (CLAUDE.md)

---

## 1. Gesamtbewertung

Das Team ist **sehr solide aufgestellt** und gehört zu den durchdachtesten Agent-Setups, die ich für regulierte Softwareentwicklung gesehen habe. Besonders stark sind die regulatorische Durchdringung (DORA, DSGVO, VA IT 2, NIS2, KI-VO, BFSG durchgehend in allen Agenten verankert), die Mandantenisolation als roter Faden durch jede Ebene und das einheitliche Finding-Format mit klaren Übergabe-Checklisten.

Es gibt aber einige Lücken und Verbesserungspotenziale, die den Unterschied zwischen "gut" und "outstanding" ausmachen.

---

## 2. Was hervorragend funktioniert

**Regulatorische Tiefe:** Nicht nur der Compliance Officer kennt die Vorschriften – jeder Agent hat die für ihn relevanten Artikel internalisiert. Der Backend Engineer weiß, warum er Mandantenfilter braucht (DORA Art. 9, DSGVO Art. 32), der Frontend Engineer kennt BFSG/WCAG. Das ist selten und sehr wertvoll.

**Mandantenisolation als Designprinzip:** Vom Solution Architect (Architekturentscheidung) über den Backend Engineer (jede Query) bis zum QA Engineer (Cross-Tenant-Tests) und UI/UX Reviewer (keine Daten des falschen Mandanten sichtbar) ist das durchgängig abgesichert. Bei 40+ Maklerhäusern absolut kritisch.

**Phasenmodell mit Quality Gates:** Der sequenzielle Flow (Planung → Entwicklung → Prüfung → Bereitstellung) mit Übergabe-Checklisten an jeder Schnittstelle ist gut strukturiert. Die Maximal-2-Iterationszyklen-Regel verhindert Endlosschleifen.

**Mehrfach abgesicherte Barrierefreiheit:** Frontend Engineer baut ein, UI/UX Reviewer prüft visuell, QA Engineer testet automatisiert + manuell. Dreifache Absicherung für BFSG-Compliance.

**Agent Architect als Meta-Agent:** Die Fähigkeit, das Team selbst zu erweitern, ist clever und skalierbar.

---

## 3. Fehlende Perspektiven (neue Agenten empfohlen)

### 3.1 Technical Writer / Documentation Engineer (Priorität: HOCH)

**Problem:** Der Compliance Officer dokumentiert regulatorisch, aber niemand kümmert sich um verständliche, zielgruppengerechte technische Dokumentation.

**Was fehlt:**
- API-Dokumentation für externe Partner (Maklerhäuser, Versicherer, SAP/DATEV-Integratoren)
- Benutzerhandbücher und Onboarding-Guides für Maklerhäuser
- Developer Documentation für interne und externe Entwickler
- Release Notes in verständlicher Sprache
- Knowledge-Base-Artikel für häufige Fragen

**Warum relevant:** Mit 40+ Maklerhäusern und Enterprise-API-Integrationen (SAP, DATEV, Personio) ist Dokumentation kein Nice-to-have, sondern geschäftskritisch. VA IT 2 fordert zudem nachvollziehbare IT-Dokumentation.

**Einordnung:** Phase 4 (Bereitstellung), parallel zum DevOps Engineer.

### 3.2 Integration / API-Governance Engineer (Priorität: MITTEL-HOCH)

**Problem:** Der Backend Engineer macht Integrationen "nebenbei", aber die Anbindung an SAP, DATEV, Personio und Versicherer-APIs ist komplex genug für eine eigene Spezialisierung.

**Was fehlt:**
- Contract Testing (Pact oder ähnlich) – was passiert, wenn die Versicherer-API ihre Struktur ändert?
- API Gateway Management und Versionierung über Services hinweg
- Webhook-Management und Event-basierte Integrationen
- Mapping-Tabellen zwischen internem Datenmodell und externen Formaten
- SLA-Monitoring für Drittanbieter-APIs (DORA Art. 28-44!)

**Warum relevant:** DORA Art. 28-44 fordert explizites Management von IKT-Drittanbietern. Wenn die SAP-Schnittstelle am Freitagabend ausfällt, braucht es jemanden, der das Fallback-Verhalten und die Monitoring-Strategie dafür verantwortet.

**Einordnung:** Phase 2 (Entwicklung), parallel zu Frontend/Backend.

### 3.3 Performance / Reliability Engineer (Priorität: MITTEL)

**Problem:** Performance ist zwischen QA (Lasttests), DevOps (Monitoring) und Solution Architect (Kapazitätsplanung) aufgeteilt, aber niemand hat den ganzheitlichen Blick.

**Was fehlt:**
- Proaktives Profiling und Bottleneck-Analyse (nicht nur reaktive Lasttests)
- Database Query Optimization (bei 40+ Mandanten mit Row-Level Security ein Thema)
- Caching-Strategien (Redis, CDN, Application-Level)
- Chaos Engineering / Game Days (DORA Art. 24-27 fordert explizit Resilienztests!)
- Kapazitätsprognosen basierend auf Wachstumsdaten

**Warum relevant:** DORA Art. 24-27 fordert nicht nur Tests, sondern "Threat-Led Penetration Testing" und szenariobasierte Resilienztests. Das geht über einfache Lasttests hinaus. Aktuell ist das eine Lücke.

---

## 4. Fehlende übergreifende Patterns

### 4.1 Shared Context / Knowledge Base (Priorität: HOCH)

**Problem:** Die Agenten referenzieren einander, aber es gibt keinen geteilten Wissenspool.

**Empfehlung:** Erstelle ein `/shared/`-Verzeichnis mit:
- `tech-stack.md` – Definiert verbindlich den Tech-Stack (TypeScript, Angular/React?, PostgreSQL, Node.js?)
- `glossar.md` – Einheitliche Begriffe für alle Agenten (Was ist ein "Mandant"? Was ist eine "Versorgungszusage"?)
- `personas.md` – Die Nutzergruppen mit konkreten Profilen (Makler Müller, HR-Managerin Schmidt, Endkunde Weber)
- `architecture-principles.md` – Die übergreifenden Architekturprinzipien, auf die alle Agenten sich beziehen können

**Warum:** Aktuell weiß der Refactoring Engineer, dass Angular-Patterns (inject()) verwendet werden, aber das steht nirgends als verbindliche Entscheidung. Wenn der Backend Engineer TypeScript "mit strict mode ODER starke Typisierung" schreibt, ist das zu vage.

### 4.2 Tech-Stack-Definition (Priorität: HOCH)

**Problem:** Nirgends ist verbindlich definiert, welche Technologien eingesetzt werden.

**Hinweise aus den Prompts:**
- Refactoring Engineer verwendet Angular-Patterns (`inject()`, Smart/Presentational Components)
- Backend Engineer referenziert TypeScript, PostgreSQL
- Frontend Engineer spricht von CSS-Variables und TypeScript
- DevOps referenziert Docker (Container-Scan), aber kein konkretes Orchestrierungstool

**Empfehlung:** Im Orchestrator oder in einer shared-Datei den Stack festschreiben. Das verhindert, dass ein Agent React-Code generiert, während der andere Angular erwartet.

### 4.3 Feature-Lifecycle-Tracking (Priorität: MITTEL)

**Problem:** Es gibt kein durchgängiges Feature-Template, das den Status über alle Phasen hinweg trackt.

**Empfehlung:** Ein Feature-Tracker-Template in der CLAUDE.md oder als eigenes Dokument:

```
Feature: [Name]
Status: Phase 1/2/2b/3/4
PO: ✅ RIA + Stories
SA: ✅ ADR + Architektur
FE: ⏳ In Arbeit
BE: ⏳ In Arbeit
UI/UX Review: ⬜ Ausstehend
Security: ⬜ Ausstehend
QA: ⬜ Ausstehend
Compliance: ⬜ Ausstehend
DevOps: ⬜ Ausstehend
```

### 4.4 Definition of Done (Priorität: MITTEL)

**Problem:** Jeder Agent hat eine Übergabe-Checkliste, aber es fehlt eine übergreifende Definition of Done, die alle Agenten verbindet.

**Empfehlung:** In der CLAUDE.md ergänzen, was "fertig" auf Team-Ebene bedeutet (alle Quality Gates grün + Compliance-Freigabe + Monitoring aktiv + Dokumentation aktuell).

---

## 5. Verbesserungen an bestehenden Prompts

### 5.1 CLAUDE.md (Orchestrator)

| Thema | Problem | Empfehlung |
|-------|---------|------------|
| Parallele Features | Kein Konzept für mehrere gleichzeitige Features | Ergänze eine Regel: Wie wird priorisiert, wenn mehrere Features parallel laufen? WIP-Limit? |
| Wissenstransfer | Erkenntnisse aus einem Feature fließen nicht systematisch in das nächste ein | Ergänze einen "Lessons Learned"-Schritt nach Phase 4 |
| Definition of Done | Fehlt als übergreifendes Konzept | Ergänze eine DoD, die alle Agent-Übergaben zusammenfasst |
| Versionierung der Agenten | Die Prompts selbst haben kein Changelog | Ergänze Versionsnummern im Frontmatter jedes Agenten |

### 5.2 Product Owner

| Thema | Empfehlung |
|-------|------------|
| Personas fehlen | Definiere konkrete Nutzer-Personas (Makler, HR-Manager, Endkunde, Admin, Versicherer-API-Consumer) |
| Kein Backlog-Kontext | Ergänze eine Anweisung, wie neue Stories gegenüber bestehenden priorisiert werden |
| Stakeholder-Mapping | Ergänze: Wer muss bei welchen Features einbezogen werden? (z.B. Datenschutzbeauftragter bei neuen Verarbeitungstätigkeiten) |

### 5.3 Solution Architect

| Thema | Empfehlung |
|-------|------------|
| Kein Architektur-Visualisierungsstandard | Empfehle C4-Modell oder arc42 als Standardformat |
| Non-Functional Requirements Template fehlt | Ergänze ein NFR-Template (Performance-Budgets, SLAs, Verfügbarkeitsziele pro Feature) |
| Caching-Strategie fehlt | Ergänze eine Sektion zu Caching (welche Daten, welche Strategie, Invalidierung) |

### 5.4 Frontend Engineer

| Thema | Empfehlung |
|-------|------------|
| Kein Design-Token-System | Die CSS-Variablen sind gut, aber ein formalisiertes Token-System (Spacing, Radii, Shadows) fehlt |
| Pattern Library nicht erwähnt | Ergänze Storybook oder eine ähnliche Komponentenbibliothek als Anforderung |
| High Contrast Mode fehlt | BFSG erfordert auch Unterstützung für den Windows High Contrast Mode – ergänze dies in der Checkliste |
| Keine Performance-Budgets | Ergänze maximale Bundle-Sizes, Lighthouse Performance Score ≥ 90 |

### 5.5 Backend Engineer

| Thema | Empfehlung |
|-------|------------|
| Caching-Konzept fehlt | Ergänze eine Sektion zu Caching (Redis, In-Memory, CDN-Invalidierung) |
| Event-basierte Architektur fehlt | Bei 40+ Mandanten und asynchronen Prozessen (bAV-Verarbeitung) sind Events relevant |
| Webhook-Patterns fehlen | Für Versicherer-APIs und Integrationspartner |
| Health-Check-Endpunkte nicht definiert | Ergänze ein Standard-Pattern für /health, /ready, /live |

### 5.6 Security Engineer

| Thema | Empfehlung |
|-------|------------|
| Kein Penetrationstest-Konzept | Ergänze eine Empfehlung für externe Pentests (Frequenz, Scope, Anbieteranforderungen) |
| Zero-Trust nicht erwähnt | Ergänze Zero-Trust-Architekturprinzipien |
| API-Security-Checkliste fehlt | OAuth2-Konfiguration, JWT-Rotation, API-Gateway-Security, CORS-Konfiguration |
| Supply-Chain-Security zu dünn | SBOM ist gut, aber Sigstore/Cosign für Container-Images, provenance attestation fehlt |

### 5.7 QA Engineer

| Thema | Empfehlung |
|-------|------------|
| Contract Testing fehlt | Für externe API-Integrationen (SAP, DATEV, Versicherer) – Pact oder ähnlich |
| Chaos Engineering fehlt | DORA Art. 24-27 fordert Resilienztests – Game Days, Failure Injection |
| Visual Regression Testing Tool fehlt | Empfehle Chromatic, Percy oder backstop.js |
| Testing Pyramid nicht definiert | Definiere das Verhältnis Unit:Integration:E2E (z.B. 70:20:10) |
| Kein Smoke-Test-Konzept | Post-Deployment-Smoke-Tests sind beim DevOps impliziert, aber nicht im QA-Test-Plan |

### 5.8 Compliance Officer

| Thema | Empfehlung |
|-------|------------|
| KI-VO zu oberflächlich | Ergänze die Risikokategorien (Art. 6: unannehmbares Risiko, Art. 7: hohes Risiko), Art. 13 Transparenz, Art. 52 Limited Risk |
| Kein Audit-Trail für Compliance-Entscheidungen | Wer hat wann welche Compliance-Entscheidung getroffen? Meta-Audit fehlt |
| Zertifikatsmanagement dünn | Die Ablaufdaten stehen in den Eskalationsregeln (schön!), aber ein vollständiges Zertifikat-Inventar fehlt |

### 5.9 DevOps Engineer

| Thema | Empfehlung |
|-------|------------|
| Infrastructure Security Baseline fehlt | Ergänze CIS Benchmarks oder BSI-Grundschutz-Hardening-Checkliste |
| Container Security zu dünn | Ergänze Image-Signing, Registry-Security, Pod-Security-Standards |
| Chaos Engineering / Game Days fehlen | DORA Art. 24-27 erfordert szenariobasierte Resilienztests |
| Kein Observability-Stack definiert | Welche Tools? (Prometheus, Grafana, ELK, Jaeger?) – sollte verbindlich sein |

### 5.10 Refactoring Engineer + UI/UX Reviewer

Beide sind gut aufgestellt. Kleine Ergänzungen:
- Refactoring Engineer: Legacy-Migrationsstrategie für bestehende Systeme ergänzen
- UI/UX Reviewer: Konkrete Visual-Regression-Tools empfehlen und Usability-Test-Ansatz ergänzen (Task-basiertes Testen mit echten Nutzern)

---

## 6. Priorisierte Empfehlungen

### Sofort umsetzen (Quick Wins)

1. **Tech-Stack verbindlich definieren** – In CLAUDE.md oder shared-Datei. Verhindert Inkonsistenzen sofort.
2. **Shared Glossar erstellen** – Einheitliche Fachbegriffe für alle Agenten.
3. **Definition of Done ergänzen** – In der CLAUDE.md als übergreifendes Qualitätstor.
4. **Health-Check-Pattern im Backend Engineer ergänzen** – 5 Zeilen, großer Effekt.

### Kurzfristig (1-2 Wochen)

5. **DORA Art. 24-27 Resilienztests schließen** – Entweder als eigener Agent oder als explizite Sektion im QA Engineer und DevOps Engineer.
6. **Contract Testing ergänzen** – Im QA Engineer für externe API-Integrationen.
7. **API-Security-Checkliste im Security Engineer ergänzen** – OAuth2, JWT, CORS, API-Gateway.
8. **KI-VO im Compliance Officer vertiefen** – Risikokategorien, Art. 13, Art. 52.

### Mittelfristig (1-2 Monate)

9. **Technical Writer Agent erstellen** – Über den Agent Architect.
10. **Integration Engineer Agent erstellen** – Für SAP/DATEV/Versicherer-Integrationen.
11. **Personas und Stakeholder-Map erstellen** – Für den Product Owner.
12. **Observability-Stack festlegen und im DevOps verankern.**

### Langfristig (Quartals-Planung)

13. **Performance/Reliability Engineer Agent** erstellen – Für proaktives Performance-Management.
14. **Chaos Engineering / Game Days** etablieren – Für DORA-Resilienztests.
15. **Pattern Library / Design System** formalisieren – Storybook + Token-System.

---

## 7. Strukturelle Beobachtung

Die README.md zeigt eine `agents/`-Unterordner-Struktur, aber die Dateien liegen aktuell flach im Hauptverzeichnis. Das sollte aufgeräumt werden – entweder die Dateien in den `agents/`-Ordner verschieben oder die README anpassen. Für Claude Code sollten die Dateien im `.claude/agents/`-Verzeichnis liegen, damit sie als Sub-Agents erkannt werden.

---

## Fazit

Das Team ist zu ca. 80-85% "outstanding-ready". Die regulatorische Tiefe, die Mandantenisolation und das Phasenmodell sind erstklassig. Die größten Hebel für die letzten 15-20% sind: geteilter Kontext (Tech-Stack, Glossar, Personas), die DORA-Resilienztests-Lücke schließen, und ein Technical Writer für externe Dokumentation. Die bestehenden Prompts brauchen punktuelle Ergänzungen, aber keine grundlegende Überarbeitung.
