# integrations

Belongs here: external services behind ports, one folder per capability, created when its step comes: mail, sms, push, payments, storage, delivery, zatca, bnpl. Each has a port, types, errors, service, module, `index.ts`, and `providers/` with one file per vendor plus a fake.

Does not belong: any import from `modules/`, and business rules. Other code imports an integration only through its `index.ts`.
