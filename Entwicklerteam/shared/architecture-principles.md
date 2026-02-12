# Architektur-Prinzipien – IT Warehouse AG / smart!Cloud Services AG

**Übergreifende Design-Richtlinien für alle Features und Services**
**Gültig ab:** 2025-02-11
**Verantwortlich:** Solution Architect, DevOps Engineer
**Compliance:** DORA, DSGVO, VA IT 2, NIS2, KI-VO, BFSG

---

## Kern-Architektur-Prinzipien

### 1. Privacy by Design & Default

**Prinzip:** Datenschutz ist von Anfang an Architektur-Entscheidung, nicht nachgelagerte Prüfung.

**Umsetzung:**

- **Datenminimierung:** Nur Daten erfassen, die für Geschäftszweck nötig sind.
  - Beispiel: Für Altersvorsorge-Berechnung brauchen wir Geburtsdatum, nicht aber Familienstand
- **Pseudo-Anonymisierung wo möglich:** z.B. Analytics nutzt gehashed User-IDs, nicht echte Namen
- **Privacy-Folgenabschätzung (DSFA):** Für High-Risk-Features durchführen (Art. 35 DSGVO)
  - Beispiele: Automatisierte Entscheidung über Leistung, Bulk-Daten-Export, KI-basierte Renten-Vorschläge
  - DSFA wird dokumentiert und ist Teil der Compliance-Matrix
- **Aufbewahrungsfristen:** Jedes Datenelement hat klare Aufbewahrungsdauer
  - Standard: 10 Jahre (Steuer/Audit), dann automatische Löschung (Soft Delete → Hard Delete)
  - Über `deleted_at` Feld implementiert in Datenbank
- **Daten-Portabilität:** Betroffene (Mitarbeiter) können ihre Daten exportieren (Art. 20 DSGVO)
  - Endpoint: `GET /api/v1/profile/export` gibt JSON/CSV mit allen persönlichen Daten
- **Rechtliche Verarbeitung:** Jede Verarbeitung hat dokumentierte Rechtsgrundlage
  - Smart!bAV lädt AVV (Auftragsverarbeitungsvertrag) für jeden Makler

**Architektur-Muster:**
```
User Input
    ↓
Input Validation + Sanitization
    ↓
Encryption at Rest (wenn PII)
    ↓
Database (mit RLS für Mandanten-Isolation)
    ↓
Audit Log (wer, wann, was)
    ↓
Analytics (anonymisiert/gehashed)
```

---

### 2. Security by Default

**Prinzip:** Sichere Konfiguration ist Standard, unsicherer Fallback existiert nicht.

**Umsetzung:**

- **Schlüsselvereinbarungen:**
  - **TLS 1.3 obligatorisch** für alle Verbindungen (HTTP/REST, DB, Messages)
  - **Encryption at Rest:** Sensitive Felder (SSN, Bankdaten) mit AES-256 verschlüsselt
  - **JWT RS256:** Asymmetrische Signatur (Private Key nur im Backend gehalten)
  - **Rate Limiting:** Standard 1000 req/min pro API-Key (IKT-Drittanbieter 100 req/min)
  - **CORS:** Whitelist-basiert, keine `*`-Wildcards
  - **CSRF-Token:** Bei State-Changing Operations (POST, PUT, DELETE)
  - **SQL Injection:** Ausgeschlossen durch Parameterized Queries (TypeORM, SQLAlchemy)

- **Secrets Management:**
  ```
  ❌ NICHT: Secrets in .env, Git, Code, Logs
  ✅ JA: Secrets in Vault (HashiCorp Vault oder AWS Secrets Manager)

  Zugriff: Service-Account mit kurzlebigen Credentials (TTL < 1h)
  Audit: Jeder Secret-Zugriff wird geloggt
  ```

- **Error Handling:** Niemals interne Fehler an Client exponieren
  ```
  ❌ NICHT: "Database connection error: Connection refused at 10.0.1.5:5432"
  ✅ JA: {"error": "INTERNAL_ERROR", "message": "Temporary outage, retry in 60s"}

  Interne Fehler werden geloggt (mit Stack Trace), Client bekommt nur Error-Code
  ```

