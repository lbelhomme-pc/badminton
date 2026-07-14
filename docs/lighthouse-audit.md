# Audit Lighthouse

Ce projet fournit un audit Lighthouse reproductible pour les pages publiques principales du CFVV.

## Pages auditées

- `/`
- `/creneaux`
- `/tarifs`
- `/contact`
- `/connexion`

## Lancer l'audit

Depuis le dossier du projet :

```powershell
npm run build
npm run start
```

Dans un autre terminal :

```powershell
npm run audit:lighthouse
```

Le script utilise par défaut `http://127.0.0.1:3000` et génère des rapports JSON dans `reports/lighthouse/`.
Ce dossier est ignor? par Git.

## Variables utiles

Auditer le site en ligne :

```powershell
$env:LIGHTHOUSE_BASE_URL="https://badminton-orcin.vercel.app"
npm run audit:lighthouse
```

Limiter les pages :

```powershell
$env:LIGHTHOUSE_PAGES="/,/contact"
npm run audit:lighthouse
```

Changer le paquet Lighthouse utilisé par `npx` :

```powershell
$env:LIGHTHOUSE_PACKAGE="lighthouse@12.6.1"
npm run audit:lighthouse
```

## Notes

- Lighthouse n'est pas ajout? aux dépendances du projet pour ne pas alourdir l'installation.
- Si `node_modules/.bin/lighthouse` existe, le script l'utilise.
- Sinon, le script utilise `npx --yes lighthouse@12.6.1`.
- Sous Windows avec Node 24, le script ajoute automatiquement `--use-system-ca` pour que `npx` utilise les certificats du système.
- Si Chrome/Lighthouse laisse un dossier temporaire verrouill? sur Windows, le script conserve le rapport JSON valide et continue l'audit.
- L'audit ne bloque pas `npm run build`, car les seuils de performance/accessibilité/SEO ne sont pas encore décidés.
