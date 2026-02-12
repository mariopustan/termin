# Glossar – IT Warehouse AG / smart!Cloud Services AG

**Einheitliche Fachbegriffe für alle Agenten und Dokumentation**
**Gültig ab:** 2025-02-11
**Sprache:** Deutsch (erklärende Definition), Englisch (für Code/Variablennamen)

---

## bAV / Versicherung

| Begriff | Definition | Englischer Term | Regulatorische Referenz |
|---------|-----------|-----------------|------------------------|
| **Betriebliche Altersversorgung (bAV)** | Versorgung von Arbeitnehmern durch den Arbeitgeber für das Alter, Invalidität und Hinterbliebene. Reguliert durch BetrAVG, Handelsrecht und steuerrechtliche Vorschriften. | Occupational Pension / Company Pension Scheme | BetrAVG §1, VAG §126 |
| **Makler** | Unternehmen (oder Person) in unserem System: Vermittler von bAV-Lösungen zwischen Arbeitgebern und Versicherern. Ein Maklerhaus verwaltet mehrere Arbeitgeber-Konten (Mandanten). | Broker / Insurance Broker | DSGVO (als Auftragsverarbeiter typischerweise) |
| **Mandant** | Ein Maklerhaus als Nutzer unserer Plattform. Rechtliche/organisatorische Einheit mit isoliertem Daten-Bereich, 40+ Makler-Mandanten in smart!bAV. | Tenant / Broker Tenant | DSGVO Art. 28, Mandantenisolation |
| **Arbeitgeber (AG)** | Unternehmen, das über einen Makler bAV für seine Mitarbeiter anbietet. Hat einen oder mehrere Versorgungszusagen bei Versicherern. | Employer / Company | BetrAVG §1 |
| **Arbeitnehmer (AN)** | Mitarbeiter des Arbeitgebers, für den eine bAV-Versorgung aufgebaut wird. Hat Ansprüche gemäß Versorgungszusage. | Employee / Beneficiary | BetrAVG §1 |
| **Versorgungszusage** | Rechtlich verbindliches Versprechen des Arbeitgebers gegenüber dem Arbeitnehmer über die Art und Höhe der Leistung im Alter / bei Invalidität / an Hinterbliebene. Zentrale Geschäftsentität in smart!bAV. | Pension Promise / Benefit Promise | BetrAVG §1, §20 |
| **Durchführungsweg** | Rechtliche Form der Altersversorgung: (1) Direktzusage (interne Rückdeckung oder Pensionskasse), (2) Unterstützungskasse, (3) Direktversicherung, (4) Pensionsfonds, (5) Pensionskasse. Bestimmt Haftung, Besteuerung und Risiken. | Funding Vehicle / Scheme Type | BetrAVG §1 Abs. 1 u. 2 |
| **Direktzusage (Pensionszusage)** | Arbeitgeber sagt direkt Altersleistungen zu (mit interner Rückdeckung oder über Pensionskasse). Arbeitgeber trägt Leistungsrisiko. | Direct Commitment / Direct Promise | BetrAVG §1 Abs. 1 |
| **Direktversicherung** | Durchführungsweg: Versicherungsunternehmen verpflichtet sich direkt gegenüber dem Arbeitnehmer (Police). Risiko liegt bei Versicherer. | Occupational Defined Benefit Insurance | BetrAVG §1 Abs. 2 |
| **Pensionskasse** | Juristische Person, die von einem oder mehreren Arbeitgebern errichtet wird, um Versicherungsschutz zu bieten. Externe Rückdeckung / Direktzusage. | Occupational Pensions Fund / Pension Fund | VAG §112a |
| **Entgeltumwandlung (Entgeltkonvertierung)** | Arbeitnehmer verzichtet auf Bruttolohn-Anteil zugunsten von Beiträgen zur bAV. Steuer- und sozialversicherungsbegünstigt. Zentrale Use-Case in smart!bAV. | Salary Sacrifice / Salary Contribution | EStG §3 Nr. 63, SvEV |
| **Arbeitgeberzuschuss** | Zusätzlicher Beitrag des Arbeitgebers zur bAV des Arbeitnehmers (über die Entgeltumwandlung hinaus). Kann zwingend sein (§4 BetrAVG) oder freiwillig. | Employer Contribution / Employer Subsidy | BetrAVG §4 |
| **Ausgleichsleistung / Pflicht-Ausgleich** | Der Arbeitgeber muss einen Ausgleichsbeitrag leisten, wenn der Arbeitnehmer Entgeltumwandlung für Direktzusage nutzt. 80-90% des Beitragssatzes. | Matching / Employer Matching (nicht vollständig äquivalent) | BetrAVG §4 Abs. 3 |
| **Übertragungsabkommen (Portabilität)** | Vereinbarung zwischen Arbeitgebern für Mitarbeiterwechsel: Versorgung kann auf neue AG übertragen werden. Kündigung von Versorgung wird vermieden. | Portable Pension Agreement / Transfer Agreement | BetrAVG §4 Abs. 5 |
| **Unverfallbarkeit** | Gesetzliche Verpflichtung: Nach mindestens 3 Jahren und Alter 21+ erworbene Versorgungsanwartschaften des AN können nicht verfallen. Eigentum des AN. | Non-Forfeiture / Vesting | BetrAVG §2 |
| **Beitragszusage** | Versorgungszusage, bei der nur Beiträge zugesagt sind, nicht die Leistung. Risiko liegt bei Arbeitnehmer (Kapitalmarktrisiko). Typisch: Direktversicherung, Pensionsfonds. | Defined Contribution (DC) | BetrAVG §1b |
| **Leistungszusage** | Versorgungszusage, bei der konkrete Leistung (z.B. 60% Lohn im Alter) zugesagt ist. Risiko liegt bei Arbeitgeber oder Versicherer. Klassisch: Direktzusage, Pensionskasse. | Defined Benefit (DB) | BetrAVG §1 Abs. 1 |
| **Beitragsorientierte Leistungszusage (BmL)** | Leistungszusage, bei der sich die Leistung an eingezahlten Beiträgen + garantierte Verzinsung orientiert. Hybrid zwischen DC und DB. Versicherer trägt Zinsrisiko, AG trägt Risiko bei Insolvenz Versicherer. | Defined Ambition / Cash Balance (approximativ) | VAG §126 |
| **GGF-Versorgung (Geschäftsführer)** | Versorgungszusage für Geschäftsführer oder Gesellschafter-Geschäftsführer. Besondere steuer- und sozialversicherungsrechtliche Regeln. | Executive Pension | EStG §19, SvEV |
| **Rente** | Laufende Leistung ab Eintritt des Versicherungsfalls (meist Alter 65+). Kann lebenslang (Altersrente) oder Hinterbliebenenrente sein. | Annuity / Pension Payment | BetrAVG §1 Abs. 1 |
| **Kapitalleistung** | Einmalzahlung statt Rente (wenn Versorgungszusage das erlaubt). Typisch bei kleinen Versorgungen (<1/10 der Standardrente). | Lump Sum / Capital Sum | BetrAVG §1 Abs. 3 |
| **Sterbegeldversicherung** | Versicherung für Kosten der Beerdigung des Arbeitnehmers. Kleiner Zusatzbeitrag zur bAV. | Funeral Expense Insurance / Death Benefit | BetrAVG |
| **Invalidität (Erwerbsunfähigkeit)** | Arbeitsunfähigkeit dauerhaft oder auf absehbare Zeit. Verpflichtung zur Invaliditätsrente aus bAV. Kann auch als Zusatzbaustein separat versichert sein. | Disability / Incapacity | BetrAVG §1 Abs. 1 |
| **Hinterbliebenenversorgung** | Leistungen an Ehegatten / eingetragener Lebenspartner und Kinder nach Tod des AN oder im Altersrentenbezug. Kann Rente oder Kapitalleistung sein. | Survivor Pension / Family Benefits | BetrAVG §1 Abs. 1 |
| **Anwartschaft** | Anspruch auf zukünftige Versorgung (auch wenn AN aktuell nicht beitragspflichtig). Nach Unverfallbarkeit (3 Jahre + Alter 21) ist sie Eigentum des AN. | Benefit Expectation / Service Credit | BetrAVG §1a, §2 |
| **Rückdeckung** | Versicherung auf Seite des Arbeitgebers (z.B. Pensionskasse, Lebensversicherung), um die zugesagten Leistungen finanzierbar zu machen. | Backing / Funding | BetrAVG |
| **Pensionsrückstellung** | Bilanzposten für Direktzusagen: Rückstellung der zukünftigen Leistungsverpflichtung (HGB §249). Relevant für IFRS 17 Rechnungslegung. | Pension Provision / Retirement Benefit Obligation | HGB §249, IFRS 17 |
| **Versorgungslücke** | Differenz zwischen bisherigem Lebensstandard und Renteneinkommen. smart!bAV hilft zu minimieren durch richtige Beiträge + Leistungsoptimierung. | Retirement Gap / Pensions Gap | - |