- **Input Validation:** Whitelist-Ansatz (nicht Blacklist)
  ```typescript
  // ✅ Whitelist: Akzeptiere nur Dinge, die wir kennen
  class CreateContractDTO {
    @IsString() @MaxLength(100) name: string;
    @IsEnum(['DIRECTINSURANCE', 'PENSIONSFUND']) fundingType: FundingType;
    @IsNumber() @Min(0) @Max(100) employeeContribution: number;
  }

  // ❌ Blacklist: Blockiere "gefährlich" aussehende Dinge
  // Zu leicht, etwas Böses zu übersehen
  ```

**Sicherheits-Checkliste vor Release:**
- [ ] Keine Secrets in Code/Logs/Errors
- [ ] TLS aktiviert für DB, API, Third-Party-Calls
- [ ] Alle npm-Dependencies gescannt (npm audit, Snyk)
- [ ] Penetration Test durchgeführt oder SBOM-Review
- [ ] Authentication (JWT) + Authorization (RBAC) implementiert
- [ ] Rate Limiting aktiviert

---

### 3. Mandantenisolation (Kritisch)

**Prinzip:** Ein Makler kann nie (auch nicht durch Bugs) Daten eines anderen Maklers sehen.

**Umsetzung:**

```
LOGIN (Martin von Maklerhaus A)
  ↓
Token erhält claim: tenant_id = "abc123"
  ↓
API-Request kommt mit Bearer Token
  ↓
Middleware parsed Token, setzt PostgreSQL context:
   SET app.tenant_id = 'abc123'
  ↓
Alle SELECT Queries sind automatisch gefiltert:
   SELECT * FROM contracts WHERE tenant_id = current_setting('app.tenant_id')
  (via Row-Level Security Policy)
  ↓
Auch wenn Code sagt "SELECT * FROM contracts"
   wird nur Martin's Contracts zurückgeben
```

**Wichtig: Fehler hier sind Critical Findings!**

```sql
-- RLS Policy (PostgreSQL)
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_contracts ON contracts
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- Für Admin-Views: Policy mit Admin-Rolle-Bypass
CREATE POLICY admin_bypass_contracts ON contracts
  USING (
    CASE
      WHEN current_user_role = 'admin' THEN TRUE
      ELSE tenant_id = current_setting('app.tenant_id')::uuid
    END
  );
```

**Testing:** RLS-Isolation wird in QA Phase getestet:
- Test-Scenario: "Makler A versucht, Makler B's Daten abzufragen" → 0 Rows zurück
- Negative Test: Auch wenn Code-Bug ist, DB garantiert Isolation
- Performance Test: RLS darf nicht >10% Overhead einbringen

---

### 4. API-First Ansatz

**Prinzip:** Backend definiert klare API-Schnittstellen zuerst, Frontend + Third-Party bauen darauf auf.

**Umsetzung:**

- **OpenAPI 3.1 Spec vor Implementation:**
  ```
  Phase 1: Solution Architect schreibt OpenAPI Spec (YAML)
  Phase 2: Frontend + Backend implementieren gegen Spec
  Phase 3: Code-Generator erzeugt SDK/Mock-Server aus Spec
  ```

- **RESTful Design:**
  ```
  GET    /api/v1/contracts              # List all (mit Pagination)
  POST   /api/v1/contracts              # Create
  GET    /api/v1/contracts/{id}         # Read
  PUT    /api/v1/contracts/{id}         # Update (full)
  PATCH  /api/v1/contracts/{id}         # Update (partial)
  DELETE /api/v1/contracts/{id}         # Delete (soft delete via deleted_at)

  Nicht: GET /api/deleteContract?id=x  ❌ (nicht REST)
  ```

- **Versionierung:** Header-basiert oder URL-Pfad
  ```
  Option A (Header): X-API-Version: 1.0
  Option B (Path): /api/v1/ vs /api/v2/

  Entscheidung: [BITTE ERGÄNZEN: welche Strategie wird verwendet?]
  ```

- **Pagination (für große Result-Sets):**
  ```json
  GET /api/v1/contracts?page=1&limit=100

  Response:
  {
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 100,
      "total": 5432,
      "pages": 55
    }
  }

  Alternative: Cursor-basiert (besser für große Datenmengen)
  GET /api/v1/contracts?cursor=abc123&limit=100
  ```

