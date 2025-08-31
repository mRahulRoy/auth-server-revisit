docker run --rm --name mernpg-container -e POSTGRES_USER=root -e POSTGRES_PASSWORD=root -v mernpgdata:/var/lib/postgresql/data -p 5432:5432 -d postgres

npm run migration:generate -- src/migration/migration -d src/config/data-source.ts  // generate migration


npm run migration:run -- -d src/config/data-source.ts