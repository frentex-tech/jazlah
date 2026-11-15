# config

Belongs here: the environment schema and the typed config built from it. This is the only place that reads environment variables.

Does not belong: secret values (they never enter the repository; `.env.example` lists names only) and anything with business meaning.