- **Error Response Format (einheitlich):**
  ```json
  {
    "error": "VALIDATION_ERROR",
    "message": "Employee contribution must be between 0 and 100",
    "status": 400,
    "details": {
      "field": "employeeContribution",
      "constraint": "range",
      "value": 150
    },
    "trace_id": "abc123" // für Debugging
  }
  ```

- **HATEOAS (optional, kontrovers):**
  ```json
  {
    "id": "contract123",
    "name": "Contract XYZ",
    "_links": {
      "self": { "href": "/api/v1/contracts/contract123" },
      "employees": { "href": "/api/v1/contracts/contract123/employees" },
      "update": { "href": "/api/v1/contracts/contract123", "method": "PUT" }
    }
  }
  ```
  **Entscheidung:** [BITTE ERGÄNZEN: HATEOAS ja/nein?]

---

### 5. Defense in Depth

**Prinzip:** Mehrere Sicherheits-Layer statt ein großer Lock.

**Umsetzung:**

```
Layer 1 (Netzwerk):
  - Firewall (nur HTTPS/443 in)
  - WAF (DDoS-Schutz, Bot-Detection)
  - VPC-Isolation (separate Networks pro Mandant optional)

Layer 2 (API Gateway):
  - Rate Limiting (1000 req/min)
  - Request Validation (Content-Type, Size)
  - IP-Whitelist (für IKT-Drittanbieter optional)

Layer 3 (Application):
  - Authentication (JWT)
  - Authorization (RBAC: welche Rolle darf was?)
  - Input Validation (Whitelist)
  - Business Logic (Mandanten-ID Check)

Layer 4 (Database):
  - Row-Level Security (RLS)
  - Encryption at Rest
  - Backup + Encryption for Backups

Layer 5 (Audit):
  - Audit Trail (wer, wann, was)
  - Monitoring + Alerting
  - Incident Response Plan
```

**Prinzip:** Auch wenn Layer 3 (Application) fehlerhaft ist, sichern Layer 4 (RLS) + Layer 5 (Audit) die Daten.

---

## Non-Functional Requirements (NFR) Template

Jede Komponente sollte folgende NFRs definiert haben:

### NFR-Template

```markdown
## Komponente: [Name] (z.B. "Contracts-Service")

### Performance
- API-Response Time: Median < 200ms, p95 < 500ms, p99 < 1000ms
  - Test: 100 concurrent users, 1000 req/min
  - Tool: k6 oder JMeter
- Database Query Time: < 100ms für standard queries
  - Test: EXPLAIN ANALYZE vor Release
  - Monitoring: Slow Query Log konfiguriert
- Frontend Bundle Size: < [BITTE ERGÄNZEN: z.B. 500KB gzipped]
  - Messung: npm build, measure output
  - Tool: webpack-bundle-analyzer

### Scalability
- Parallel Users: Min [BITTE ERGÄNZEN: z.B. 10.000 concurrent]
- Requests/Sec: Min [BITTE ERGÄNZEN: z.B. 1.000 req/s]
- Growth Strategy: Horizontal scaling (mehr Server/Container)
- Database: Read Replicas [BITTE ERGÄNZEN: ja/nein]

### Availability & Reliability
- Availability SLA: [BITTE ERGÄNZEN: z.B. 99.9% = 44 Min downtime/month]
- MTTR (Mean Time To Recovery): < [BITTE ERGÄNZEN: z.B. 30 minutes]
- MTBF (Mean Time Between Failures): > [BITTE ERGÄNZEN: z.B. 1000 hours]
- Deployment: Blue-Green oder Canary (Zero Downtime)

### Security
- Authentication: JWT RS256, Token Expiry < [BITTE ERGÄNZEN: z.B. 1 hour]
- Encryption in Transit: TLS 1.3
- Encryption at Rest: AES-256 für sensitive Felder
- Rate Limiting: 1000 req/min (standard), 100 req/min (third-party)
- Secrets Rotation: [BITTE ERGÄNZEN: z.B. every 90 days]

### Compliance
- Audit Trail: Alle mutations geloggt (create, update, delete)
- Retention: [BITTE ERGÄNZEN: z.B. 10 years for regulatory]
- Data Residency: Germany only (DSGVO, NIS2)
- Penetration Test: [BITTE ERGÄNZEN: z.B. yearly]
- Certification: [BITTE ERGÄNZEN: z.B. ISO 27001, BSI Grundschutz]

### Accessibility
- WCAG 2.2 Level AA
- Color Contrast: ≥ 4.5:1 (normal text), ≥ 3:1 (large text)
- Keyboard Navigation: 100% funktional
- Screen Reader: Tested mit NVDA/JAWS
- Mobile Responsive: Tested auf 320px - 2560px

### Observability
- Logging: Strukturiert JSON, mit trace_id für End-to-End Tracing
- Metrics: Prometheus-compatible, 1-minute granularity
- Tracing: OpenTelemetry mit W3C Trace Context
- Alerting: [BITTE ERGÄNZEN: z.B. PagerDuty integration]
- Dashboard: Grafana mit Key Metrics
```

