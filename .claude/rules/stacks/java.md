---
paths:
  - "**/*.java"
  - "**/*.kt"
  - "**/pom.xml"
  - "**/build.gradle*"
  - "**/application*.yml"
  - "**/logback*.xml"
---

# Stack: Java 21 · Spring Boot 3.x

Concrete tooling that satisfies `CLAUDE.md` and the rules in `.claude/rules/`. Parenthesised names point to the rule a section implements. Where this file and a rule disagree, the rule wins — report the conflict.

## Toolchain & commands

| Task | Command |
|------|---------|
| Build | `./gradlew build` (or `./mvnw verify`) |
| Test | `./gradlew test` — run before every "done" claim (testing.md) |
| Format | Spotless with google-java-format: `./gradlew spotlessApply`; check: `spotlessCheck` |
| Lint | Error Prone + NullAway via compiler plugins; `./gradlew check` |
| Deps | Gradle version catalog `gradle/libs.versions.toml`; lockfile `gradle.lockfile` committed |
| Run local | `./gradlew bootRun --args='--spring.profiles.active=local'` |

## Layout (architecture.md)

```
src/main/java/<org>/<service>/
  api/            controllers, request/response DTOs (records), @RestControllerAdvice
  application/    use-case services (@Service, @Transactional), command/query objects
  domain/         entities, value objects, domain events, ports (interfaces), exceptions — NO Spring imports
  infrastructure/ JPA adapters, HTTP clients, messaging, config classes
src/main/resources/
  db/migration/   Flyway — V<yyyyMMddHHmm>__<snake_desc>.sql
  openapi/        openapi.yaml (source of truth, api.md)
  logback-spring.xml
```

- Domain purity check: `domain/**` has no `org.springframework.*`, `jakarta.persistence.*`, or `com.fasterxml.*` imports. ArchUnit test enforces this (`ArchitectureTest`).
- DTOs are `record`s. No Lombok in `domain/`; Lombok elsewhere only for `@Slf4j`.
- Constructor injection only. No `@Autowired` on fields.

## Config (architecture.md)

- `@ConfigurationProperties` records with `@Validated`; bound from env vars via Spring relaxed binding (`APP_DB_URL` → `app.db.url`).
- Fail fast: missing required property = startup failure. No `@Value` scattered in code.
- Profiles: `local`, `test`, `prod`. Secrets never in `application*.yml`.

## Validation at the boundary (security.md)

- Jakarta Bean Validation on request records (`@NotNull`, `@Size`, `@Pattern`, custom constraints). `@Valid` on every controller parameter.
- Domain value objects validate their own invariants in the constructor and throw `DomainException` subclasses — these are business rules (CLAUDE.md §1) and must trace to `I-nn`/`R-nn`.

## Error mapping (api.md)

- One `@RestControllerAdvice` (`ApiExceptionHandler`) maps:
  `MethodArgumentNotValidException` → 400 `VALIDATION_FAILED` with `details[]` · `AuthenticationException` → 401 · `AccessDeniedException` → 403 · `NotFoundException` → 404 · `ConflictException` → 409 · `DomainRuleViolation` → 422 · everything else → 500 `INTERNAL_ERROR` (message fixed, never `ex.getMessage()`).
- Error codes are an `enum ErrorCode` in `api/`. New enum constant = suggestion → approval.
- `trace_id` in the envelope from `Tracer.currentSpan().context().traceId()`.

## Logging (logging.md)

- SLF4J API; Logback with `net.logstash.logback:logstash-logback-encoder`. Trace/span from Micrometer Tracing (`micrometer-tracing-bridge-otel`) via MDC.
- `logback-spring.xml` (prod profile) — emits exactly the logging.md field set:

```xml
<appender name="JSON" class="ch.qos.logback.core.ConsoleAppender">
  <encoder class="net.logstash.logback.encoder.LogstashEncoder">
    <fieldNames>
      <timestamp>ts</timestamp><level>level</level><message>msg</message>
      <logger>[ignore]</logger><thread>[ignore]</thread><version>[ignore]</version><levelValue>[ignore]</levelValue>
    </fieldNames>
    <timestampPattern>yyyy-MM-dd'T'HH:mm:ss.SSSX</timestampPattern>
    <timeZone>UTC</timeZone>
    <customFields>{"service":"${SERVICE_NAME}","env":"${APP_ENV}","version":"${APP_VERSION}"}</customFields>
    <includeMdcKeyName>trace_id</includeMdcKeyName>
    <includeMdcKeyName>span_id</includeMdcKeyName>
    <throwableConverter class="net.logstash.logback.stacktrace.ShortenedThrowableConverter"><maxDepthPerThrowable>30</maxDepthPerThrowable></throwableConverter>
  </encoder>
</appender>
```
- Set `logging.pattern.correlation` off and copy `traceId`/`spanId` to MDC keys `trace_id`/`span_id` in a `Filter` (or configure `management.tracing.baggage.correlation.fields`).
- Every log call uses structured args: `log.atInfo().addKeyValue("event","order.created").addKeyValue("order_id", id).log("Order created");` — never `log.info("Order " + id)`.
- Request summary line: one `OncePerRequestFilter` emitting `event=http.request` with `method`, `route` (from `HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE`), `status`, `duration_ms`. Disable Spring's default request logging.

## Persistence & migrations (data.md)

- Spring Data JPA or jOOQ; either way no JPQL/SQL string concatenation.
- Flyway, `spring.flyway.validate-on-migrate=true`. Never edit a `V*` file after it has run anywhere. Rollback documented in a comment header of each migration.
- Money: `long amount_minor` + `char(3) currency` columns → `Money` value object in domain. No `BigDecimal` for amounts; `BigDecimal` only for rates.
- Time: `java.time.Instant` ↔ `timestamptz`. Never `java.util.Date`, never `LocalDateTime` for instants.
- IDs: UUIDv7 via a single `IdGenerator` port; DB column `uuid`.

## API (api.md)

- Route prefix `/api/v1` set once via `@RequestMapping` on a base class or `server.servlet.context-path` + version group. No per-controller version strings.
- OpenAPI: spec-first, `src/main/resources/openapi/openapi.yaml`; `openapi-generator` produces interfaces the controllers implement. Changing a response record without updating the yaml fails the build.
- JSON: `snake_case` via `spring.jackson.property-naming-strategy=SNAKE_CASE`; `FAIL_ON_UNKNOWN_PROPERTIES=false` for requests (additive compatibility), but unknown fields on *strict* endpoints per `PRODUCT.md`.
- `Idempotency-Key` handled by one `HandlerInterceptor` + store; controllers don't implement it individually.

## Testing (testing.md)

- JUnit 5, AssertJ, Mockito only at ports. Testcontainers (Postgres, Kafka) for infrastructure tests — no H2.
- `@SpringBootTest` sparingly; slice tests (`@WebMvcTest`, `@DataJpaTest`) by default.
- Naming: `<Class>Test` unit, `<Class>IT` integration (`./gradlew integrationTest`).
- Every `I-nn` invariant has at least one test named after it: `@DisplayName("I-02 payment never captured twice for same idempotency key")`.

## Forbidden

`System.out/err` · field injection · `catch (Exception e)` without rethrow/mapping · `Optional` as field or parameter · `@Transactional` on controllers · `float`/`double` for money · `java.util.Date` · entities returned from controllers · `spring.jpa.hibernate.ddl-auto` other than `validate`/`none` · logging with string concatenation.
