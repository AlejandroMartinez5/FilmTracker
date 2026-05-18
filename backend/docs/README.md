# ReelTrack OpenAPI

La documentacion esta organizada por microservicio. Cada servicio tiene su propio contrato OpenAPI en `docs/openapi.yaml`:

- `../ms-auth/docs/openapi.yaml`
- `../ms-users/docs/openapi.yaml`
- `../ms-shows/docs/openapi.yaml`
- `../ms-users-library/docs/openapi.yaml`
- `../ms-reviews/docs/openapi.yaml`
- `../ms-friends/docs/openapi.yaml`
- `../ms-moderation/docs/openapi.yaml`
- `../ms-notifications/docs/openapi.yaml`
- `../ms-media/docs/openapi.yaml`

Este archivo central, `openapi.yaml`, queda como agregador y fuente compartida de schemas, parametros, responses y security schemes. Eso evita duplicar las mismas definiciones en cada microservicio.

## Servicios cubiertos

- `ms-auth`
- `ms-users`
- `ms-shows`
- `ms-users-library`
- `ms-reviews`
- `ms-friends`
- `ms-moderation`
- `ms-notifications`
- `ms-media`

## Como verla

Puedes abrir el `docs/openapi.yaml` de un microservicio especifico en Swagger Editor, Swagger UI, Redoc o cualquier visor compatible con OpenAPI 3.0.

Si despues quieres servirla desde Express, lo ideal es que cada microservicio monte su propio Swagger UI y apunte a su archivo local:

- `ms-auth`: `http://localhost:3003/api-docs`
- `ms-users`: `http://localhost:3002/api-docs`
- `ms-shows`: `http://localhost:3001/api-docs`
- `ms-users-library`: `http://localhost:3004/api-docs`
- `ms-reviews`: `http://localhost:3005/api-docs`
- `ms-friends`: `http://localhost:3006/api-docs`
- `ms-moderation`: `http://localhost:3007/api-docs`
- `ms-notifications`: `http://localhost:3008/api-docs`
- `ms-media`: `http://localhost:3010/api-docs`

## Notas

- Los endpoints protegidos usan `bearerAuth` con JWT.
- Los uploads usan `multipart/form-data` con el campo `image`.
- El archivo documenta los puertos definidos en `backend/docker-compose.yml`.
