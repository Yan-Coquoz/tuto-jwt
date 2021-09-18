// Ici on simmule le front

const axios = require("axios");
// Base des requêtes
const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

// Stockage du refresh en globale
let refreshToken;

// Avec axios, on va essayé de se login

api //  dans la route login on envoye les identifants de connections.
  .post("/login", {
    email: "rg@tennis.fr",
    password: "MDPmotdepasse",
  })
  .then((response) => {
    // à l'execution on récupere bien l'access token et le refresh token
    console.log("tout est ok ", response.data);
    console.log("Auth success");
    // Dans le header on met le JWT (accessToken) à chaques requetes.
    api.defaults.headers.common[
      "authorization"
    ] = `Bearer ${response.data.accessToken}`;
    refreshToken = response.data.refreshToken;
    // Appel à la route info ('/moi')
    loadUserInfo();
  })
  .catch((error) => {
    console.log("Mon status erreur => ", error.response.status);
  });

function loadUserInfo() {
  console.log("load User Info");
  api
    .get("/moi")
    .then((response) => {
      console.log("response data => ", response.data);
    })
    .catch((error) => {
      console.log("erreur de réccupération du token", error);
      console.log("status ", error.response.status);
    });
}