---

## Technische Begriffe

| Begriff | Definition | Englischer Term | Regulatorische Referenz |
|---------|-----------|-----------------|------------------------|
| **Mandantenisolation** | Technische und organisatorische Maßnahme: Daten eines Maklers (Mandanten) sind vollständig separiert von anderen Makler-Daten. Keine unbeabsichtigte Daten-Leakage zwischen Mandanten. Umgesetzt via Row-Level Security (RLS) in der Datenbank. | Tenant Isolation / Multi-Tenancy | DSGVO Art. 32, DORA Art. 17-20 |
| **Row-Level Security (RLS)** | PostgreSQL-Feature: Policies auf Tabellen-Ebene, die garantieren, dass jede Query automatisch gefiltert wird nach Mandanten-ID. So können zwei Makler nie gegenseitig Daten sehen, auch wenn Code-Bug existiert. | Row-Level Security / RLS | DSGVO Art. 32 |
| **Circuit Breaker** | Designmuster für Fehlerbehandlung bei externen Integrationen (z.B. SAP, DATEV): Nach N fehlgeschlagenen Requests wird die Verbindung "offen" (breaker open), weitere Requests schlagen sofort fehl, ohne zu versuchen. Nach Timeout wechselt zu "half-open" (Test-Request). Verhindert Kaskadierende Fehler. | Circuit Breaker Pattern | - |
| **Idempotenz** | Eigenschaft: Eine Operation kann beliebig oft aufgerufen werden mit gleichem Ergebnis (keine Seiteneffekte). Kritisch für APIs (z.B. bei Netzwerk-Retry): `POST /api/contract` mit gleicher Idempotency-Key sollte gleiche Antwort geben, nicht mehrfach Contract erstellen. | Idempotency | REST API Best Practices |
| **Blue-Green Deployment** | Deployment-Strategie: Zwei identische Production-Umgebungen (Blue und Green). Neue Version wird in Green deployed, getestet, dann Traffic switched von Blue zu Green. Rollback leicht (zurück zu Blue). Zero Downtime. | Blue-Green Deployment | DORA (Deployment Frequency) |
| **Event Sourcing** | Architektur-Pattern: Statt Zustand zu speichern, werden alle Zustandsänderungen als unveränderliche Events protokolliert (Audit Trail). Aktueller Zustand = Replay aller Events. Gut für Compliance (DSGVO Logging) und Debugging. | Event Sourcing | DSGVO Art. 32 (Audit Trail) |
| **Event Bus / Message Broker** | Zentrale Infrastruktur: Systeme publizieren Events (z.B. "ContractCreated", "EmployeeAdded"), andere Systeme subscriben. Asynchrone Entkopplung. Beispiele: RabbitMQ, Kafka. | Event Bus / Message Broker | - |
| **CQRS (Command Query Responsibility Segregation)** | Pattern: Trennung von schreibenden (Command) und lesenden (Query) Operationen. Commands triggern Events, Events updaten Read-Modelle. Performance-Optimierung + Compliance (separates Audit Log möglich). | CQRS | - |
| **API Gateway** | Zentrale Eingangsschicht: Alle Client-Requests gehen durch Gateway (Authentifizierung, Rate Limiting, Request Validation, Routing). Single Point of Entry für Sicherheit. | API Gateway | DORA Art. 9 (Security) |
| **Dead Letter Queue (DLQ)** | Queue für Nachrichten, die nicht verarbeitet werden können (z.B. wegen Parsing-Fehler). Ermöglicht späteren Retry oder manuelle Analyse. Verhindert, dass Fehlermeldungen die Hauptqueue blockieren. | Dead Letter Queue | - |
| **Webhook** | Callback-Mechanismus: External System (z.B. Versicherer) kann Events zu unserem System pushen (statt wir pollen). HTTPS POST an vordefinierte URL. Für Echtzeit-Integrationen. | Webhook | - |
| **Polling vs. Webhooks** | Polling: Wir fragen regelmäßig "Gibt es Änderungen?". Webhooks: Extern-System benachrichtigt uns sofort bei Änderungen. Webhooks sind latenz-ärmer, aber komplexer (require Callback-URL). | Polling vs. Push / Webhooks | - |
| **Exponential Backoff** | Retry-Strategie: Bei fehlgeschlagener Request warte 1s, dann 2s, dann 4s, dann 8s, bis Max (z.B. 60s). Verhindert Überflutung von overloaded Systemen. Verhindert auch "Thundering Herd" (alle Clients gleichzeitig retry). | Exponential Backoff / Jittered Exponential Backoff | - |
| **Connection Pool** | Verwaltete Menge von Datenbank-Verbindungen. Statt für jede Request eine neue Verbindung zu öffnen (teuer), nutzen wir Pre-Allocated Connections. Pool-Size typisch 20-50 pro Service. | Connection Pool / Database Connection Pool | - |
| **Lazy Loading** | Performance-Pattern: Modul/Daten wird nur geladen, wenn nötig. Frontend: Angular Lazy Load für Feature-Module (reduziert Initial Bundle Size). Backend: JPA @Lazy für DB-Relations (verhindert N+1 Queries). | Lazy Loading | - |
| **N+1 Query Problem** | Performance Anti-Pattern: Laden eines Objekts + für jedes Kind-Objekt eine separate Query. Z.B. "SELECT contract" (1 Query) + für jedes contract "SELECT employees" (N Queries) = N+1. Lösung: JPA `JOIN FETCH` oder Batch Loading. | N+1 Query Problem | - |
| **Pagination** | Fragmentierung großer Result-Sets: Statt 10.000 Zeilen auf einmal zu loaded, geben wir 100er-Pages zurück. Client kann über Offset/Cursor navigieren. Spart Speicher + Bandwidth. | Pagination / Cursor-Based Pagination | REST API Best Practices |
| **Cache Invalidation** | Hard Problem: Nach Daten-Update muss Cache geleert werden (sonst stale data). Strategien: TTL (Zeit-basiert), Event-basiert (Publikation von "Data updated" Event), Explicit (Code ruft cache.invalidate() auf). | Cache Invalidation | - |
| **HATEOAS (Hypermedia As The Engine Of Application State)** | REST-Principle: Responses enthalten nicht nur Daten, sondern auch Links zu verwandten Resources. Z.B. Contract-Response mit Link zu Associated Employees. Ermöglicht Client-Navigation ohne Code-Änderung. Kontrovers: mehr Payload, aber flexibler. | HATEOAS | REST Architectural Constraints |
| **OpenAPI / Swagger** | Standard-Format für REST API Dokumentation (maschinell lesbar als YAML/JSON). Wird verwendet für API-Doku, SDK-Generierung, Testing. Jede smart!bAV-API muss OpenAPI 3.1 dokumentiert sein. | OpenAPI 3.1 / Swagger 3.0 | - |
| **JWT (JSON Web Token)** | Authentifizierungs-Format: Signed Token, der Claims enthält (User ID, Mandanten-ID, Rollen, Expiry). Stateless (kein Session-Store nötig). Verwendet RS256 (asymmetrisch: Private Key zum Signieren, Public Key zur Verifikation). | JWT / JSON Web Token | DSGVO Art. 32 (Authentifizierung) |
| **OAuth 2.0** | Standard für Autorisierung/Delegation (nicht Authentifizierung, das ist OpenID Connect). Z.B. "Nutzer loggt mit Google ein, Google gibt Token an unsere App". Verwendet für Third-Party-Integrationen (SAP, Personio). | OAuth 2.0 | - |
| **TLS 1.3** | Verschlüsselungsprotokoll für HTTPS. Aktuelle Empfehlung: TLS 1.3 (schneller als 1.2, sicherer). Perfect Forward Secrecy (PFS): auch wenn Private Key später kompromittiert, alte Nachrichten bleiben sicher. | TLS 1.3 / HTTPS | DSGVO Art. 32, NIST SP 800-52 Rev. 2 |
| **Audit Trail / Audit Logging** | Protokollierung aller Zustandsänderungen (Create, Update, Delete) mit Timestamp, User, alte/neue Werte. Für DSGVO Art. 32 Pflicht. In Smart!bAV: Audit Log wird in separater Tabelle gespeichert. | Audit Trail / Audit Log | DSGVO Art. 32, DORA Art. 19 |
| **Feature Flag / Feature Toggle** | Konfigurierbare Schalter zur Laufzeit: Feature kann an/aus geschaltet werden ohne neues Deployment. Ermöglicht Canary Releases, A/B Testing, schnelles Rollback. | Feature Flag / Feature Toggle | Deployment Best Practices |
| **Canary Release** | Deployment-Strategie: Neue Version wird zunächst nur für kleine User-Gruppe (1-10%) deployed. Monitoring läuft, bei Problemen Rollback ohne alle User zu beeinflussen. Dann schrittweise zu 100% rollen. | Canary Release / Canary Deployment | DORA (Deployment Frequency) |

