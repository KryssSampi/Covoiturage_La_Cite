## Protection des données personnelles  

Cette section décrit les principes de gestion des données personnelles utilisés dans l'application conformément au GDPR et aux réglementations locales.  

### Données collectées  
Les données suivantes sont collectées lors de l'utilisation de l'application :  
- Identifiants utilisateur (inscriptions via `AuthService`)  
- Métadonnées de session (`MediaLogRepository` pour les connexions)  
- Historique des questions fréquentes (via model `FaqItem`)  

### Stockage et transfert  
- Les données sont stockées sur des serveurs situés dans l'Union Européenne (via MongoDB dans `Server_Core/Data/MongoDB`).  
- Les transferts externes sont chiffrés via TLS 1.3 (implémenté dans le service `API Controller`).  

### Durée de conservation  
- Les données sont conservées pendant la durée nécessaire au bon fonctionnement du service ou jusqu'à ce que l'utilisateur demande leur suppression ([RGPD Art. 5(1)(e)]).  

### Accès et consentement  
- Les utilisateurs peuvent accéder, modifier ou supprimer leurs données via le formulaire de 'Confidentialité' (page web `{confidentialite}`).  
- Le consentement est enregistré dans la propriété `IsActive` du model `FaqItem`.