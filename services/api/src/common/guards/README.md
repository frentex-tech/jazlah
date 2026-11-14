# common/guards

Belongs here: guards with no business meaning (authentication, roles, permissions).

Does not belong: a guard that needs the database or a module's service. Put it with the module or infra code it serves, or have it depend on an interface declared in `common/` and implemented elsewhere.
