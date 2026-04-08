// Importation du module PostgreSQL pour la connexion à la base de données
import pg from 'pg';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const caCertPath = process.env.AIVEN_PG_CA_CERT_PATH ?? '.ssl/aiven-ca.pem';

const config = {
    user: process.env.AIVEN_PG_USER,
    password: process.env.AIVEN_PG_PASSWORD,
    host: process.env.AIVEN_PG_HOST,
    port: parseInt(process.env.AIVEN_PG_PORT ?? '15099', 10),
    database: process.env.AIVEN_PG_DATABASE ?? 'defaultdb',
    ssl: {
        rejectUnauthorized: true,
        ca: readFileSync(resolve(caCertPath), 'utf-8'),
    },
};

const client = new pg.Client(config);
// Connexion au serveur PostgreSQL avec gestion d'erreur explicite
client.connect(function (err: Error | null) {
    if (err)
        throw err;
    // Exécution de la requête pour récupérer la version
    client.query("SELECT VERSION()", [], function (err: Error | null, result: pg.QueryResult<{ version: string }>) {
        if (err)
            throw err;

        console.log(result.rows[0].version);
        // Fermeture de la connexion après affichage du résultat
        client.end(function (err: Error | null) {
            if (err)
                throw err;
        });
    });
});
