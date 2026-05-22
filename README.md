# Projet-I426-UNESCO
Notre plateforme offrira une expérience interactive unique. Les utilisateurs pourront explorer une carte interactive avec des marqueurs pour chaque site du patrimoine mondial. En cliquant sur chaque marqueur, des informations détaillées sur le site, son histoire et ses particularités seront accessibles.
# Définition de terminé
Tiré des propositions de DOD de Kleer
10. Les standards de code sont respectés
16. La documentation correspondante a été écrite ou actualisée
18. Les radiateurs d’information correspondants ont été actualisés
20. L’information nécessaire a été communiquée au reste de l’ équipe

# Installation

Cloner le Repo
```sh
git clone https://github.com/Projet-I426-UNESCO/Projet-I426-UNESCO

cd Projet-I426-UNESCO
```

Installer les modules
```sh
npm install
```

Crée le .env
```sh
cp .env.example .env
```

Générer une clef pour l'application
```sh
node ace generate:key
```

Recevoir les données de l'Unesco
```sh
node ace get:data
```

Préparer la db
```sh
node ace migration:fresh --seed
```

Lancer le site web
```sh
npm run dev
```