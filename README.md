# Eventos Cúcuta - Proyecto scaffold

Proyecto de ejemplo: **Plataforma de eventos local** pensada para Cúcuta.
Está diseñada para equipos con nivel de programación básico-intermedio.
La arquitectura sigue principios SOLID (explicado en comentarios en el código).

## Qué contiene
- Backend (Node.js + Express) con separación por capas: controllers, services, repositories, models, routes.
- Repositorio JSON para no requerir base de datos externa (ideal para pruebas locales).
- Frontend simple (HTML + JavaScript) usando Tailwind a través de CDN para evitar build step.
- Endpoints básicos: listar eventos, detalle, crear evento, añadir comentario.
- Sistema simple de reputación para organizadores (agregación de calificaciones).

## Requisitos
- Node.js v14+
- (opcional) nodemon para desarrollo

## Cómo arrancar (local)
1. Descomprime el zip y entra en la carpeta del proyecto.
2. Ejecuta `npm install`.
3. Ejecuta `npm run dev` (requiere nodemon) o `npm start`.
4. Abre: http://localhost:3000

## Notas
- Para producción se recomienda reemplazar el repositorio JSON por una base de datos real (MongoDB, PostgreSQL).
- El proyecto incluye comentarios en el código donde se muestra cómo aplica cada principio SOLID.
- Si quieren que lo prepare con MongoDB Atlas y autenticación, puedo añadirlo más adelante.
