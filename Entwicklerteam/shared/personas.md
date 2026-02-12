# Nutzer-Personas – IT Warehouse AG / smart!Cloud Services AG

**6 zentrale Personas für Feature-Design und User Story Development**
**Gültig ab:** 2025-02-11
**Verantwortlich:** Product Owner, UI/UX Reviewer

---

## Persona 1: Makler Martin

### Demografische Daten
- **Name:** Martin Schneider
- **Alter:** 47 Jahre
- **Rolle:** Versicherungsmakler in einem Maklerhaus (Mandant)
- **Unternehmen:** Weber & Partner Versicherungsmakler GmbH, München
- **Erfahrung:** 15 Jahre im bAV-Geschäft
- **Technische Kompetenz:** Mittler (nutzt täglich Office 365, SAP-Grundkenntnisse)

### Hintergrund
Martin leitet die bAV-Sparte seines Maklerhauses. Er ist verantwortlich für die Beratung von 50-100 Unternehmenskunden (AGs) zum Thema Altersversorgung. Täglich bearbeitet er Anfragen, erstellt Vorschläge und verwaltet Versorgungsverträge. Er ist der Hauptnutzer von smart!bAV.

### Ziele
1. **Schnell neue Versorgungsverträge erstellen** – Zeit sparen bei Dokumentation
2. **Überblick über seine Kundenbasis** – Wer hat welche Versorgung, Status, nächste Schritte
3. **Mitarbeiter des AG selbstständig portieren** – Wenn ein Mitarbeiter das Unternehmen wechselt
4. **Automtische Dokumentation** – PDFs, Verträge, Compliance-Reports generiert
5. **Integration mit SAP/DATEV** – Keine manuellen Dateneinträge, Sync statt Copy-Paste

### Pain Points
- **Zeitaufwand:** Manuelles Datenmanagement kostet 4-5 Stunden/Woche
- **Fehlerquellen:** Tippfehler bei manueller Erfassung führen zu Compliance-Problemen
- **Mandanten-Verwechslung:** Befürchtung, dass Daten anderer Makler sichtbar sind
- **API-Integration funktioniert nicht:** DATEV/SAP-Sync fällt aus, Rückkehr zu manueller Verarbeitung
- **Zu komplexe UI:** Zu viele Klicks, zu viele Felder pro Maske

### Typische Aufgaben in smart!bAV
- Neuen Arbeitgeber (AG) anlegen
- Versorgungszusage für AG-Mitarbeiter erstellen (Entgeltumwandlung, Arbeitgeberzuschuss)
- Übertragungsabkommen prüfen/bestätigen
- Überblick über Unverfallbarkeit und Portabilität
- Reports für AG-Geschäftsführung (z.B. "Wie viele Mitarbeiter haben bAV?")
- PDF-Export für Akten-Ablage

### Barrierefreiheits-Anforderung
- **Sehbehinderung:** Martin hat leichte Presbyopie (Altersweitsichtigkeit), kann kleine Schrift schwer lesen
  - **Anforderung:** Mindestens 14px Schrift, gute Kontrastverhältnisse (≥4.5:1)
  - **Test:** Zoom-Funktion (Browser-Zoom) muss Layout nicht zerstören

### Erfolgs-Indikatoren
- Zeit pro Vertrag < 10 Minuten (statt 30 Minuten manuell)
- Fehlerquote < 1%
- Zufriedenheit: NPS ≥ 8/10

---

## Persona 2: HR-Managerin Hannah

### Demografische Daten
- **Name:** Hannah Müller
- **Alter:** 34 Jahre
- **Rolle:** HR-Managerin / Personalleiter
- **Unternehmen:** TechStartup GmbH, Berlin (500 Mitarbeiter)
- **Erfahrung:** 8 Jahre HR, 2 Jahre bAV-Verantwortung (seit Einführung smart!bAV)
- **Technische Kompetenz:** Hoch (nutzt BI-Tools, Excel, HR-Software)

### Hintergrund
Hannah ist Angestellte eines Unternehmens (Arbeitgeber), das eine bAV über seinen Makler angeboten hat. Sie verwaltet die bAV für ~200 Mitarbeiter. Sie kümmert sich um Onboarding neuer Mitarbeiter (bAV-Anmeldung), Austritt (Portierung), Beratung bei Fragen. Sie ist auch Kontaktperson für Arbeitgeberzuschüsse und Auswertungen.

