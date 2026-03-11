// Importation du module PostgreSQL pour la connexion à la base de données
import pg from 'pg';

const config = {
    user: "avnadmin",
    password: "AVNS_5zaAhNTniiqcp-TNb6-",
    host: "pg-26d8eb52-covoituragelacitev1.f.aivencloud.com",
    port: 15099,
    database: "defaultdb",
    ssl: {
        rejectUnauthorized: true,
        ca: `-----BEGIN CERTIFICATE-----
MIIERDCCAqygAwIBAgIUZqxGPi52aMBPgac0EOmUTlgeTg8wDQYJKoZIhvcNAQEM
BQAwOjE4MDYGA1UEAwwvNTdhMmY5MTctYzA4NC00NWJjLWE5ZTctN2Q0OGU4YTI5
YTcwIFByb2plY3QgQ0EwHhcNMjYwMjAzMjM1ODU3WhcNMzYwMjAxMjM1ODU3WjA6
MTgwNgYDVQQDDC81N2EyZjkxNy1jMDg0LTQ1YmMtYTllNy03ZDQ4ZThhMjlhNzAg
UHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAN1G7oAw
yVaulhwOZnHjkGK39V3IR4Qs/Z1Xhe7tKY5wXJETBPreGly0klIITdhajy6Zgs6u
U4VaKiDpK745mrTjTYU3HUBkoEs3vMbKoed/kqsb02lcx6T4eAMNAwPzSuF8nP7m
dEhN0mUBGX4W0PbHNqK3Fp/fIjPLjS+txhrIa9TB0nS9dOD8Z5xbCYknbHI1D4Gw
dqC1gkGAjB1q8VlT3I5Q4mNROSli/Kurha0BfkkNcQTjZYcDxyKprLXfxoYb0BWP
/EInp9H/9L+2GBCeIilWz8xHS/g3R9baN7ht2HtHGVpMoUCo0ESWPsSprSoLkWct
Ge9n5GjbNHhgPZ/pZBEI1fTsQKp8A3IcZY1oc+adKTLCbB4a0l92vt1W+fMiIzCS
odm0NSWNHj7a5gIy/ZOgDy8o0uZxR+L21n+k6oLd0Y63Wk7+vUIkBsxNvXqBkwAS
VSWn5W9UzUt4uQFFE13iVQvG06ybk/xNO7uISzNFT9tvf+lQdYp+Yhqo+QIDAQAB
o0IwQDAdBgNVHQ4EFgQU0s8pXD4IxlGvHUaxbF+N4+eiEPMwEgYDVR0TAQH/BAgw
BgEB/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBAK5iR+SRmuCu
tEeS9KXmf7h0yzLWr6sDS9pLJJcDIQRjWoxVBUY0dlpIQkxKzyeXHRViwAD0il7V
ai9wy1KtNGSeCI09REN6MlcqoXi6YFe7YaeK90VpOVDw/j+Z6135iBm3C8g03uzL
q0c7HPna3It55gGvpsJdYEqj+WyBuJYgT4WV2geqT06W2WLaazMXRLSspiaFyPS7
0sffBCsAFvr4Cfe7moyCGi4de5NToN/O2JzatLn29pX+5eqJauLI6TJvkwKj8KZl
AFRVnSQKTFsE+GOrog4+PGweZLGBO6mVYVkkU+EQ5j074SQG/c7VX6yKeFgkeIdv
NOdCiFoGqoVjW/2JswWQdsHUMjwW1ISZr60pGW3+TDuLNxX7bQVySp8ijs14hx+8
bwcJnQYkn9LdgTRbgGR+XqvmXaklaCJ4MlQSQ5wQHTYLFp0LtUfKX9Se6JwT5WC6
WQ0/HA7XOH8SFbEyeQslXVYVK0loN7doASC5/HRwRYwSiBiIG+Yn+w==
-----END CERTIFICATE-----`,
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