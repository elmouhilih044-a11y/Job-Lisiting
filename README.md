# Brief-1-sprint-2
JobFinder – Application de gestion d’offres d’emploi 

# Contexte du projet

JobFinder est une application web interactive permettant de gérer des offres d’emploi, un profil utilisateur et un système de favoris.
Le HTML et le CSS sont fournis et non modifiables.
Le travail consiste exclusivement à implémenter la logique JavaScript selon les spécifications du brief.

# Objectifs

Validation dynamique des formulaires.

Recherche et filtrage avancés des offres.

Gestion complète des offres (CRUD).

Système de favoris avec persistance locale.

Gestion du profil utilisateur.

Interface fluide, réactive et intuitive.

# Fonctionnalités principales

  1. Validation de formulaires

Vérification du profil (nom, email, compétences).

Validation du formulaire d’offre (titre, entreprise, description).

Feedback en temps réel (erreur ou succès).

  2. Recherche et filtrage

Recherche par mots-clés.

Filtres par compétences, type de contrat et localisation.

Combinaison possible entre recherche et filtres.

  3. Gestion des offres (CRUD)

Ajout, édition et suppression d’offres.

Confirmation avant suppression.


  4. Système de favoris

Ajout/retrait d’offres favorites.

Onglet dédié aux favoris.

Sauvegarde automatique via LocalStorage (bonus).

 5. Gestion du profil utilisateur

Ajout et suppression de compétences.

Gestion des préférences (métier, localisation).

Sauvegarde automatique (bonus).

 # Technologies utilisées

JavaScript (Vanilla JS) — logique et interactions.

HTML5 / CSS3 — structure et mise en page (fournis).

JSON — gestion et chargement des données.

# Structure du projet

📂 projet-jobfinder/
├── 📁 assets/             # Images et ressources
├── 📁 data/               # Données JSON
├── 📁 js/
│   ├── main.js            # Point d'entrée principal
│   ├── formValidation.js  # Validation des formulaires
│   ├── offersManager.js   # CRUD des offres
│   ├── filterSearch.js    # Recherche et filtres
│   ├── favorites.js       # Gestion des favoris
│   └── profile.js         # Gestion du profil utilisateur
├── index.html
├── style.css
└── README.md

# Auteur
 Elmouhili Hajar
