// On crée une liste "mots" contenant tous les mots du fichier "dico.txt"
// Ce fichier provient du dictionnaire Guttemberg trouvable sur github
// On a conservé les mots de 5 lettres

let mots = [];

fetch('dico.txt')
  .then(response => response.text())
  .then(data => {
    mots = data.split('\n')
      .map(mot => mot.trim())
      .filter(mot => mot.length === 5);
    demarrerJeu(); // Start the game only after mots is loaded
  })
  .catch(error => console.error('Erreur de chargement :', error));

// // // // // // // // // 


let motSolution = "";
let tentative = 0;
let essaiActuel = "";
const maxTentatives = 6;


function demarrerJeu() {
  //motSolution = "ESSAI"
  motSolution = mots[Math.floor(Math.random() * mots.length)];
  //console.log("Mot à deviner : " + motSolution);
  tentative = 0;
  essaiActuel = "";

  const grille = document.getElementById("grille");
  const clavier = document.getElementById("clavier");
  const message = document.getElementById("message");
  const rejouer = document.getElementById("rejouer");
  grille.innerHTML = "";
  clavier.innerHTML = "";
  message.textContent = "";
  rejouer.style.display = "none";

  for (let i = 0; i < maxTentatives * 5; i++) {
    const div = document.createElement("div");
    div.className = "case";
    grille.appendChild(div);
  }

  const lettres = "AZERTYUIOPQSDFGHJKLMWXCVBN".split("");
  lettres.forEach(lettre => {
    const btn = document.createElement("button");
    btn.className = "touche";
    btn.textContent = lettre;
    btn.onclick = () => gererLettre(lettre);
    clavier.appendChild(btn);
  });

  const entrer = document.createElement("button");
  entrer.textContent = "⏎";
  entrer.className = "touche";
  entrer.onclick = validerEssai;
  clavier.appendChild(entrer);

  const effacer = document.createElement("button");
  effacer.textContent = "⌫";
  effacer.className = "touche";
  effacer.onclick = () => {
    essaiActuel = essaiActuel.slice(0, -1);
    majGrille();
  };
  clavier.appendChild(effacer);

  document.addEventListener("keydown", gererClavierPhysique);
}

function gererLettre(l) {
  if (essaiActuel.length < 5 && tentative < maxTentatives) {
    essaiActuel += l;
    majGrille();
  }
}

function gererClavierPhysique(e) {
  if (e.key === "Enter") return validerEssai();
  if (e.key === "Backspace") {
    essaiActuel = essaiActuel.slice(0, -1);
    return majGrille();
  }
  const lettre = e.key.toUpperCase();
  if (/^[A-ZÀ-ÿ]$/.test(lettre)) gererLettre(lettre);
}

function majGrille() {
  const debutLigne = tentative * 5;
  for (let i = 0; i < 5; i++) {
    const caseCourante = document.getElementById("grille").children[debutLigne + i];
    caseCourante.textContent = essaiActuel[i] || "";
  }
}

function validerEssai() {
  if (essaiActuel.length !== 5) {
    document.getElementById("message").textContent = "Mot incomplet.";
    return;
  }
  const debutLigne = tentative * 5;
  const compteLettres = {};
  for (const l of motSolution) compteLettres[l] = (compteLettres[l] || 0) + 1;
  const resultat = Array(5).fill("incorrect");

  for (let i = 0; i < 5; i++) {
    if (essaiActuel[i] === motSolution[i]) {
      resultat[i] = "bien-place";
      compteLettres[essaiActuel[i]]--;
    }
  }

  for (let i = 0; i < 5; i++) {
    if (resultat[i] !== "bien-place" && motSolution.includes(essaiActuel[i]) && compteLettres[essaiActuel[i]] > 0) {
      resultat[i] = "mal-place";
      compteLettres[essaiActuel[i]]--;
    }
  }

  const grille = document.getElementById("grille");
  const clavier = document.getElementById("clavier");

  for (let i = 0; i < 5; i++) {
    const cellule = grille.children[debutLigne + i];
    setTimeout(() => {
      cellule.classList.add("retournement");
      setTimeout(() => {
        cellule.classList.add(resultat[i]);
        const bouton = [...clavier.children].find(k => k.textContent === essaiActuel[i]);
        if (bouton) bouton.classList.add("utilise-" + resultat[i]);
      }, 300);
    }, i * 300);
  }

  if (essaiActuel === motSolution) {
    document.getElementById("message").textContent = "🎉 Bravo !";
    document.getElementById("rejouer").style.display = "inline-block";
    document.removeEventListener("keydown", gererClavierPhysique);
    return;
  }

  tentative++;
  essaiActuel = "";
  if (tentative === maxTentatives) {
    document.getElementById("message").textContent = "😢 Mot : " + motSolution;
    document.getElementById("rejouer").style.display = "inline-block";
    document.removeEventListener("keydown", gererClavierPhysique);
  }
}

demarrerJeu();// demarrerJeu(); // Now called after mots is loaded