---

## Caching-Strategie

**Prinzip:** Intelligent Caching reduziert Database Load + API Latency.

### Caching Decision Tree

```
Ist die Daten häufig gelesen?
├─ JA: Kann es 5+ Minuten alt sein?
│  ├─ JA: Redis (distributed, mit TTL)
│  │  └─ Beispiele: Employee-Master-Data (Personio),
│  │              Versicherer-Stammdaten,
│  │              Feature-Flags
│  │
│  └─ NEIN: Braucht echte Echtzeit?
│     ├─ JA: Database-Query (kein Cache)
│     │  └─ Beispiele: Aktuelle Kontodaten,
│     │              Laufende Transaktionen
│     │
│     └─ NEIN: In-Memory Cache (Single Service, 1-2 Min TTL)
│        └─ Beispiele: Nutzer-Rollen,
│                   Tenant-Konfiguration
│
└─ NEIN (selten gelesen): Kein Cache nötig
   └─ Beispiel: Historische Audit-Logs
```

### Caching-Patterns

#### Pattern 1: Redis Cache (Distributed)

```typescript
// Cache miss → Database + Redis
async getEmployeeMasterData(tenantId: string): Promise<Employee[]> {
  const cacheKey = `employees:${tenantId}`;

  // 1. Versuche von Redis zu laden
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // 2. Cache miss → Database Query
  const data = await db.employees.find({ tenantId });

  // 3. Cache mit TTL (5 Minuten)
  await redis.set(cacheKey, JSON.stringify(data), 'EX', 300);

  return data;
}
```

#### Pattern 2: In-Memory Cache (Single Service)

```typescript
// Für schnelle, einfache Lookups
const roleCache = new Map<string, Role[]>();

function getUserRoles(userId: string): Role[] {
  // 1. Versuche Memory-Cache
  if (roleCache.has(userId)) {
    return roleCache.get(userId);
  }

  // 2. Cache miss → Query
  const roles = db.roles.findByUserId(userId);
  roleCache.set(userId, roles);

  // 3. Auto-Invalidate nach 2 Minuten
  setTimeout(() => roleCache.delete(userId), 2 * 60 * 1000);

  return roles;
}
```

### Cache Invalidation Patterns

**Problem:** Wie aktuell ist Cache nach Daten-Update?

#### Pattern 1: TTL (Time-Based)
```
Einfach, funktioniert überall
Nachteil: Bis zu 5 Min alte Daten möglich
```

#### Pattern 2: Event-Based Invalidation
```typescript
// Wenn Daten aktualisiert werden, publishe Event
class EmployeeService {
  async updateEmployee(id: string, data: Employee) {
    // 1. Datenbank aktualisieren
    const updated = await db.employees.update(id, data);

    // 2. Event publishen
    await eventBus.publish('employee:updated', {
      employeeId: id,
      tenantId: data.tenantId
    });

    return updated;
  }
}

// Anderer Service subscribt und invalidiert Cache
eventBus.subscribe('employee:updated', async (msg) => {
  const key = `employees:${msg.tenantId}`;
  await redis.del(key); // Cache sofort löschen
});
```

