# Band Contest Fraud PoC

Prueba de concepto de un sistema de detección de fraude para una plataforma de concursos de bandas.

El objetivo de esta PoC es evaluar diferentes señales de comportamiento durante las votaciones y asignar un nivel de riesgo a cada intento de voto.

## Tecnologías empleadas

* Node.js
* Express
* JavaScript
* MySQL 8.4
* Docker
* Docker Compose
* mysql2
* FingerprintJS
* Jest
* Arquitectura modular
* Repository Pattern

## Puesta en marcha

### Requisitos

Es necesario disponer de:

* Docker
* Docker Compose

### Levantar el entorno

Construir y arrancar los contenedores:

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

La API estará disponible en:

```text
http://localhost:3001
```

### Reconstruir la base de datos

La PoC incluye un script para eliminar y volver a crear las tablas:

```bash
docker compose exec api npm run db:reset
```

> **Atención:** este comando elimina las tablas existentes y sus datos. No debe utilizarse sobre una base de datos con información real.

### Ejecutar los tests

La batería de pruebas automatizadas se ejecuta contra MySQL:

```bash
docker compose exec api npm test
```

Actualmente existen **15 tests automatizados** que cubren las principales casuísticas del sistema antifraude.

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

## Sistema antifraude

Adicionalmente, se detectan rÃ¡fagas de **15 o mÃ¡s intentos desde la misma IP en 60 segundos**, con una puntuaciÃ³n de **+25** (`rapid_attempts_same_ip`). Esta seÃ±al se acumula con las demÃ¡s.

El sistema antifraude analiza cada intento de voto antes de crear el voto definitivo.

Actualmente se utilizan cuatro señales independientes que pueden combinarse para obtener una puntuación de riesgo:

### 1. Múltiples usuarios desde una misma IP

Detecta diferentes usuarios que intentan votar desde la misma dirección IP dentro del mismo concurso.

* Ventana: **5 minutos**
* Umbral: **5 usuarios diferentes**
* Puntuación: **+40**

### 2. Votos rápidos al mismo artista

Detecta un volumen elevado de intentos de voto hacia el mismo artista en un periodo muy corto.

* Ventana: **60 segundos**
* Umbral: **10 intentos**
* Puntuación: **+30**

### 3. Mismo fingerprint

Detecta cuando diferentes usuarios han votado utilizando el mismo fingerprint de dispositivo.

* Umbral: **otro usuario ya ha votado con ese fingerprint**
* Puntuación: **+40**

### Puntuación de riesgo

Las reglas son independientes y sus puntuaciones se acumulan.

```text
IP                    +40
Fingerprint           +40
Votos rápidos         +30
--------------------------
Máximo                110
```

Con la regla de ráfaga por IP, el máximo actual es **135**.

Actualmente cualquier puntuación superior a `0` genera:

```text
status: suspicious
```

Los votos sospechosos no se bloquean automáticamente. Se registran para poder analizar posteriormente el comportamiento y validar las reglas antes de definir políticas de bloqueo.

## Registro de intentos

Todos los intentos de votación se almacenan en `vote_attempts`, incluyendo:

* Usuario
* Concurso
* Artista
* IP
* User-Agent
* Estado
* Puntuación de riesgo
* Detalle de las reglas activadas

El detalle de las reglas se almacena como JSON, permitiendo conocer no solo la puntuación final sino **por qué un intento ha sido considerado sospechoso**.

## Tests automatizados

La batería de tests utiliza **Jest + MySQL**.

Actualmente se cubren **15 casos**:

| #  | Casuística                                         | Resultado esperado                 |
| -- | -------------------------------------------------- | ---------------------------------- |
| 1  | Voto limpio                                        | `accepted / 0`                     |
| 2  | 4 usuarios diferentes desde una IP                 | Sin alerta                         |
| 3  | 5 usuarios diferentes desde una IP                 | `+40`                              |
| 4  | 9 intentos rápidos al mismo artista                | Sin alerta                         |
| 5  | 10 intentos rápidos al mismo artista               | `+30`                              |
| 6  | Fingerprint único                                  | Sin alerta                         |
| 7  | Fingerprint utilizado por otro usuario que ya votó | `+40`                              |
| 8  | IP + votos rápidos                                 | `+70`                              |
| 9  | IP + fingerprint                                   | `+80`                              |
| 10 | IP + fingerprint + votos rápidos                   | `+110`                             |
| 11 | Intentos IP fuera de la ventana de 5 minutos       | Sin alerta                         |
| 12 | Múltiples intentos del mismo usuario desde una IP  | No contabiliza usuarios duplicados |
| 13 | 14 intentos desde una misma IP en 60 segundos       | Sin alerta                         |
| 14 | 15 intentos desde una misma IP en 60 segundos       | `+25`                              |
| 15 | Intentos desde una IP fuera de la ventana de 60 segundos | Sin alerta                      |

Los tests limpian los datos generados entre pruebas para evitar que un escenario contamine al siguiente.

Resultado actual:

```text
Test Suites: 1 passed
Tests:       12 passed
```

## Estado actual de la PoC

Actualmente se ha validado:

* Arquitectura modular.
* Repository Pattern.
* Registro de usuarios con fingerprint y datos del dispositivo.
* Registro de todos los intentos de voto.
* Regla de un voto por usuario y concurso.
* Detección por IP.
* Detección de ráfagas de votos.
* Detección por fingerprint.
* Acumulación de señales.
* Puntuación de riesgo.
* Detalle de las reglas que provocan la puntuación.
* Persistencia de intentos sospechosos y rechazados.
* Batería automatizada de **15 tests**.

La PoC seguirá evolucionando incorporando nuevas señales y casos de prueba antes de definir un sistema definitivo de decisión automática.
