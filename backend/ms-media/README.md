# ms-media

Microservicio gRPC para subir y consultar archivos de media de ReelTrack.

## Responsabilidades

- Subir una foto de perfil por usuario (`auth_id`).
- Subir una sola imagen por reseña (`review_id`).
- Subir una sola imagen por comentario (`comment_id`).
- Reemplazar la imagen anterior cuando se sube una nueva para el mismo usuario, reseña o comentario.
- Servir los archivos subidos por HTTP en `/media`.

## Puertos

- gRPC: `50051`
- HTTP estatico: `3010`

## Variables

```env
GRPC_HOST=0.0.0.0
GRPC_PORT=50051
HTTP_PORT=3010
UPLOAD_DIR=/app/uploads
PUBLIC_BASE_URL=http://localhost:3010/media
MAX_FILE_SIZE_BYTES=5242880
```

## Contrato

El contrato gRPC vive en `proto/media.proto`.

Los metodos principales son:

- `UploadProfilePhoto`
- `UploadReviewImage`
- `UploadCommentImage`
- `GetProfilePhoto`
- `GetReviewImage`
- `GetCommentImage`
- `DeleteProfilePhoto`
- `DeleteReviewImage`
- `DeleteCommentImage`
