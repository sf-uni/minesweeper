/*
Date: 05 novembre 2018

Auteurs:
- Frenette, Shanie
- Lamarre, Francis

Version simplifié du populaire jeu de démineur programmé en Javascript pour
l'environnement CodeBoot.
*/

load("images.js");

function afficherImage(x, y, colormap, image){
  // Procedure qui imprime à l'écran une image à la coordonnée (x, y)
  // en utilisant le colormap spécifié en entrée.
  for (var i = 0; i < image.length; i++){
    for(var j = 0; j < image[i].length; j++){
      var pixelX = x + j;
      var pixelY = y + i;
      var pixelColor = colormap[image[i][j]];
      setPixel(pixelX, pixelY, pixelColor);
    }
  }
}

// -------------------------------------------------------------------------- //
//CODE À REVOIR
function tuileAleatoire(grille){
  // Fonction qui renvoit une tuile aléatoire qui n'a pas déjà été utilisée
  // dans la grille de jeu.
  do{
    var tuile = {x: 0, y:0};
    tuile.y = Math.floor(Math.random() * grille.length);
    tuile.x = Math.floor(Math.random() * grille[tuile.y].length);
  } while(grille[tuile.y][tuile.x] != null);

  return tuile;
}

function placerMines(largeur, hauteur, nbMines, x, y){
  // Fonction qui retourne une grille aléatoire de booléen corespondant à la
  // présence d'une mine pour chaque pair ordonnée (hauteur, largeur).
  var grille = Array(hauteur);

  for(var i = 0; i < grille.length; i++){
    grille[i] = Array(largeur);
  }

  grille[y][x] = false;

  for(var i = 0; i < nbMines; i++){
    var tuile = tuileAleatoire(grille);
    grille[tuile.y][tuile.x] = true;
  }

  for(var i = 0; i < grille.length; i++){
    for(var j = 0; j < grille[i].length; j++){
      if(grille[i][j] == null){
        grille[i][j] = false;
      }
    }
  }

  return grille;
}
//CODE À REVOIR
// -------------------------------------------------------------------------- //

function attendreClic(){
  // Fonction qui retourne les coordonnées de la tuile cliquée par l'utilisateur
  // la lecture est faite au moment d'appuyer sur la souris.
  var position = {x : 0, y : 0}; // Initialisation d'un enregistrement position
  // Attendre que le bouton de la souris soit relâché
  while(getMouse().down){
    pause(0.01);
  }
  // Attendre que le bouton de la souris soit appuyé
  while(!getMouse().down){
    pause(0.01);
  }
  // Conversion des coordonnés en pixels vers les coordonnées de tuiles
  position.x = Math.floor(getMouse().x/16);
  position.y = Math.floor(getMouse().y/16);
  return position;
}

function initialiserEcran(largeur, hauteur){
  // Imprime une tuile non-dévoilée pour chaque coordonnée du tableau de jeu.
  for(var i = 0; i < largeur; i++){
    for(var j = 0; j < hauteur; j++){
      afficherImage(i*16, j*16, colormap, images[11]);
    }
  }
}

function initialiserGrilleJeu(grilleMines){
  // Fonction qui crée une nouvelle grille de jeu de la largeur et hauteur de
  // la grille de mines. Pour chaque index represente une tuile de la grille:
  // estDevoilee exprime si la tuile a été dévoilée (true si oui)
  // estUneMine exprime si la tuile est une mine (true si oui)

  // Initialisation de la grille de jeu de même dimensions que la grille mines
  var grilleJeu = Array(grilleMines.length);

  for(var i = 0; i < grilleJeu.length; i++){
    grilleJeu[i] = Array(grilleMines[i].length);

    for(var j = 0; j < grilleJeu[i].length; j++){
      // Initialisation des éléments de chaque tuile
      grilleJeu[i][j] = {estDevoilee: false, estUneMine: grilleMines[i][j]};
    }
  }

  return grilleJeu;
}

function devoilerTuile(tuile, grilleJeu){
  // Procédure qui dévoile la tuile cliquée par le joueur

  // Si la tuile contient une mine,
  // elle sera dévoilée par la condition de défaite
  if(grilleJeu[tuile.y][tuile.x].estUneMine){
    return;
  }

  // Calculer le nombre de mines autour de la tuile et la dévoiler
  var nbMines = calculerMines(tuile, grilleJeu);
  afficherImage(tuile.x*16, tuile.y*16, colormap, images[nbMines]);
  grilleJeu[tuile.y][tuile.x].estDevoilee = true;

  // Si la tuile n'est adjacente à aucune mine,
  // dévoiler les tuiles adjacentes
  if(nbMines == 0){
    etendreTuile(tuile, grilleJeu);
  }
}

function etendreTuile(tuile, grilleJeu){
  // Procédure qui dévoile les tuiles autour d'une tuile désirée

  // Boucle de la rangé au dessus de la tuile à celle d'en dessous
  for(var i = tuile.y - 1; i <= tuile.y + 1; i++){

    // Si la rangé à vérifier est à l'extérieur de la grille de jeu
    if(i < 0 || i >= grilleJeu.length){
      continue;
    }

    // Boucle de la colonne à gauche de la tuile à celle à droite
    for(var j = tuile.x - 1; j <= tuile.x + 1; j++){

      // Si la colonne à vérifier est à l'extérieur de la grille de jeu
      if(j < 0 || j >= grilleJeu[i].length){
        continue;
      }

      // Dévoiler la tuile
      var nouvelleTuile = {x: j, y: i};
      var nbMines = calculerMines(nouvelleTuile, grilleJeu);
      afficherImage(j*16, i*16, colormap, images[nbMines]);
      grilleJeu[i][j].estDevoilee = true;
    }
  }
}

