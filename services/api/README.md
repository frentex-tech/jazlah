# Jazlah — API

NestJS on PostgreSQL + PostGIS, with Redis (cache and queues), WebSockets (realtime orders and chat), Firebase FCM (push) and S3-compatible storage.
Integrations sit behind adapters: payment gateway, SMS, delivery company, ZATCA, BNPL.
All time logic (cutoffs, capacity) runs server-side in `Asia/Riyadh`. Commit scope: `api`.