### Ziele
1. **Mitarbeiter-Self-Service:** Mitarbeiter können sich selbst in bAV anmelden (ohne Hannah-Bottleneck)
2. **Automatische Daten-Sync mit HR-System:** Neue Mitarbeiter automatisch in bAV registriert, Gehalt automatisch aktualisiert
3. **Reports für CFO:** Wie hoch sind Arbeitgeberzuschüsse? Beteiligung?
4. **Dokumentation für Betriebsrat:** bAV-Bedingungen, Änderungen, Auszahlungen
5. **Mobile Zugriff:** Auch aus dem Homeoffice oder von unterwegs nutzbar

### Pain Points
- **Fehlerhafte Daten-Sync:** Gehalt-Update in HR-System wird nicht an bAV propagiert, Entgeltumwandlung falsch
- **Zu viele Bestätigungen nötig:** Jeder Prozessschritt erfordert Administrator-Approval
- **Keine Mitarbeiter-Insights:** Hannah weiß nicht, welche Mitarbeiter ihre bAV nicht konfiguriert haben
- **Audit-Fragen:** "Wer hat wann was geändert?" ist schwer zu beantworten
- **Integrationen funktionieren nicht:** Personio-Sync fällt aus, manuelle Nacherfassung nötig

### Typische Aufgaben
- HR-Import durchführen (neue/ausgetretene Mitarbeiter)
- Mitarbeiter-Self-Service-Link bereitstellen (QR-Code, Email)
- Reports für CFO/Betriebsrat exportieren
- Fragen von Mitarbeitern beantworten ("Wie hoch ist mein Arbeitgeberzuschuss?")
- Jahresauswertung durchführen
- Compliance-Dokumentation sammeln (z.B. für Betriebsrat)

### Barrierefreiheits-Anforderung
- **Motorische Einschränkung:** Hannah hat leichte Tremor (Zittern), Maus-Clicks sind manchmal impräzise
  - **Anforderung:** Großflächige Click-Targets (min 44x44 px), Tastaturnavigation funktioniert, keine Zeit-outs auf Interaktionen
  - **Test:** Nur Tastatur navigieren (kein Maus)

### Erfolgs-Indikatoren
- Fehlerquote im Daten-Sync < 0.1%
- Mitarbeiter-Beteiligung > 85%
- Zeitaufwand Hannah < 5 Stunden/Monat

---

## Persona 3: Arbeitnehmer Anton

### Demografische Daten
- **Name:** Anton Weber
- **Alter:** 28 Jahre
- **Rolle:** IT-Entwickler (Mitarbeiter)
- **Unternehmen:** TechStartup GmbH, Berlin
- **Erfahrung:** 2 Jahre beim AG, neu in bAV (wurde gerade eingeführt)
- **Technische Kompetenz:** Sehr hoch (nutzt täglich Entwicklungs-Tools)

### Hintergrund
Anton ist Endkunde von smart!bAV. Sein AG hat gerade eine bAV-Lösung eingeführt. Anton möchte verstehen, was das für ihn bedeutet, wie viel er sparen kann und wie es später funktioniert (Auszahlung, Übertragung). Er ist technikaffin und möchte sich selbst informieren.

### Ziele
1. **Verstehen, was bAV ist** – Einfache Erklärung ohne Fachbegriffe
2. **Konfigurieren seiner Entgeltumwandlung** – Wie viel vom Gehalt in bAV?
3. **Simulation:** "Wie viel bekomme ich im Alter?" mit verschiedenen Szenarien
4. **Sicherheit:** "Sind meine Daten sicher? Nur mein AG und Versicherer sehen sie?"
5. **Mobilität:** Zugriff von Handy/Tablet zum schnellen Nachschauen

### Pain Points
- **Zu komplexe Begriffe:** "Durchführungsweg", "Unverfallbarkeit", "Entgeltumwandlung" – Anton versteht das nicht
- **Keine Simulation:** "Wenn ich 100 €/Monat spare, wie viel Rente bekomme ich mit 65?"
- **Sicherheitsangst:** "Warum sieht mein AG, wie viel ich sparen will?"
- **Mobil funktioniert nicht:** App oder responsive Web, aber nicht einfach zu verwenden
- **Keine Guides:** Video-Tutorials oder Schritt-für-Schritt-Anleitung fehlen