#### Pattern 3: Explicit Invalidation
```typescript
// Admin kann manuell Cache leeren (wenn nötig)
POST /api/v1/admin/cache/clear
{
  "pattern": "employees:*"
}

// Backend löscht alle Keys die auf Pattern passen
await redis.del(pattern);
```

### Cache Monitoring

```
Metrics zu monitoren:
- Hit Rate: % von Requests, die von Cache bedient wurden (Ziel: >80%)
- Eviction Rate: Wie oft wird Cache voll (sollte selten sein)
- Stale Data: Wie oft ist Cache älter als TTL? (Ziel: 0%)
```

---

## Event Architecture

**Prinzip:** Services kommunizieren via Events, nicht direkt (Loose Coupling).

### Event Bus Pattern

```
┌──────────────┐                    ┌──────────────────┐
│ Contracts    │                    │  Event Bus       │
│ Service      │  publish event     │ (RabbitMQ/Kafka)│
└──────┬───────┘                    └────────┬─────────┘
       │                                     │
       └──────> contract:created ───────────┤
                                            │
                                            └──> Consumer 1 (Audit Log)
                                            │
                                            └──> Consumer 2 (Email Service)
                                            │
                                            └──> Consumer 3 (Analytics)
```

### Event-Format (CloudEvents Standard)

```json
{
  "specversion": "1.0",
  "type": "com.smartbav.contract.created",
  "source": "contracts-service",
  "id": "abc123",
  "time": "2025-02-11T14:30:00Z",
  "datacontenttype": "application/json",
  "subject": "contract/contract123",
  "dataschema": "https://api.smartbav.de/schemas/contract-created.json",
  "data": {
    "contractId": "contract123",
    "tenantId": "tenant123",
    "employerId": "emp456",
    "startDate": "2025-02-11"
  }
}
```

### Idempotente Consumer

**Prinzip:** Event könnte mehrfach ankommen → Consumer muss idempotent sein.

```typescript
// ❌ NICHT IDEMPOTENT: mehrfach ausgeführt = Problem
async handleContractCreated(event: ContractCreatedEvent) {
  await emailService.sendNotification(event.contractId);
  // Wenn Event 2x kommt: 2 Emails versendet!
}

// ✅ IDEMPOTENT: auch mehrfach sicher
async handleContractCreated(event: ContractCreatedEvent) {
  const processed = await db.processedEvents.findOne({
    eventId: event.id
  });

  if (processed) {
    return; // Already handled, skip
  }

  // 1. Verarbeite Event
  await emailService.sendNotification(event.contractId);

  // 2. Markiere als verarbeitet (atomare Operation!)
  await db.processedEvents.create({
    eventId: event.id,
    processedAt: now()
  });
}
```

### Dead Letter Queue (DLQ)

```
Event kommt an → Consumer verarbeitet
  │
  ├─ Success: Event done
  └─ Fail: Retry 3x
     ├─ Success: Event done
     └─ Fail nach 3 Retries: → Dead Letter Queue
        (wird später manuell analysiert/repariert)
```

---

## C4 Architecture Model

**Prinzip:** Architektur wird auf 4 Abstraktions-Ebenen dokumentiert.

### Level 1: System Context

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  [Makler Martin]                 [Arbeitnehmer Anton]
│       │                                  │
│       └──────────┬───────────────────────┘
│                  │
│              [smart!bAV]
│           Platform (System)
│                  │
│    ┌─────┬──────┼──────┬─────┐
│    │     │      │      │     │
│  [SAP] [DATEV] [Versicherer] [Personio] [HR-System]
│
└─────────────────────────────────────────────────────┘
```

### Level 2: Container (Services)

```
┌──────────────────────────────────────────────────────────┐
│                    smart!bAV System                      │
│                                                          │
│  ┌────────────────┐  ┌──────────────────────────────┐  │
│  │  Web UI        │  │  Admin Dashboard             │  │
│  │  (Angular)     │  │  (Reporting, Compliance)     │  │
│  └────────┬───────┘  └──────────────┬───────────────┘  │
│           │                         │                  │
│           └────────────┬────────────┘                  │
│                        │                              │
│            ┌───────────▼──────────────┐              │
│            │   API Gateway            │              │
│            │   (Kong / Nginx)         │              │
│            └───────────┬──────────────┘              │
│                        │                              │
│        ┌───────────────┼────────────────┐            │
│        │               │                │            │
│    ┌───▼──┐    ┌──────▼──────┐   ┌────▼────┐       │
│    │Auth  │    │Contracts    │   │Employees│       │
│    │Service   │Service       │   │Service   │       │
│    └───────┘    └─────────────┘   └─────────┘       │
│        │               │                │            │
│        └───────────────┼────────────────┘            │
│                        │                              │
│            ┌───────────▼──────────────┐              │
│            │   PostgreSQL Database    │              │
│            │   (Row-Level Security)   │              │
│            └────────────────────────────┘              │
│                                                          │
│    ┌──────────────┐        ┌──────────────┐         │
│    │  Event Bus   │        │  Redis Cache │         │
│    │ (RabbitMQ)   │        │              │         │
│    └──────────────┘        └──────────────┘         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Level 3: Component (Inside Contracts-Service)

