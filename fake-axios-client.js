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
    ] = `Bearer ${response.data.accessToken}`; //! apres Bearer on place des caracteres pour simmuler une erreur de token (test du refresh)
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
      console.log("response data => ", response);
    })
    .catch((error) => {
      console.log("erreur de réccupération du token", error);
      console.log("status ", error.response.status);
    });
}
// Si nous avons un status 401 avec loadUserInfo, c'est que le token n'est plus valide.
// Pour cela on utilise axios.interceptors
api.interceptors.response.use(
  (response) => {
    // on reccupere toutes les réponses
    // ont les laissent passer si elle sont bonnes.
    return response;
  },
  async (error) => {
    // Sinon on affiche le status code et on met en place le refresh
    console.log("l'error.config ", error.config);
    const originalRequest = error.config;
    // On check la bonne url pour evité de bouclé dessus
    // que le status est bien 401
    // et on check si le booleen de _retry est la même requete qui déclanche l'erreur
    if (
      error.config.url != "/refreshToken" &&
      error.response.status === 401 &&
      originalRequest._retry !== true
    ) {
      // si le refresh n'a pas fonctionné
      originalRequest._retry = true;

      if (refreshToken && refreshToken != "") {
        api.defaults.headers.common["authorization"] = `Bearer ${refreshToken}`;
        console.log("ON REFRESH NOTRE TOKEN");
        // on fait l'apelle de la route du refresh
        await api
          .post("/refreshToken")
          .then((response) => {
            console.log("ma reponse du refresh", response.data);

            // On met à jour le header
            api.defaults.headers.common[
              "authorization"
            ] = `Bearer ${response.data.accessToken}`;
            // on re-execute la requete avec les valeurs mises à jour
            originalRequest.headers[
              "authorization"
            ] = `Bearer ${response.data.accessToken}`;
          })
          .catch((error) => {
            console.log("Erreur => ", error.response.status);
            // on defini le refresh token à null
            refreshToken = null;
          });
        // on relance la requete
        return api(originalRequest);
      }
    }
  },
);