### Typische Aufgaben
- Profil ausfüllen (Name, Geburtsdatum, Kontakt)
- Entgeltumwandlung konfigurieren ("Ich will 5% vom Gehalt sparen")
- Altersvorsorge-Simulation durchführen
- Fragen lesen (FAQ, Bildungsmaterial)
- Vertrag einsehen (PDF)
- Profil-Daten aktualisieren (z.B. Adresse)

### Barrierefreiheits-Anforderung
- **Farbenblindheit:** Anton ist farbenblind (Rot-Grün), kann damit nicht auf Farben als einziges Signal verlassen
  - **Anforderung:** Icons/Labels zusätzlich zu Farbe (z.B. "✓" statt nur grün, "✗" statt nur rot)
  - **Test:** Page mit Grayscale-Filter ansehen – ist alles noch verständlich?

### Erfolgs-Indikatoren
- Time to Configure < 10 Minuten
- Versteht Simulation ohne Support-Nachfrage
- NPS ≥ 7/10

---

## Persona 4: Admin Anna

### Demografische Daten
- **Name:** Anna Schmidt
- **Alter:** 31 Jahre
- **Rolle:** System Administrator (IT Warehouse AG intern)
- **Erfahrung:** 6 Jahre System Administration, 2 Jahre Smart!bAV
- **Technische Kompetenz:** Sehr hoch (Linux, Datenbanken, Monitoring)

### Hintergrund
Anna ist angestellt bei IT Warehouse AG und verwaltet die smart!bAV-Infrastruktur. Sie kümmert sich um Monitoring, Disaster Recovery, Performance-Tuning, Datenbank-Backups. Sie ist auch Eskalations-Kontakt für P0-Incidents.

### Ziele
1. **Proaktiv Fehler erkennen** – Bevor Makler das bemerken (Monitoring, Alerts)
2. **Schnell Incidents beheben** – RTO ≤ 4h für P1, ≤ 24h für P2
3. **Disaster Recovery testen** – Regelmäßig (monatlich) Restore-Szenarien durchprobieren
4. **Performance optimieren** – DB-Queries, Caching, Load-Balancing
5. **Audit-Readiness** – Compliance-Reports für Regulatoren (BaFin, Datenschutz)

### Pain Points
- **Unklare Alerts:** Tausende Alerts pro Tag, schwer zu priorisieren (Alert Fatigue)
- **Langsame Incident Escalation:** Product Owner ist nicht erreichbar, Incident staut sich
- **Mangelhafte Dokumentation:** Runbook für "API Server down" existiert, aber ist veraltet
- **Third-Party APIs down:** Wenn SAP oder Versicherer-API ausfällt, kann Anna nicht viel tun
- **Mandanten-Isolations-Bugs:** Befürchtung, dass Daten-Leakage unbemerkt bleibt

### Typische Aufgaben
- Monitoring Dashboard überwachen (Prometheus/Grafana)
- Auf Alerts reagieren und Incident-Log aktualisieren
- Datenbank-Performance analysieren (langsame Queries)
- Backup-Restore testen
- Firewall/Netzwerk-Änderungen koordinieren
- Post-Mortems nach kritischen Incidents durchführen
- Compliance-Reports für Regulatoren vorbereiten

### Barrierefreiheits-Anforderung
- **Keine explizite Anforderung**, aber Monitoring-Interfaces sollten auch zugänglich sein (für Schichtwechsel, Handschuh-Nutzung, etc.)

### Erfolgs-Indikatoren
- MTTR (Mean Time To Recovery) < 30 Minuten für P1
- Verfügbarkeit > 99.9% (nur ~44 Minuten Downtime/Monat)
- Disaster Recovery Test erfolgreich monatlich

---

## Persona 5: API-Partner Paul

### Demografische Daten
- **Name:** Paul Krämer
- **Alter:** 35 Jahre
- **Rolle:** Backend-Entwickler bei einem Versicherer/Integrator
- **Unternehmen:** VersichererX AG oder Integrator-Dienstleister
- **Erfahrung:** 10 Jahre Backend-Entwicklung
- **Technische Kompetenz:** Sehr hoch (REST APIs, Datenbanken, OAuth, OpenTelemetry)

