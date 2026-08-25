# Band Contest Fraud PoC

Prueba de concepto de un sistema de detección de fraude para una plataforma de concursos de bandas.

El objetivo de esta PoC es evaluar diferentes señales de comportamiento durante las votaciones y asignar un nivel de riesgo a cada intento de voto.

## Stack

* Node.js
* Express
* JavaScript
* MySQL 8.4
* Docker
* Docker Compose
* mysql2
* Arquitectura modular
* Repository Pattern

## Arquitectura

El proyecto utiliza una arquitectura modular, separando las responsabilidades de cada parte de la aplicación.

```text
src/
├── config/
│   └── database.js
│
├── modules/
│   ├── voting/
│   │   ├── voting.controller.js
│   │   ├── voting.service.js
│   │   ├── voting.repository.js
│   │   └── voting.routes.js
│   │
│   └── fraud/
│       ├── fraud.service.js
│       └── fraud.repository.js
│
├── routes.js
└── app.js
```

### Controller

Recibe las peticiones HTTP y devuelve las respuestas al cliente.

```text
HTTP → Controller → Service
```

### Service

Contiene la lógica de negocio y coordina los diferentes componentes.

### Repository

Se encarga exclusivamente del acceso a la base de datos.

```text
Service → Repository → MySQL
```

Esto permite mantener separada la lógica de negocio de las consultas SQL.

## Docker

La aplicación y MySQL se ejecutan mediante Docker Compose.

```text
Docker Compose
│
├── API
│   └── Node.js + Express
│
└── MySQL
```

La API está disponible en:

```text
http://localhost:3001
```

## Configuración

Las variables de entorno se definen en `.env`.

Ejemplo:

```env
PORT=3000

DB_HOST=mysql
DB_PORT=3306
DB_USER=fraud_poc
DB_PASSWORD=fraud_poc_password
DB_DATABASE=band_contest_fraud_poc
DB_ROOT_PASSWORD=root_password
```

## Arranque

Construir y levantar los contenedores:

```bash
docker compose up -d --build
```

Comprobar el estado:

```bash
docker compose ps
```

Ver los logs de la API:

```bash
docker compose logs -f api
```

## Base de datos

La PoC utiliza un script para reconstruir la base de datos.

```bash
docker compose exec api npm run db:reset
```

Este proceso elimina las tablas existentes y las vuelve a crear.

Por tanto, **no debe utilizarse sobre datos reales**.

## Votaciones

Endpoint:

```http
POST /api/voting
```

Ejemplo:

```json
{
    "userId": 1,
    "contestId": 1,
    "artistId": 1
}
```

### Regla de negocio

Un usuario solamente puede emitir **un voto por concurso**.

Esta regla está garantizada mediante una restricción única en MySQL:

```sql
UNIQUE (user_id, contest_id)
```

Por ejemplo:

```text
Usuario 1 + Concurso 1 → permitido
Usuario 1 + Concurso 1 → rechazado
Usuario 1 + Concurso 2 → permitido
```

## Registro de intentos

Todos los intentos de votación se almacenan en `vote_attempts`.

Un intento puede tener los siguientes estados:

```text
accepted
rejected
suspicious
```

Esto permite analizar posteriormente tanto los votos aceptados como los intentos rechazados o sospechosos.

## Sistema antifraude

El sistema antifraude analiza un intento de voto antes de crear el voto definitivo.

Actualmente existe una primera regla:

### Múltiples usuarios desde una misma IP

Se analiza el número de usuarios diferentes que han intentado votar:

* desde la misma IP
* en el mismo concurso
* durante los últimos 5 minutos

Si se alcanzan 5 usuarios diferentes, el intento obtiene:

```text
status: suspicious
riskScore: 40
```

Actualmente los votos sospechosos **no se bloquean**. La finalidad de esta PoC es evaluar las señales y el sistema de puntuación antes de implementar decisiones automáticas de bloqueo.

## Flujo de una votación

```text
POST /api/voting
        │
        ▼
Voting Controller
        │
        ▼
Voting Service
        │
        ├── ¿Ya ha votado?
        │       │
        │       ├── Sí → rejected
        │       │
        │       └── No
        │
        ▼
Fraud Service
        │
        ▼
Fraud Repository
        │
        ▼
Evaluación de reglas
        │
        ▼
Registro en vote_attempts
        │
        ▼
Creación del voto
```

## Objetivo de la PoC

El objetivo no es construir todavía un sistema antifraude definitivo, sino validar progresivamente:

1. Arquitectura modular.
2. Separación mediante Repository Pattern.
3. Registro de intentos de votación.
4. Detección de patrones sospechosos.
5. Sistema de puntuación de riesgo.
6. Combinación de diferentes reglas antifraude.
7. Posterior definición de criterios para aceptar, marcar como sospechoso o rechazar un voto.

Las reglas antifraude se irán incorporando progresivamente a medida que avance la PoC.