function calculerMines (tuile, grilleJeu){
  // Fonction retournant le nombres de mines dans les tuiles adjacentes
  // en considérant que la tuile n'est pas elle-même une mine

  var nbMines = 0; // Accumulateur de mines

  // Boucle de la rangé au dessus de la tuile à celle d'en dessous
  for(var i = tuile.y - 1; i <= tuile.y + 1; i++){

    // Si la rangé à vérifier est à l'extérieur de la grille de jeu
    if(i < 0 || i >= grilleJeu.length){
      continue;
    }

    // Boucle de la colonne à gauche de la tuile à celle à droite
    for(var j = tuile.x - 1; j <= tuile.x + 1; j++){

      // Si la colonne à vérifier est à l'extérieur de la grille de jeu
      if(j < 0 || j >= grilleJeu[i].length){
        continue;
      }

      // Si la tuile vérifiée est une mine
      if(grilleJeu[i][j].estUneMine){
        nbMines += 1;
      }
    }
  }

  return nbMines;
}

function calculerNBTuilesNonDevoilees(grilleJeu){
  // Fonction retournant le nombre de tuiles non dévoilées dans la grille de jeu

  var nbTuilesNonDevoilees = 0; // Accumulateur de tuiles

  // Pour chaque tuile de la grille de jeu
  for(var i = 0; i < grilleJeu.length; i++){
    for(var j = 0; j < grilleJeu[i].length; j++){

      // Si la tuile n'est pas dévoilée
      if(!grilleJeu[i][j].estDevoilee){
        nbTuilesNonDevoilees += 1;
      }

    }
  }

  return nbTuilesNonDevoilees;
}

function verifierEtatPartie(tuile, grilleJeu, nbMines){
  // Fonction qui vérifie si les conditions de défaite et de victoire
  // Retourne true si une des conditions est rencontrée et false sinon

  // Le joueur a cliqué sur une mine?
  if(grilleJeu[tuile.y][tuile.x].estUneMine){
    finDeJeu(false, tuile, grilleJeu);
    return true;
  }
  // Le joueur a dévoilé toutes les tuiles qui ne sont pas des mines?
  else if(calculerNBTuilesNonDevoilees(grilleJeu) == nbMines){
      finDeJeu(true, tuile, grilleJeu);
      return true;
  }
  // Sinon, le jeu continue
  else {
    return false;
  }
}

function devoilerMines(grilleJeu){
  // Procédure qui dévoile et affiche toutes les mines de la grille de jeu

  // Pour chaque tuile de la grille de jeu
  for(var i = 0; i < grilleJeu.length; i++){
    for(var j = 0; j < grilleJeu[i].length; j++){

      // Si la tuile est une mine
      if(grilleJeu[i][j].estUneMine){
        afficherImage(j*16, i*16, colormap, images[9]);
      }

    }
  }
}

function finDeJeu(playerWon, tuile, grilleJeu){
  // Procédure qui gère la fin de la partie en fonction de si le joueur
  // a gagné ou perdu et de la dernière tuile cliquée

  devoilerMines(grilleJeu); // Dévoile toutes les mines du jeu

  // Féliciter le joueur s'il a gagné
  if(playerWon){
    alert("Félicitations, vous avez gagné! :)");
  }
  // Sinon, afficher la mine qu'il a cliquée en rouge et consoler le joueur
  else{
    afficherImage(tuile.x*16, tuile.y*16, colormap, images[10]);
    alert("Désolé, vous avez perdu. :(");
  }
}

function nouvellePartie(largeur, hauteur, nbMines){
  // Fonction qui initialise la partie et retourne une nouvelle grille de jeu

  // Initialiser l'écran de jeu avec les dimensions des tuiles
  setScreenMode(largeur*16, hauteur*16);

  // Afficher des tuiles non-dévoilées pour chaque tuile
  initialiserEcran(largeur, hauteur);

  // Initialisation de la grille de mines en fonction
  // de la première tuile cliquée par le joueur
  var premiereTuile = attendreClic();
  var grilleMines = placerMines(largeur, hauteur, nbMines, premiereTuile.x, premiereTuile.y);

  // Initialisation de la grille de jeu
  var grilleJeu = initialiserGrilleJeu(grilleMines);

  // Dévoiler la première tuile cliquée
  devoilerTuile(premiereTuile, grilleJeu);

  return grilleJeu;
}

function demineur(largeur, hauteur, nbMines){
  // Procedure executant la boucle principale du programme.

  // Initialisation de la partie
  var grilleJeu = nouvellePartie(largeur, hauteur, nbMines);

  // Répéter tant que la partie est en cours
  do {
    // Attendre que le joueur clique une tuile
    var tuileCliquee = attendreClic();

    // Dévoiler la tuile
    devoilerTuile(tuileCliquee, grilleJeu);

    // Vérifier que la partie est en cours
  } while(!verifierEtatPartie(tuileCliquee, grilleJeu, nbMines));
}

function testDemineur(){
  // Procedure verifiant la bonne execution des fonctions importantes du
  // programme avec des tests unitaire arbitraire.

  // Tests pour afficherImage()

  // Tests pour placerMines()
  var largeur = 5;
  var hauteur = 7;
  var nbMines = 6;
  var x = 2;
  var y = 1;

  // Est-ce que la grille a les bonnes dimmensions?
  assert( placerMines(largeur, hauteur, nbMines, x, y).length == hauteur );
  assert( placerMines(largeur, hauteur, nbMines, x, y)[0].length == largeur );

  // Est-ce que la premiere tuile ne contient pas de mine?
  assert( placerMines(largeur, hauteur, nbMines, x, y)[y][x] == false );
}
testDemineur();
demineur(10, 10, 7);
