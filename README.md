# Projet-I426-UNESCO
Notre plateforme offrira une expérience interactive unique. Les utilisateurs pourront explorer une carte interactive avec des marqueurs pour chaque site du patrimoine mondial. En cliquant sur chaque marqueur, des informations détaillées sur le site, son histoire et ses particularités seront accessibles.
# Définition de terminé (DOD)
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
node ace get:data # Si vous avez une erreur, essayer de créer le dossier data dans "public/".
```

Préparer la db
```sh
node ace migration:fresh --seed
```

Lancer le site web
```sh
npm run dev
```

# Analyse

## Technologies utilisées
- Adonisjs 6
- Node.JS
- API Unesco
- Git / Github

## Dépendances utilisées
- Vite
- VineJS
- BetterSQLite 3
- i18n
- MapBoxGL
- puppeteer
- API Unesco

## Fonctionnalitée

### Map 2D / 3D
Une carte du monde entier ce trouve au centre de la page principale. Cette carte peut être switcher de 2D à 3D et vice versa.

### Patrimoines
Une liste des patrimoines de l'Unesco se trouve sur la droite de la page principale. Elle contient le nom, le pays et l'image de couverture de chaque patrimoine.

Au clique d'un patrimoine, la vue change pour afficher les détail de l'unesco selectionné. la description apparait ensuite avec l'image en plus grand et de meilleure qualitée. De plus la carte zoom sur le patrimoine selectionné dans la partie du monde correspondante.

Si on appuie sur en savoir une nouvelle page s'ouvre qui affiche tous les détail de l'Unesco concerné. On peut voir le pays dans lequel le patrimoine se trouve, sa date d'inscription, ses critère d'admission à l'Unesco, sa taille, son Numéro de dossier à l'Unesco et sa catégorie. Le patrimoine est aussi marqué sur une miniature de la carte en dessous

### Utilisateurs
Un système de compte permet de s'inscrire, se connecter et voir ses propres statistiques. Il est aussi possible de modifier la photo de profile et le nom de son compte.

### Markers
Il est possible d'activer differents types de marqueurs sur la carte, notamment marquer tout les Unescos sur la carte. Si l'utilisateur est connecté, il peut—depuis la page détail d'un Unesco mentionnée avant—marquer et visiter un site. 

Cette fonction permet d'organiser les sites soit avec les pages dédiées à gauche, sites marqués et visités, ou en changant le type de marqueurs à seulement afficher les patrimoines marqués ou visités sur la carte et dans la liste. 

### Statistiques
La page profil d'un utilisateur contient des statistiques, notamment; la progression globale, la dernière visite, les visites récentes, le pourcentage de site visités par continent, le continent le plus visité, le pays le plus visité et finalement le pourcentage de sites visités au total. Ses statistiques s'affiche seulement si l'utilisateur est connecté.

### Langue
Deux langues sont disponible, le Francais et l'Anglais. Un bouton en bas à gauche permet de changer entre les deux.

### Recherche et filtres
Une barre de recherche se situe en haut à gauche de la page principale. elle permet de chercher et filtrer les patrimoines afficher avec grand détail. Il est possible de filtrer par catégorie donc; culturel, naturel, mixte, Par région donc; Afrique, états Arabes, Asie et le pacifique, Europe, amérique latine, par pays individuel, par continent et finalement par date d'inscription.
