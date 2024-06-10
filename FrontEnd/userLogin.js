// ! --------- Variables ---------
const loginErrEle = document.querySelector(".login_error");
const loginForm = document.getElementById("login-form");
const loginFormInputs = document.querySelectorAll("#login-form input");
const apiUserLoginUrl = "http://localhost:5678/api/users/login";

// ! --------- Effacer le message d'erreur au Input -----------
loginFormInputs.forEach((input) => {
  input.addEventListener("input", () => {
    loginErrEle.innerText = "";
  });
});

// ! --------- Log in submit Event Listener ---------
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  let userCred = {
    email: e.target.querySelector("[name=email]").value,
    password: e.target.querySelector("[name=password]").value,
  };

  if (userCred.email == "" || userCred.password == "") {
    loginErrEle.innerText = "Un ou plusieurs champs sont vides";
  } else {
    fetch(apiUserLoginUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userCred),
    }).then((response) => {
      if (response.status !== 200) {
        loginErrEle.innerText = "Email ou mot de passe invalide";
      } else {
        response.json().then((userData) => {
          sessionStorage.setItem("token", userData.token);
          console.log(userData);
          window.location.replace("./index.html");
        });
      }
    });
  }
});
