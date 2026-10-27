#!/bin/sh
set -e

# Apply pending migrations, load the idempotent seed, then start the API.
node node_modules/typeorm/cli.js migration:run -d dist/config/data-source.js
node dist/database/seeds/seed.js
exec node dist/main
