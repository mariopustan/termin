# Tech-Stack – IT Warehouse AG / smart!Cloud Services AG

**Geltung:** Verbindlich für alle Feature-Entwicklungen, Bugfixes und Refactoring-Maßnahmen
**Gültig ab:** 2025-02-11
**Verantwortlich:** Solution Architect, DevOps Engineer
**Letzter Review:** 2025-02-11

---

## Frontend

### Framework und Sprachstandard
- **Framework:** Angular [VERSION – bitte ergänzen: z.B. 18.x LTS]
- **Sprache:** TypeScript strict mode (`strict: true` in `tsconfig.json`)
- **Style-Sprache:** SCSS mit Nesting (zur CSS-Variabilisierung)
- **JavaScript-Runtime:** Node.js [BITTE ERGÄNZEN: LTS-Version, z.B. 20.x oder 22.x]

### Typografie und Styling
- **Schriftart:** Open Sans (Google Fonts oder lokal eingebunden)
  - Fallback: Arial
  - Zeilenhöhe: 1.5 (barrierefreundlich)
  - Mindest-Schriftgröße: 14px (VA IT 2, BFSG-Compliance)
- **Corporate Identity:**
  - Primary Orange: `#E88B1C` (Akzente, CTAs)
  - Dark Blue: `#1A3A5C` (Headlines, Navigation)
  - Light Blue: `#8CCED9` (Hintergründe, States)
  - Navy: `#162D4D` (Dark Patterns)
  - White: `#FFFFFF`, Light Grey: `#F5F5F5`, Grey: `#B3B3B3`, Anthracite: `#333333`
  - Farbverteilung: 60% Weiß/Hellgrau, 25% Dunkelblau, 10% Hellblau, 5% Orange

### Komponenten und UI
- **Komponentenbibliothek:** [BITTE ERGÄNZEN: z.B. Angular Material, PrimeNG, Clarity oder Custom Design System]
- **Design System:** CI-konforme Komponenten (siehe `/design-system/` im Repo)
- **Testing:** Jasmine + Karma (Unit Tests), Cypress oder Playwright (E2E Tests)
- **Accessibility:** WCAG 2.2 Level AA (Mindeststandard)
  - Tool für Prüfung: axe-core + manuelle Audit (QA Engineer)
  - Tastaturnavigation: vollständig unterstützt
  - Screenreader: ARIA-Label, role-Attribute, semantisches HTML

### State Management
- **Ansatz:** [BITTE ERGÄNZEN: z.B. NgRx für komplexe States, RxJS Subjects für einfache Cases]
- **Prinzip:** Unidirektionaler Datenfluss
- **Selectors:** Immer memoized (Performance-Optimierung)

### Build und Bundle
- **Build-Tool:** Angular CLI
- **Bundling:** Lazy Loading für Module (Mandanten-Isolation berücksichtigen)
- **Tree-Shaking:** Aktiviert
- **Code-Splitting:** Pro Rolle/Mandant (um Daten-Exposure zu minimieren)

---

## Backend

### Framework und Sprachstandard
- **Framework:** Node.js / NestJS [VERSION – bitte ergänzen: z.B. 10.x]
- **Sprache:** TypeScript strict mode (`strict: true`)
- **JavaScript-Runtime:** Node.js [BITTE ERGÄNZEN: LTS-Version]
- **Paketmanager:** npm oder pnpm [BITTE ERGÄNZEN]

### API-Architektur
- **Stil:** REST mit OpenAPI/Swagger 3.1 Dokumentation
- **Versionierung:** Header-basiert (`X-API-Version: 1.0`) oder URL-Pfad (`/api/v1/`, `/api/v2/`)
- **Authentifizierung:** JWT (Bearer Token) mit RS256-Signatur (DSGVO-konform)
- **Autorisierung:** Role-Based Access Control (RBAC) + Mandanten-Kontext im Token

### Middleware und Guard
- **CORS:** Whitelist-basiert (keine `*`-Wildcards)
- **Rate Limiting:** Token Bucket (z.B. 1000 Requests/Min pro API-Key, IKT-Drittanbieter-Limits beachten)
- **Request Validation:** Class Validator + Class Transformer (Eingabe-Sanitization)
- **Error Handling:** Strukturierte Error-Responses (HTTP-Status + Error-Code + Message + Details)

### Datenzugriff
- **ORM:** TypeORM [VERSION – bitte ergänzen: z.B. 0.3.x]
- **Datenbankverbindung:** Connection Pooling (Größe: [BITTE ERGÄNZEN: z.B. 20 Connections])
- **Query Performance:** Immer mit EXPLAIN ANALYZE testen (QA Engineer Pflicht)