```
┌────────────────────────────────────────────────┐
│          Contracts Service                    │
│                                               │
│  Controller Layer                            │
│  ┌────────────────────────────────────────┐  │
│  │ POST   /contracts       (Create)       │  │
│  │ GET    /contracts/{id}  (Read)         │  │
│  │ PUT    /contracts/{id}  (Update)       │  │
│  │ DELETE /contracts/{id}  (Delete)       │  │
│  └────────────────┬─────────────────────┘  │
│                   │                         │
│  Service Layer                             │
│  ┌────────────────▼─────────────────────┐  │
│  │ ContractService                      │  │
│  │  - createContract()                  │  │
│  │  - validateMandantOwnership()        │  │
│  │  - checkUnverfallbarkeit()           │  │
│  │  - publishEvent()                    │  │
│  └────────────────┬─────────────────────┘  │
│                   │                         │
│  Repository Layer (Data Access)            │
│  ┌────────────────▼─────────────────────┐  │
│  │ ContractRepository                   │  │
│  │  - find(contractId, tenantId)        │  │
│  │  - save(contract)                    │  │
│  │  - delete(contractId, tenantId)      │  │
│  └──────────────────────────────────────┘  │
│                                               │
└────────────────────────────────────────────────┘
```

### Level 4: Code (Classes + Interfaces)

```typescript
// Interface
interface IContractRepository {
  find(id: string, tenantId: string): Promise<Contract>;
  save(contract: Contract): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
}

// Implementation
class ContractRepository implements IContractRepository {
  async find(id: string, tenantId: string): Promise<Contract> {
    // Setzt RLS context
    return await this.db.contracts.findOne({
      where: { id, tenantId }
    });
  }
}

// Service
class ContractService {
  constructor(
    private repository: IContractRepository,
    private eventBus: EventBus
  ) {}

  async createContract(input: CreateContractDTO, tenantId: string): Promise<Contract> {
    // 1. Validierung
    this.validateInput(input);

    // 2. Business Logic
    const contract = new Contract(input);

    // 3. Persistieren
    await this.repository.save(contract);

    // 4. Event publishen
    await this.eventBus.publish('contract:created', {
      contractId: contract.id,
      tenantId
    });

    return contract;
  }
}
```

---

## API-Design-Prinzipien

### Versionierung

**Entscheidung: [BITTE ERGÄNZEN]**

Option A: Header-basiert
```
GET /api/contracts HTTP/1.1
X-API-Version: 1.0

Vorteil: Saubere URLs
Nachteil: Weniger sichtbar
```

Option B: URL-Pfad
```
GET /api/v1/contracts HTTP/1.1

Vorteil: Eindeutig in URLs
Nachteil: Duplicate Endpoints
```

### Pagination

```
GET /api/v1/contracts?page=1&limit=100

Response:
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 5432,
    "pages": 55,
    "hasNext": true
  }
}

Alternative (Cursor-based):
GET /api/v1/contracts?cursor=abc123&limit=100

Response:
{
  "data": [...],
  "pagination": {
    "cursor": "xyz789",
    "hasNext": true
  }
}
```

### Rate Limiting

