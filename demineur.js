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

function attendreClic(){
  // Fonction qui retourne les coordonnées d'un clic de souris de l'utilisateur
  // la lecture est faite au moment d'appuyer sur la souris.
  var position = {x : 0, y : 0};
  while(getMouse().down){
    pause(0.01);
  }
  while(!getMouse().down){
    pause(0.01);
  }
  position.x = Math.floor(getMouse().x/16);
  position.y = Math.floor(getMouse().y/16);
  return position;
}

function initialiserEcran(largeur, hauteur){
  // Imprime une image vide pour chaque coordonnée du tableau de jeu.
  for(var i = 0; i < largeur; i++){
    for(var j = 0; j < hauteur; j++){
      afficherImage(i*16, j*16, colormap, images[11]);
    }
  }
}

function initialiserGrilleJeu(grilleMines){
  // Fonction qui crée une nouvelle grille de jeu de la largeur et hauteur de
  // la grille de mines. Pour chaque index de la grille:
  // estDevoilee exprime si la tuile a été dévoilée ou non (false au début)
  // estUneMine exprime si la tuile est une mine selon la grille de mine
  var grilleJeu = Array(grilleMines.length);

  for(var i = 0; i < grilleJeu.length; i++){
    grilleJeu[i] = Array(grilleMines[i].length);

    for(var j = 0; j < grilleJeu[i].length; j++){
      grilleJeu[i][j] = {estDevoilee: false, estUneMine: grilleMines[i][j]};
    }
  }

  return grilleJeu;
}

function miseAJourTuile(tuile, grilleJeu){
  // Procédure qui met à jour l'affichage d'une tuile après la lecture d'un clic
  if(!grilleJeu[tuile.y][tuile.x].estDevoilee){
    if(grilleJeu[tuile.y][tuile.x].estUneMine){
      return;
    } else {
      var nbMines = calculerMine(tuile, grilleJeu);
      afficherImage(tuile.x*16, tuile.y*16, colormap, images[nbMines]);
    }
    grilleJeu[tuile.y][tuile.x].estDevoilee = true;
    if(nbMines == 0){
      etendreTuile(tuile, grilleJeu);
    }
  }
}

function etendreTuile(tuile, grilleJeu){
  for(var i = tuile.y - 1; i <= tuile.y + 1; i++){
    if(i < 0 || i >= grilleJeu.length){
      continue;
    }

    for(var j = tuile.x - 1; j <= tuile.x + 1; j++){
      if(j < 0 || j >= grilleJeu[i].length){
        continue;
      }
      var nouvelleTuile = {x: j, y: i};
      miseAJourTuile(nouvelleTuile, grilleJeu);
    }
  }
}

function calculerMine (tuile, grilleJeu){
  var nbMines = 0;
  for(var i = tuile.y - 1; i <= tuile.y + 1; i++){
    if(i < 0 || i >= grilleJeu.length){
      continue;
    }

    for(var j = tuile.x - 1; j <= tuile.x + 1; j++){
      if(j < 0 || j >= grilleJeu[i].length){
        continue;
      }

      if(grilleJeu[i][j].estUneMine){
        nbMines += 1;
      }
    }
  }
  return nbMines;
}

function calculerNBCasesNonDevoilees(grilleJeu){
  var nbCasesNonDevoilees = 0;
  for(var i = 0; i < grilleJeu.length; i++){
    for(var j = 0; j < grilleJeu[i].length; j++){
      if(!grilleJeu[i][j].estDevoilee){
        nbCasesNonDevoilees += 1;
      }
    }
  }
  return nbCasesNonDevoilees;
}

function verifierVictoire(tuile, grilleJeu, nbMines){
  // Fonction qui vérifie si les conditions de défaite et de victoire
  // retourne false si une des condition est rencontrée et true sinon.
  if(grilleJeu[tuile.y][tuile.x].estUneMine){
    finDeJeu(false, tuile, grilleJeu);
    return false;
  } else if(calculerNBCasesNonDevoilees(grilleJeu) == nbMines){
      finDeJeu(true, tuile, grilleJeu);
      return false;
  } else {
    return true;
  }
}

function finDeJeu(playerWon, tuile, grilleJeu){
  // Procédure qui gère la fin de la partie en fonction de si le joueur
  // a gagné ou perdu.
  for(var i = 0; i < grilleJeu.length; i++){
    for(var j = 0; j < grilleJeu[i].length; j++){
      if(grilleJeu[i][j].estUneMine){
        afficherImage(j*16, i*16, colormap, images[9]);
      }
    }
  }

  if(playerWon){
    alert("Félicitations, vous avez gagné! :)");
  }else{
    afficherImage(tuile.x*16, tuile.y*16, colormap, images[10]);
    alert("Désolé, vous avez perdu. :(");
  }
}

function nouvellePartie(largeur, hauteur, nbMines){
  // Procedure qui initialise la partie.
  setScreenMode(largeur*16, hauteur*16);
  initialiserEcran(largeur, hauteur);
  var premiereTuile = attendreClic();
  var grilleMines = placerMines(largeur, hauteur, nbMines, premiereTuile.x, premiereTuile.y);
  var grilleJeu = initialiserGrilleJeu(grilleMines);
  miseAJourTuile(premiereTuile, grilleJeu);
  return grilleJeu;
}

function demineur(largeur, hauteur, nbMines){
  // Procedure executant la boucle principale du programme.
  var grilleJeu = nouvellePartie(largeur, hauteur, nbMines);
  do {
    var tuileCliquee = attendreClic();
    miseAJourTuile(tuileCliquee, grilleJeu);
  } while(verifierVictoire(tuileCliquee, grilleJeu, nbMines));
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