### Hintergrund
Paul ist Entwickler eines externen Systems (Versicherer, SAP-Integrator), das mit smart!bAV über REST API kommunizieren muss. Er nutzt die Enterprise API von smart!bAV um Daten zu lesen (z.B. "Gibt es neue Verträge?") oder zu schreiben (z.B. "Versicherer hat Rente ausgezahlt"). Er hat API-Dokumentation und Sandbox-Zugang.

### Ziele
1. **Schnelle Integration** – Wenige Tage bis zur Produktiv-Nutzung
2. **Zuverlässige API** – Keine unerwarteten Änderungen, Versionierung
3. **Performance** – API-Latency < 500ms, auch bei Last
4. **Fehler-Transparenz** – Klare Error-Codes, nicht nur "500 Internal Server Error"
5. **OpenAPI-Doku** – SDK-Generierung möglich, nicht manuales Reverse-Engineering

### Pain Points
- **Instabile API:** Breaking Changes in neuen Versions, Documentation Drift
- **Schlechte Error Messages:** Nur HTTP 500, keine aussagekräftige Error-Detail
- **Zu langsam:** API braucht 5 Sekunden für einfache Abfrage
- **Keine Webhook-Unterstützung:** Paul muss polling betreiben (kostspielig, latent)
- **Rate Limiting zu niedrig:** 100 Requests/Min reicht nicht für Batch-Operationen

### Typische Aufgaben
- API-Doku lesen, Sandbox-Tests durchführen
- OAuth-Handshake implementieren
- REST Endpoints integrien (GET /api/v1/contracts, POST /api/v1/premium-payments)
- Error-Handling für Rate-Limiting (Exponential Backoff)
- Monitoring der Integration (wie viele API-Calls/Tag? Fehlerquote?)
- Webhook-Consumer implementieren (wenn verfügbar)
- SDK (Python/Go/Java) generieren aus OpenAPI-Spec

### Barrierefreiheits-Anforderung
- **Keine spezifische**, aber API-Doku sollte auch für Screen Reader lesbar sein

### Erfolgs-Indikatoren
- Integration in < 3 Tagen live
- API-Uptime ≥ 99.95%
- API-Latency p95 < 500ms
- Error-Rate < 0.1%

---

## Persona 6: Prüferin Petra

### Demografische Daten
- **Name:** Petra Meyer
- **Alter:** 52 Jahre
- **Rolle:** Auditoren / Regulatorische Prüferin
- **Arbeitgeber:** BaFin oder externe Compliance-Audit-Firma
- **Erfahrung:** 20 Jahre Compliance/Audit im Finanzsektor
- **Technische Kompetenz:** Mittel (versteht Konzepte wie RLS, Encryption, aber nicht Technical Deep Dive)

### Hintergrund
Petra ist externe Auditoren oder BaFin-Prüferin, die smart!bAV auf Compliance mit DORA, DSGVO, NIS2, KI-VO, BFSG prüft. Sie führt auf Anfrage oder regelmäßig Audits durch. Sie braucht Zugriff auf technische Dokumentation, Compliance-Matrizen, Test-Reports, Audit-Logs.

### Ziele
1. **Nachvollziehen der Compliance:** Alle Anforderungen sind gedeckt durch Design/Implementierung
2. **Audit-Evidenz:** Dokumentation, Schnittstellen-Designs, Test-Cases, Code-Reviews
3. **Risk Assessment:** Sind alle Known Risks identified und mitigated?
4. **Third-Party Risk:** Sind SAP/DATEV/Versicherer-Integrationen sicher?
5. **Incident History:** Wie wurde in der Vergangenheit auf Security-Incidents reagiert?

### Pain Points
- **Dokumentation Drift:** Code ist aktuell, aber Dokumentation ist veraltet
- **Keine Compliance-Matrix:** Wo ist die Evidenz für DSGVO Art. 32 Umsetzung?
- **Audit Trail unvollständig:** Wer hat User XYZ-Daten gelöscht und wann?
- **Drittanbieter-Verträge fehlen:** SAP-Integrations-Contract, aber keine DPA mit SAP
- **Penetration Test vergessen:** Keine externen Security-Audits seit 12 Monaten