### Logging und Debugging
- **Logger:** Winston oder Pino [BITTE ERGÄNZEN]
- **Log-Level:** `error`, `warn`, `info`, `debug`
- **Secrets:** NIE in Logs (Umgebungsvariablen mit Masking)
- **Structured Logging:** JSON-Format für Production (einfacher zu parsen)

### Sicherheit im Backend
- **Input Validation:** Whitelist-Ansatz (nicht Blacklist)
- **SQL Injection:** Parameterized Queries erzwungen (TypeORM macht das automatisch)
- **CSRF:** Token-basiert oder SameSite Cookies
- **Secrets Management:** Vault [BITTE ERGÄNZEN: z.B. HashiCorp Vault, AWS Secrets Manager] – NIE im Code/Git
- **TLS:** Mindestens TLS 1.2, bevorzugt 1.3

---

## Datenbank

### Datenbank-System
- **DBMS:** PostgreSQL [VERSION – bitte ergänzen: z.B. 15.x oder 16.x]
- **Backup-Strategie:** [BITTE ERGÄNZEN: z.B. täglich inkrementell, wöchentlich vollständig]
- **WAL-Archivierung:** Aktiviert (für Point-in-Time Recovery)
- **Replikation:** [BITTE ERGÄNZEN: Ja/Nein + Replikationstyp, z.B. Streaming Replication]

### Mandantenisolation (KRITISCH)
- **Isolation-Level:** Row-Level Security (RLS) – Mandanten-ID als Isolationskriterium
- **Umsetzung:**
  ```sql
  -- Beispiel RLS-Policy für bav_contracts-Tabelle
  ALTER TABLE bav_contracts ENABLE ROW LEVEL SECURITY;
  CREATE POLICY tenant_isolation ON bav_contracts
    USING (tenant_id = current_setting('app.tenant_id')::uuid);
  ```
- **Set Tenant:** Vor jeder Query `SET app.tenant_id = '<tenant-uuid>'` aufrufen
- **Test:** RLS-Umgehen ist ein Critical Finding (Security Review muss das prüfen)

### Datenschema
- **Standard-Felder:** Alle Tabellen haben `id` (UUID), `created_at` (timestamp), `updated_at` (timestamp), `tenant_id` (UUID)
- **Soft Delete:** Für rechtliche Aufbewahrung `deleted_at` (nullable timestamp)
- **Indizes:** B-Tree für häufige Queries, BRIN für sehr große Tabellen (Zeitreihen)
- **Foreign Keys:** Mit ON DELETE Strategie dokumentieren (CASCADE, RESTRICT, etc.)

### Verschlüsselung und Maskierung
- **PII-Felder:** (z.B. Sozialversicherungsnummern, Bankdaten) optional mit pgcrypto verschlüsseln [BITTE ERGÄNZEN: Ja/Nein]
- **Audit-Tabellen:** Trigger für sensible Änderungen (DSGVO Art. 32 Logging)

---

## Infrastruktur und Hosting

### Rechenzentren
- **Primär:** akquinet GmbH, Hamburg
  - Zertifizierung: TÜV IT TSI Level 3 (erweitert)
  - BSI-Grundschutz: Baustein 1.5
- **Sekundär:** Hetzner [BITTE ERGÄNZEN: Region, z.B. Nürnberg oder Helsinki]
- **Datenhaltung:** Ausschließlich Deutschland (DSGVO + NIS2)

### Containerisierung
- **Container-Runtime:** Docker [VERSION – bitte ergänzen: z.B. 24.x]
- **Orchestration:** [BITTE ERGÄNZEN: z.B. Kubernetes (K8s), Docker Swarm oder Container Instances]
- **Image-Registry:** [BITTE ERGÄNZEN: z.B. DockerHub, GitLab Registry, Artifactory]
- **Image Security:** Regelmäßige Scans mit Trivy oder Grype (Security Engineer Verantwortung)

### Netzwerk
- **VPC / Netzwerk-Isolation:** Getrennte VPCs pro Mandant oder per Namespace [BITTE ERGÄNZEN]
- **Firewall:** WAF aktiviert (DDoS-Schutz, Rate Limiting auf Infrastruktur-Ebene)
- **Load Balancing:** [BITTE ERGÄNZEN: z.B. HAProxy, Nginx, Cloud Load Balancer]
- **API Gateway:** [BITTE ERGÄNZEN: z.B. Kong, Tyk, AWS API Gateway]

### Storage
- **Datenbank:** PostgreSQL (siehe Datenbank-Sektion)
- **Datei-Storage:** [BITTE ERGÄNZEN: z.B. S3-kompatibel (MinIO, Backblaze), NAS über NFS/SMB]
- **Encryption at Rest:** AES-256 [BITTE ERGÄNZEN: ja/nein]
- **Encryption in Transit:** TLS 1.3, Perfect Forward Secrecy (PFS)

