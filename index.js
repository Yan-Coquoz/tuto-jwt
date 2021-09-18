require("dotenv").config();
const JWT = require("jsonwebtoken");
const express = require("express");
const { urlencoded } = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

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
  gender: "Hobbit",
  admin: true,
};

/**
 * Création de la fonction pour l'acces des droits
 * prend un user en parametre
 */

function tokenAccess(user) {
  // donne un token à l'utilisateur, la clé secrete, et la duré d'expiration en secondes (1800 s = 30 min)
  return JWT.sign(user, process.env.JWT_SECRET, { expiresIn: "1800s" }); //! attention ne pas oublier la valeur du temps(s)
}
// le refresh token au cas
function tokenRefreshAccess(user) {
  return JWT.sign(user, process.env.JWT_REFRESH, { expiresIn: "1y" });
}
// // on stock la valeur du token
// const accessToken = tokenAccess(user);
// // Ce token contient toutes les infos de l'objet user
// console.log("Le token crypté : ", accessToken);

// Les routes à tester avec insomnia ou autre
// ne pas oublieer de renseigner le body en json pour l'acceptation des données

app.post("/api/login", (req, res) => {
  // On check la recuperation des données
  if (req.body.email !== user.email) {
    res.status(401).send("invalid credentials");
    // on return pour stoppé le proccess
    return;
  }
  if (req.body.password !== "MDPmotdepasse") {
    // 401 unauthorized (non autorisé)
    res.status(401).send("invalid credentials");
    // on return pour stoppé le proccess
    return;
  }
  // si c'est bon on génère l'accessToken
  const accessToken = tokenAccess(user);
  const refreshToken = tokenRefreshAccess(user);
  res.status(200).send({
    // on génére un accessToken et un refreshToken
    accessToken,
    refreshToken,
  });
});

// route pour le refresh
app.post("/api/refreshToken", (req, res) => {
  // on reccupere le token comme dans le middleware
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  // on utilise le refresh
  JWT.verify(token, process.env.JWT_REFRESH, (err, datas) => {
    if (err) {
      console.log("datas 87 => ", datas);
      return res.status(401).json({ message: err });
    }
    // TODO on check en BDD si le user à toujours les droits et qu'il existe toujours
    // lors de la regeneration on supprime les veilles valeurs de creation et d'expiration du token
    delete user.iat;
    delete user.exp;
    // on crée un nouveau token refresh
    const refreshedToken = tokenAccess(user);
    res.send({
      accessToken: refreshedToken,
    });
  });
});
//* authentification des routes, voir si les routes avec jwt est correct.
// creation d'un middleware
function authentiKToken(req, res, next) {
  // recupération de l'autorisation depuis le header
  const authHeader = req.headers["authorization"];
  // on check si il n'est pas null et on recuppere la seconde valeur de la chaine de caractere
  // du client => header => "bearer  leToken"  <= Convention de nommage
  // on coupe la chaine en 2 au niveau de l'espace et on prend la valeur à l'indice 1
  const token = authHeader && authHeader.split(" ")[1];

  // on check si le token correspond
  if (!token) {
    return res.sendStatus(401);
  }
  console.log("token 82 => ", token);

  JWT.verify(token, process.env.JWT_SECRET, (err, datas) => {
    if (err) {
      console.log("datas 86 => ", datas);
      return res.status(401).json({ message: err });
    }
    console.log("datas 89 => ", datas);
    // nos routes auront la data du user, chaque route aura les données décodé du user!
    req.user = datas;
    next();
  });
}
// utilisation d'une route pour utiliser le middleware.
app.get("/api/moi", authentiKToken, (req, res) => {
  console.log(req.user);
  // on affiche le user
  res.send(req.user);
});

app.listen(PORT, () => {
  console.log(`Listenning on port ${PORT}`);
});