### Typische Aufgaben
- Dokumentation lesen (Tech-Design, DSFA, RTO/RPO Plan)
- Compliance-Matrix durchgehen ("Ist DSGVO Art. 28 AVV vorhanden?")
- Code-Review für sicherheits-kritische Funktionen
- Test-Reports analysieren (% Coverage, Accessibility Audit)
- Audit-Logs prüfen (Daten-Zugriffe, Änderungen)
- Risk-Register reviewed
- Post-Incident-Analyse durchgehen
- Interview mit Team (Security Engineer, Compliance Officer)

### Barrierefreiheits-Anforderung
- **Keine spezifische**, aber Audit-Reports/Dokumentation sollten lesbar sein

### Erfolgs-Indikatoren
- Audit kann ohne Nachfragen durchgeführt werden
- Keine kritischen Findings (Critical = Nicht-Konformität mit Regulierung)
- Höchstens 2-3 High Findings (Minor Compliance Issues)
- Audit-Dauer < 5 Tage

---

## Zusammenfassung: Personas und ihre Schnittstellenpunkte

```
┌─────────────┬──────────────┬──────────────┬──────────────────┐
│   Persona   │    Rolle     │    Zugang    │   Pain Points    │
├─────────────┼──────────────┼──────────────┼──────────────────┤
│ Martin      │ Makler       │ Web UI       │ Komplexität,     │
│             │              │              │ Integrations     │
├─────────────┼──────────────┼──────────────┼──────────────────┤
│ Hannah      │ HR-Manager   │ Web UI +     │ Daten-Sync,      │
│             │ (Arbeitgeber)│ API          │ Reports          │
├─────────────┼──────────────┼──────────────┼──────────────────┤
│ Anton       │ Arbeitnehmer │ Web UI       │ Verständlichkeit,│
│             │              │ (Mobile)     │ Simulation       │
├─────────────┼──────────────┼──────────────┼──────────────────┤
│ Anna        │ Admin        │ Monitoring,  │ Alerts,          │
│             │ (IT Warehouse)│ Logs        │ Incident Mgmt    │
├─────────────┼──────────────┼──────────────┼──────────────────┤
│ Paul        │ API-Partner  │ REST API     │ Zuverlässigkeit, │
│             │ (Versicherer)│ + Doku       │ Performance      │
├─────────────┼──────────────┼──────────────┼──────────────────┤
│ Petra       │ Prüferin     │ Doku, Audit  │ Compliance-      │
│             │ (BaFin)      │ Logs         │ Dokumentation    │
└─────────────┴──────────────┴──────────────┴──────────────────┘
```

---

## Anwendung in Feature Development

### User Story Template (für jede Persona relevant)

```markdown
**Feature:** [Feature Name]

**als <Persona-Name> (<Rolle>)
ich möchte <Action>,
damit <Benefit>**

**Akzeptanzkriterien:**
- [ ] AC1: Persona kann Task X ohne Fehler durchführen
- [ ] AC2: UI folgt Corporate Identity Guidelines
- [ ] AC3: WCAG 2.2 AA Compliance
- [ ] AC4: Barrierefreiheits-Anforderung der Persona erfüllt

**Technische Anforderungen:**
- [ ] Mandate-Isolation (Row-Level Security) prüfen
- [ ] Audit Logging für Data Changes
- [ ] API-Dokumentation (OpenAPI 3.1) aktualisiert
```

### Testing Checklist (pro Persona)

Für jede Persona sollte mindestens ein Test-Case existieren:

| Persona  | Test-Szenario | Expected Result |
|----------|---------------|-----------------|
| Martin | Neuen AG anlegen in 10 Min | ✓ Contract erstellt |
| Hannah | HR-Import durchführen | ✓ 100 Mitarbeiter korrekt importiert |
| Anton | Entgeltumwandlung 100€/Monat | ✓ Simulation zeigt Altersrente |
| Anna | API Rate Limiting Test | ✓ 429 Response nach Limit |
| Paul | OAuth-Flow mit Sandbox | ✓ Access Token erhalten |
| Petra | Audit-Trail für Daten-Zugriff | ✓ Alle Zugriffe geloggt + verifiziert |

---

## Kontakt und Updates

**Personas-Owner:** Product Owner
**Letzte Änderung:** 2025-02-11
**Nächster Review:** Q2 2025

Neue Persona identifiziert? → Product Owner kontaktieren.