---

## Regulatorische und Compliance-Begriffe

| Begriff | Definition | Englischer Term | Regulatorische Referenz |
|---------|-----------|-----------------|------------------------|
| **TOM (Technisch-Organisatorische Maßnahmen)** | Sicherheitsmaßnahmen nach DSGVO Art. 32: Verschlüsselung, Zugriffskontrolle, Audit Logging, Disaster Recovery, Pen-Testing, Incident Response. smart!bAV muss Katalog von TOMs implementiert haben. | Technical and Organizational Measures | DSGVO Art. 32 |
| **DSFA (Datenschutz-Folgenabschätzung)** | Risiko-Bewertung: Für High-Risk Processing (z.B. Mitarbeiter-Monitoring, Automatisierte Entscheidungen) muss eine DSFA durchgeführt werden. Dokumentiert Risiken und Mitigation. | Data Protection Impact Assessment / DPIA | DSGVO Art. 35 |
| **AVV (Auftragsverarbeitungsvertrag)** | Vertrag zwischen Verantwortlichem (Makler) und Auftragsverarbeiter (IT Warehouse). Definiert Pflichten, Verarbeitung, Sicherheitsmaßnahmen, Sub-Processor Management. Erforderlich für DSGVO Compliance. | Data Processing Agreement / DPA | DSGVO Art. 28 |
| **RTO (Recovery Time Objective)** | Maximale Zeit, die ein System down sein darf, nach Ausfall. Z.B. "RTO = 4 Stunden" bedeutet: nach 4 Stunden muss smart!bAV wieder laufen. Bestimmt Disaster Recovery Anforderungen. | Recovery Time Objective | DORA Art. 11, DIN ISO 22301 |
| **RPO (Recovery Point Objective)** | Maximales Daten-Alter nach Ausfall: "RPO = 1 Stunde" bedeutet wir können maximal 1 Stunde Daten verlieren (nicht aktuellere Backups verfügbar). Bestimmt Backup-Häufigkeit. | Recovery Point Objective | DORA Art. 11, DIN ISO 22301 |
| **Backup-Strategie (3-2-1 Regel)** | Best Practice: 3 Kopien der Daten, auf 2 verschiedenen Media-Typen, 1 Kopie off-site. Z.B. PostgreSQL + PostgreSQL-Replikation + S3 Backup in anderen Region. | 3-2-1 Backup Rule | DIN ISO 22301 |
| **SBOM (Software Bill of Materials)** | Inventar aller Komponenten einer Software: Abhängigkeiten, Versionen, Lizenzen, CVEs. Wird automatisch in CI/CD generiert (CycloneDX oder SPDX Format). Für Supply Chain Security kritisch. | Software Bill of Materials | DORA Art. 6 (Third-Party Risk) |
| **IKT-Drittanbieter / Third-Party Risk** | Risiken von Abhängigkeiten: Wenn SAP gehackt wird oder Versicherer-API down ist, beeinflusst uns das. DORA Art. 28-44 definiert Anforderungen an Third-Party Management: Verträge, Audit, Resilience-Testing. | ICT Third-Party Risk / Operational Risk | DORA Art. 28-44 |
| **Penetration Test / Pen-Test** | Sicherheits-Audit: Externe Experten versuchen, in smart!bAV einzubrechen (mit Erlaubnis). Ziel: Vulnerabilities vor Production-Release finden. Minimal jährlich, nach Major-Features. | Penetration Test / Security Audit | DORA Art. 6 |
| **Vulnerability Management** | Prozess: CVE (Common Vulnerabilities and Exposures) werden identifiziert (npm audit, Snyk), priorisiert (CVSS-Score) und gepatcht. Patch-Ziel: Critical/High in 7 Tagen, Medium in 30 Tagen. | Vulnerability Management | DSGVO Art. 32, DORA Art. 5 |
| **Incident Response** | Prozess: Nach Security-Incident (z.B. Daten-Breach) wird dokumentiert, untersucht (root cause), mitigiert und gemeldet (wenn nötig an Regulatoren). Ziel: <4h Detection bis Mitigation für Critical Incidents. | Incident Response / Breach Response | DSGVO Art. 33-34, DORA Art. 19-23 |
| **Meldepflicht (DSGVO Art. 33/34)** | Nach Daten-Breach muss die Datenschutzbehörde benachrichtigt werden (wenn Risiko besteht). Zeitlimit: "ohne unangemessene Verzögerung" (typisch <72h). Für manche Verletzungen auch Betroffenen-Notification (Art. 34). | Breach Notification / GDPR Breach Report | DSGVO Art. 33-34 |
| **Meldepflicht (DORA Art. 19-23)** | Nach kritischem IKT-Incident muss die Aufsichtsbehörde (BaFin) benachrichtigt werden. Zeitlimit: 24h nach Erkennung. Definition "kritisch": Umfasst IT-Ausfall, Daten-Breach, Malware, Supply-Chain-Attack. | ICT-Related Incident Reporting | DORA Art. 19-23 |
| **NIS2 (Network and Information Security Directive 2)** | EU-Richtlinie für Cybersecurity: Essential und Important Entities müssen Sicherheitsmaßnahmen implementieren, Supply-Chain-Risiken managen. In Deutschland via NIS2UG ins nationale Recht. Betrifft große Finanzdienstleister. | NIS2 Directive | NIS2 Richtlinie, NIS2UG |
| **KI-VO (EU Artificial Intelligence Act)** | EU-Verordnung für KI: Wenn smart!bAV KI einsetzt (z.B. automatisierte Entscheidung über Rentenberechnung), gelten Anforderungen: High-Risk-Klassifizierung, Transparenzpflicht, Human-in-the-Loop, Dokumentation. Seit 02.02.2025 Schulungspflicht. | EU AI Act / AI Regulation | EU AI Act Art. 3-5, Schulungspflicht Art. 4 seit 02.02.2025 |
| **BFSG (Barrierefreiheitsstärkungsgesetz)** | Deutsches Gesetz: Digitale Barrierefreiheit ist Pflicht für Finanzdienstleister (z.B. Versicherer, Makler). WCAG 2.2 Level AA ist Mindeststandard. Konsequenzen: Bußgelder, Schadensersatz bei Nicht-Einhaltung. | Barrier-Free Strengthening Act | BFSG §1-3, WCAG 2.2 Level AA |
| **WCAG 2.2 Level AA** | Web Content Accessibility Guidelines: Standard für digitale Barrierefreiheit. Level A = Basis, Level AA = "Ziel für Web", Level AAA = Fortgeschritten. Umfasst: Kontrastverhältnis ≥ 4.5:1, Tastaturnavigation, Alt-Text für Bilder, Screen-Reader-Kompatibilität. | Web Content Accessibility Guidelines 2.2 Level AA | BFSG §2, WCAG 2.2 |
| **WCAG Konformität-Audit** | Prüfung auf WCAG-Einhaltung: Automatisierte Tests (axe-core, Lighthouse), manuelle Tests (Tastaturnavigation, Screen Reader), Farbkontrast-Messung. Muss vor jedem Release durchgeführt werden (QA Engineer + UI/UX Reviewer). | WCAG Conformance Audit | WCAG 2.2 |
| **Verarbeitungsverzeichnis (Art. 30 DSGVO)** | Dokumentation aller Datenverarbeitungen: Zweck, Kategorien, Empfänger, Aufbewahrungsdauer, Sicherheitsmaßnahmen. Makler muss als Verantwortlicher ein Verzeichnis führen, IT Warehouse hilft ggf. über Dokumentation. | Record of Processing Activities / Processing Register | DSGVO Art. 30 |
| **Löschkonzept (Art. 17 DSGVO)** | Recht auf Vergessenwerden: Nach Beendigung der Geschäftsbeziehung müssen Daten (außer Rechtliche Aufbewahrung) gelöscht werden. Prozess: 1) Daten auf Lösch-Verzeichnis, 2) Nach Aufbewahrungsfrist löschen, 3) Löschung verifizieren. | Right to Erasure / Right to be Forgotten | DSGVO Art. 17 |
| **Privacy by Design** | Grundprinzip: Datenschutz ist von Anfang an in Systemdesign integriert, nicht nachgelagert. Z.B.: Minimierung von Datenfluss, Anonymisierung wo möglich, Verschlüsselung von Anfang an. | Privacy by Design and Default | DSGVO Art. 25 |
| **Least Privilege Principle** | Sicherheits-Prinzip: Nutzer/Service bekommt nur Mindest-Berechtigungen für ihre Aufgabe. Z.B. QA Engineer kann Read-Only auf Production Data zugreifen, aber nicht Löschen. Reduziert Risiken von Missbrauch/Fehler. | Principle of Least Privilege | DSGVO Art. 32, NIST SP 800-53 AC-6 |