```
Standard: 1000 req/min per API-Key
Third-Party: 100 req/min per API-Key

Response Header:
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1707576600

Wenn Limit erreicht:
HTTP 429 Too Many Requests
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Rate limit: 1000 req/min",
  "retryAfter": 60
}
```

### Error Codes

Einheitliche Error-Codes für Client-Handling:

| Code | Bedeutung | HTTP Status |
|------|-----------|-------------|
| VALIDATION_ERROR | Input-Validierung fehlgeschlagen | 400 |
| AUTHENTICATION_FAILED | JWT ungültig/expired | 401 |
| FORBIDDEN | Keine Berechtigung (z.B. anderer Mandant) | 403 |
| NOT_FOUND | Resource existiert nicht | 404 |
| CONFLICT | Konflikt (z.B. Duplicate Key) | 409 |
| RATE_LIMIT_EXCEEDED | Zu viele Requests | 429 |
| INTERNAL_ERROR | Server-Fehler (log trace_id!) | 500 |
| SERVICE_UNAVAILABLE | Temporär nicht erreichbar | 503 |

---

## Deployment und Rollback

### Blue-Green Deployment

```
Production läuft auf "Blue"
     ↓
Deploy neue Version auf "Green" (parallel)
     ↓
Smoke Tests auf Green (✓ OK)
     ↓
Traffic switch: Blue → Green
     ↓
Green wird neue "Blue"
     ↓
Alte Version als "Green" für Rollback bereit
     ↓
Nach 24h: Alte Version stoppen (wenn kein Rollback nötig)
```

**Vorteil:** Zero Downtime, schneller Rollback

### Canary Release

```
Deploy neue Version für 1% der User
     ↓
Monitoring 10 Minuten
     ↓
Fehlerquote < 0.1%? JA → 10% Rollout
     ↓
Weiter: 50% → 100%
     ↓
Fehlerquote > 0.1%? NEIN → Rollback
```

**Vorteil:** Frühe Fehler-Erkennung, minimales Impact

---

## Monitoring und Alerting

### Key Metrics (pro Service)

```
API Latency:
  - p50 (Median)
  - p95 (95th percentile)
  - p99 (99th percentile)

Error Rate:
  - Total Errors / Total Requests
  - Errors per Endpoint
  - HTTP 5xx vs 4xx vs 3xx

Database:
  - Query Latency (p95)
  - Slow Queries (> 1s)
  - Connection Pool Usage
  - Replication Lag (if applicable)

Business:
  - New Contracts Created / hour
  - Mandanten-Activation Rate
  - Feature-Usage Statistics

System:
  - CPU Usage
  - Memory Usage
  - Disk I/O
  - Network In/Out
```

### Alert Thresholds

| Condition | Severity | Action |
|-----------|----------|--------|
| API Error Rate > 5% | Critical | PagerDuty Page (Immediate) |
| API p95 Latency > 2s | High | Slack Alert + On-Call Logging |
| Database Query p95 > 500ms | Medium | Log + Monitoring Dashboard |
| Memory Usage > 90% | High | Slack Alert |
| Disk Space < 10% | Critical | Pagerduty Page |

---

## Governance und Compliance

### Feature Release Checklist

Vor jedem Release müssen folgende Quality Gates erfüllt sein:

- [ ] **Code Review:** Min 2 Approvals
- [ ] **Tests:** Unit Tests ≥80%, E2E für critical flows
- [ ] **Security:** Penetration Test durchgeführt, npm audit clean, SBOM generated
- [ ] **Compliance:** Compliance-Matrix updated, DSFA wenn nötig, AVV-Check
- [ ] **Accessibility:** WCAG 2.2 AA audit passed
- [ ] **Performance:** Lasttests durchgeführt, p95 < Threshold
- [ ] **Deployment:** Blue-Green oder Canary Setup
- [ ] **Monitoring:** Alerts configured, Dashboard ready
- [ ] **Documentation:** API-Doku updated, Runbook verfügbar
- [ ] **Compliance Officer Freigabe:** Ja/Nein

---

## Kontakt und Weiterentwicklung

**Architecture Owner:** Solution Architect
**Letzte Änderung:** 2025-02-11
**Nächster Review:** Q2 2025

Feedback zu Architektur-Prinzipien? → Solution Architect kontaktieren.
