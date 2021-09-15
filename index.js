require("dotenv").config();
const JWT = require("jsonwebtoken");
const express = require("express");
const { urlencoded } = require("express");
const app = express();

/**
 * Express va recupérer du Json
 * urlencoded pour la bonne gestion des accents
 */
app.use(express.json());
app.use(urlencoded({ extended: true }));

// creation d'un user pour l'authentification,
/**
 * On créé le compte et l'inserer dans une Bdd
 * Ensuite on va le chercher et on lui créé le token
 */

const user = {
  id: 5,
  firstname: "Roland",
  lastname: "Garros",
  age: 32,
  email: "rg@tennis.fr",
  admin: true,
};

/**
 * Création de la fonction pour l'acces des droits
 * prend un user en parametre
 */

function tokenAccess(user) {
  // donne un token à l'utilisateur, la clé secrete, et la duré d'expiration en secondes (1800 s = 30 min)
  return JWT.sign(user, process.env.JWT_SECRET, { expiresIn: "1800" });
}
// on stock la valeur du token
const accessToken = tokenAccess(user);
// Ce token contient toutes les infos de l'objet user
console.log("Le token crypté : ", accessToken);