---

## Prozess und Governance

| Begriff | Definition | Englischer Term | Regulatorische Referenz |
|---------|-----------|-----------------|------------------------|
| **Compliance Matrix** | Dokumentation: Feature X erfüllt Anforderung Y aus Regulierung Z (z.B. "Mandantenisolation erfüllt DSGVO Art. 32"). Wird vom Compliance Officer gepflegt. Nachweise: Code-Review, Test-Reports, Security Audit. | Compliance Matrix / Traceability Matrix | DORA, DSGVA, VA IT 2 |
| **Finding** | Ergebnis einer Prüfung (Security Review, QA Test, Compliance Audit): Problem, das behoben werden muss. Hat Severity (Critical/High/Medium/Low), wird dokumentiert, zugewiesen, behoben, verifiziert. | Finding / Issue | DORA, DSGVO |
| **Critical Finding** | Höchste Severity: Feature kann nicht Release gehen. Beispiel: SQL Injection, Datenverlust, Mandanten-Isolation-Bypass. Muss VOR Release behoben + verifiziert sein. | Critical Finding | DORA, DSGVO |
| **High Finding** | Bedeutender Fehler: Feature kann mit Bedingungen Release gehen (mit Risk-Acceptance vom Compliance Officer). Beispiel: Fehlende Audit Logs, Unvollständige Fehlerbehandlung. Sollte vor Release gehoben werden. | High Finding | DORA, DSGVO |
| **Medium/Low Finding** | Verbesserungen für zukünftige Releases: Nicht kritisch für aktuelle Release. Beispiel: Performance-Optimierung, UI-Vereinfachung, Dokumentation. Können für spätere Iterationen aufgeschoben werden. | Medium/Low Finding | - |
| **Release** | Deployment-Event: Code geht von Staging in Production. Muss alle Quality Gates erfüllen: Tests grün, Security Review bestanden, Compliance Officer Freigabe, Monitoring konfiguriert, Runbook verfügbar. | Release / Production Deployment | DORA, DSGVO Art. 32 |
| **Rollback** | Rückgängigmachen eines Releases: Wenn kritische Fehler in Production auftreten, wird zur vorherigen Version zurückgewechselt. Blue-Green Deployment macht das schnell möglich. | Rollback / Rollback Release | Disaster Recovery |
| **User Story** | Anforderungs-Format: "Als [Persona] möchte ich [Feature], damit [Benefit]." Z.B. "Als Makler Martin möchte ich Entgeltumwandlung-Verträge erstellen, damit Mitarbeiter des AG sparen." Vom Product Owner verfasst. | User Story / User Requirement | Agile/Scrum |
| **DoD (Definition of Done)** | Checklist: Wann ist eine User Story fertig? Beispiel: Code reviewed, Unit Tests geschrieben, Acceptance Criteria erfüllt, Dokumentiert, Kein Technical Debt, Verifiziert auf Staging. Muss vor Merge zu develop erfüllt sein. | Definition of Done | Agile/Scrum |

---

## Platzhalter-Begriffe (werden je nach Implementierung ergänzt)

| Begriff | Status | Verantwortlich |
|---------|--------|----------------|
| **Caching-Strategie Spezifik** | [BITTE ERGÄNZEN: Redis-Policy, TTL-Werte, Invalidierungsstrategie] | Solution Architect |
| **Event-Bus Implementierung** | [BITTE ERGÄNZEN: RabbitMQ vs. Kafka vs. AWS SQS] | Solution Architect |
| **Monitoring-Tool** | [BITTE ERGÄNZEN: Prometheus + Grafana vs. Datadog vs. New Relic] | DevOps Engineer |

---

## Kontakt und Updates

**Glossar-Owner:** Product Owner
**Letzte Änderung:** 2025-02-11
**Nächster Review:** Q2 2025

Neuer Begriff? → Product Owner kontaktieren und Update-Request stellen.
