using System.Security.Cryptography;
using Microsoft.IdentityModel.Tokens;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Auth;

public static class JwtRsaKeyStore
{
    private static readonly object Sync = new();
    private static bool _initialized;
    private static RsaSecurityKey? _privateKey;
    private static RsaSecurityKey? _publicKey;
    private static string? _publicPem;

    public static RsaSecurityKey GetPrivateKey()
    {
        EnsureInitialized();
        return _privateKey!;
    }

    public static RsaSecurityKey GetPublicKey()
    {
        EnsureInitialized();
        return _publicKey!;
    }

    public static string GetPublicKeyPem()
    {
        EnsureInitialized();
        return _publicPem!;
    }

    private static void EnsureInitialized()
    {
        if (_initialized) return;

        lock (Sync)
        {
            if (_initialized) return;

            var certDir = Path.Combine(AppContext.BaseDirectory, "certs");
            var privateKeyPath = Path.Combine(certDir, "jwt_private.pem");
            var publicKeyPath = Path.Combine(certDir, "jwt_public.pem");

            Directory.CreateDirectory(certDir);

            RSA privateRsa;
            RSA publicRsa;

            if (File.Exists(privateKeyPath))
            {
                privateRsa = RSA.Create();
                privateRsa.ImportFromPem(File.ReadAllText(privateKeyPath));

                if (File.Exists(publicKeyPath))
                {
                    publicRsa = RSA.Create();
                    publicRsa.ImportFromPem(File.ReadAllText(publicKeyPath));
                }
                else
                {
                    publicRsa = RSA.Create();
                    publicRsa.ImportFromPem(privateRsa.ExportRSAPublicKeyPem());
                    File.WriteAllText(publicKeyPath, privateRsa.ExportRSAPublicKeyPem());
                }
            }
            else
            {
                privateRsa = RSA.Create(2048);
                var privatePem = privateRsa.ExportRSAPrivateKeyPem();
                var publicPem = privateRsa.ExportRSAPublicKeyPem();

                File.WriteAllText(privateKeyPath, privatePem);
                File.WriteAllText(publicKeyPath, publicPem);

                publicRsa = RSA.Create();
                publicRsa.ImportFromPem(publicPem);
            }

            _privateKey = new RsaSecurityKey(privateRsa);
            _publicKey = new RsaSecurityKey(publicRsa);
            _publicPem = File.ReadAllText(publicKeyPath);
            _initialized = true;
        }
    }
}