---

## CI/CD

### Version Control
- **VCS:** Git [BITTE ERGÄNZEN: GitLab, GitHub, Gitea]
- **Branching-Modell:** Git Flow (main, develop, feature/*, hotfix/*)
- **Merge-Strategie:** Squash oder Conventional Commits

### Pipeline-Stufen
1. **Trigger:** Push auf develop, Feature-Branch oder Pull Request
2. **Build:**
   - Lint (ESLint + Prettier für Code-Style)
   - TypeScript Compilation (`tsc --noEmit`)
   - Unit Tests (Mindestens 80% Coverage)
   - SBOM-Generierung (bitte ergänzen: CycloneDX oder SPDX)
3. **Test:**
   - E2E Tests (kritische Flows: Login, Mandanten-Isolation, API-Integrationen)
   - Performance Tests (Lasttests für API-Endpoints)
   - Security Scan (SAST mit [BITTE ERGÄNZEN: z.B. SonarQube, Checkmarx])
   - Dependency Scanning (npm audit, Snyk, [BITTE ERGÄNZEN])
4. **Build Artifact:**
   - Docker Image (mit Distroless Base, z.B. `gcr.io/distroless/nodejs`)
   - Image Scan (Trivy, Grype)
5. **Deploy (Staging):**
   - Blue-Green Deployment (alte Version läuft parallel)
   - Smoke Tests gegen Staging
6. **Deploy (Production):**
   - Manueller Approve (Compliance Officer Freigabe)
   - Canary oder Rolling Deployment
   - Monitoring + Alerting aktiviert

### Tools [BITTE ERGÄNZEN]
- **CI/CD-System:** [z.B. GitLab CI, GitHub Actions, Jenkins, ArgoCD]
- **Artifact Repository:** [z.B. Artifactory, Nexus, GitLab Registry]
- **Deployment Automation:** [z.B. Helm, Terraform, CloudFormation, ArgoCD]

---

## Monitoring, Observability und Logging

### Metrics
- **Collector:** [BITTE ERGÄNZEN: z.B. Prometheus, Datadog Agent, New Relic Agent]
- **Metriken:**
  - API: Request Rate, Latency (p50/p95/p99), Error Rate (per Endpoint)
  - Database: Connection Pool Usage, Query Latency, Transaction Count
  - Container: CPU, Memory, Disk I/O
  - Custom: Feature-Flags-State, Mandanten-Aktivität (aber keine PII!)
- **Retention:** [BITTE ERGÄNZEN: z.B. 30 Tage für detaillierte Metriken, 1 Jahr für aggregierte]

### Logging
- **Aggregation:** [BITTE ERGÄNZEN: z.B. ELK Stack, Loki, Datadog, Splunk]
- **Log-Format:** JSON (strukturiert)
- **Beispiel:**
  ```json
  {
    "timestamp": "2025-02-11T14:30:00Z",
    "level": "error",
    "service": "api-contracts",
    "trace_id": "abc123",
    "tenant_id": "xxx", // für Debugging
    "message": "Contract validation failed",
    "error_code": "VALIDATION_ERROR",
    "details": {...}
  }
  ```
- **Aufbewahrung:** [BITTE ERGÄNZEN: z.B. 90 Tage für Compliance-Logs, 30 Tage für Debug-Logs]

### Tracing
- **Standard:** OpenTelemetry (W3C Trace Context)
- **Exporter:** [BITTE ERGÄNZEN: z.B. Jaeger, Zipkin, Datadog, New Relic]
- **Sampling:** [BITTE ERGÄNZEN: z.B. 10% für Production, 100% für Staging]

### Alerts und On-Call
- **Alert-System:** [BITTE ERGÄNZEN: z.B. PagerDuty, OpsGenie, Alertmanager]
- **Kritische Alerts:** (sofortige Notification)
  - API Error Rate > 5%
  - Database Connection Pool > 90%
  - Response Time p95 > [BITTE ERGÄNZEN: z.B. 2000ms]
  - Security Event (Unauthorized Access, SQL Injection Attempt)
- **On-Call-Rotation:** [BITTE ERGÄNZEN: Wer trägt Bereitschaftsdienst?]

---

## Lizenzierung und Open Source

### Erlaubte Lizenzen
- ✅ **MIT** – Verwendung in proprietären Projekten ohne Restrictions
- ✅ **Apache 2.0** – Ähnlich MIT, mit explizitem Patent-Grant
- ✅ **BSD (2/3-Clause)** – Permissiv
- ✅ **ISC** – Permissiv
- ✅ **CC0 (Public Domain)** – Keine Restrictions

### Verbotene Lizenzen
- ❌ **GPL (v2/v3)** – Würde unser Code als proprietär unmöglich machen
- ❌ **AGPL** – Zu restriktiv, Code-Sharing erzwungen
- ❌ **SSPL** – MongoDB-Lizenz, nicht kompatibel

### SBOM und Dependency Management
- **SBOM-Format:** CycloneDX oder SPDX [BITTE ERGÄNZEN: welches wird verwendet?]
- **Scanning:** Automatisch in CI/CD (npm audit, Snyk, Dependabot)
- **Update-Policy:** Kritische Security-Fixes sofort, Minor/Major-Versions monatlich
- **Dokumentation:** Jede neue Abhängigkeit wird dokumentiert mit Begründung + Lizenz

---

## Externe API-Integrationen

### Versicherer-APIs
- **Authentifizierung:** OAuth 2.0 mit Client Credentials Flow (Confidential Clients)
- **Timeout:** [BITTE ERGÄNZEN: z.B. 30 Sekunden für Sync-Calls]
- **Retry-Logik:** Exponential Backoff (max 3 Retries für 5xx Fehler)
- **Circuit Breaker:** Aktiviert (bricht ab nach 5 fehlgeschlagenen Requests, 60s Wartezeit)
- **Logging:** Transaction ID für End-to-End Tracing (DSGVO-konform)

### SAP Integration
- **Protokoll:** [BITTE ERGÄNZEN: z.B. SOAP über REST Adapter, OData, Direct DB-Link]
- **Mandanten-Kontext:** SAP Client-ID wird aus unserem Mandanten-Mapping gelesen
- **Fehlerkontrolle:** RFC Errors werden geloggt (Audit-Trail), nicht an Frontend exponiert
- **Performance:** Batch-Operationen bevorzugt (wenn möglich)

### DATEV Integration
- **API-Version:** [BITTE ERGÄNZEN: z.B. DATEV API v2.0]
- **Authentifizierung:** API-Key + Signature (HMAC-SHA256)
- **Rate Limits:** Beachten (typisch 100 Requests/Min)
- **Fallback:** Wenn DATEV down ist, graceful degradation (Queue-Based Sync später)

### Personio Integration
- **Protokoll:** OAuth 2.0 (Authorization Code Flow)
- **Scope:** Minimal (nur benötigte Employee-Felder)
- **Caching:** Employee-Master-Data wird täglich aktualisiert (nicht real-time)
- **Datenschutz:** Keine Weitergabe von Adresse/Telefon an Dritte

---

## Umgebungen und Feature Flags

### Environments
| Umgebung | Zweck | Backup | Auto-Deployment | Monitoring |
|----------|-------|--------|-----------------|------------|
| **Local** | Entwicklung | - | - | Dev Logs |
| **Staging** | Testing (vor Production) | Täglich | Auto (aus develop) | Full Observability |
| **Production** | Live-Betrieb | Stündlich | Manuell (Compliance Freigabe) | Full Observability + Alerting |
| **DR (Disaster Recovery)** | Notfall-Betrieb | Kontinuierlich | Manuell | Monitoring aktiv |

### Feature Flags
- **Tool:** [BITTE ERGÄNZEN: z.B. LaunchDarkly, Unleash, Flagr]
- **Verwendung:** Neue Features schrittweise enablen (Canary Releases)
- **Rollback:** Feature-Flag-Disable reicht (kein neues Deployment nötig)
- **Compliance:** Audit-Log für alle Flag-Changes

---

## Sicherheits-Checkliste (vor Production-Release)

- [ ] TypeScript strict mode aktiviert + keine `any` Types (außer explizit gerechtfertigt)
- [ ] Alle npm-Dependencies gescannt (Snyk, npm audit)
- [ ] SBOM generiert und archiviert
- [ ] Security Review durchgeführt (Security Engineer Freigabe)
- [ ] DSGVO-Check (Privacy by Design) durch Compliance Officer
- [ ] WCAG 2.2 AA Test durchgeführt
- [ ] Loadtest durchgeführt (QA Engineer)
- [ ] Disaster Recovery Plan updated
- [ ] Monitoring + Alerting konfiguriert
- [ ] Runbook für On-Call vorbereitet
- [ ] Release Notes in Deutsch verfasst (Changelogs, Breaking Changes, Migration Path)

---

## Kontakt und Updates

**Tech-Stack-Owner:** Solution Architect
**Letzte Änderung:** 2025-02-11
**Nächster Review:** Q2 2025

Fragen oder Änderungsanträge? → Product Owner oder Solution Architect kontaktieren.
