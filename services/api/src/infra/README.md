# infra

Belongs here: infrastructure we run ourselves, one subfolder each, created when its step comes: health (exists), database, jobs (queue registration and connection only), realtime (gateway, room conventions, publishing port), the event bus, redis, logger (exists).

Does not belong: any import from `modules/`, and anything that runs business logic. A job processor or an event subscriber lives in the module that owns the logic.
