# modules

Belongs here: business domains, one folder each, created when its step comes. orders, checkout, payments, refunds, wallet and finance use four layers (`api/`, `application/`, `domain/`, `infrastructure/`); every other module starts as controllers + service + dto.

Does not belong: infrastructure (health, database, queues), calls to a vendor that bypass an integration, and imports of another module's internals.
