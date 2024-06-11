//! --------- Recuperation des projets et des categories  --------

async function fetchData(url) {
  const response = await fetch(url);
  return response.json();
}

const projects = await fetchData("http://localhost:5678/api/works/");
const categories = await fetchData("http://localhost:5678/api/categories");

//! --------- generer les projets ---------
function generateProjects(projects) {
  const gallerySection = document.querySelector(".gallery");
  gallerySection.innerHTML = "";

  projects.forEach((project) => {
    const projectEle = document.createElement("figure");
    const imgEle = document.createElement("img");
    const captionEle = document.createElement("figcaption");

    imgEle.src = project.imageUrl;
    imgEle.alt = project.title;
    captionEle.innerText = project.title;

    gallerySection.appendChild(projectEle);
    projectEle.appendChild(imgEle);
    projectEle.appendChild(captionEle);
  });
}
generateProjects(projects);

//! --------- generer les boutons de filtres ---------
function generateFilterBtns(categories) {
  const filtersEle = document.querySelector(".filters");

  const filterBtnAllEle = document.createElement("button");
  filterBtnAllEle.textContent = "Tous";
  filterBtnAllEle.dataset.id = 0;
  filtersEle.appendChild(filterBtnAllEle);

  categories.forEach((category) => {
    const categoryEle = document.createElement("button");
    categoryEle.textContent = category.name;
    categoryEle.dataset.id = category.id;
    filtersEle.appendChild(categoryEle);
  });
}
generateFilterBtns(categories);

//! --------- gestion des boutons filtres ---------
const filterBtns = document.querySelectorAll(".filters button");
let selectedFilter = 0;

function updateActiveBtn() {
  filterBtns.forEach((filterBtn, i) => {
    filterBtn.classList.toggle("filter-active", i === selectedFilter);
  });
}

//! --------- generer selon le filtre selectionner ---------
filterBtns.forEach((filterBtn, i) => {
  filterBtn.addEventListener("click", () => {
    const filteredProjects =
      filterBtn.dataset.id == 0
        ? projects
        : projects.filter(
            (project) => project.categoryId == filterBtn.dataset.id
          );

    generateProjects(filteredProjects);

    selectedFilter = i;
    updateActiveBtn();
  });
});
updateActiveBtn();

// ! --------- ***** UTILISATEUR CONNECTE ***** --------- //
// --- variables ---
const loginLogoutBtn = document.getElementById("loginLogoutBtn");

//! --------- changement interface : utilisateur connecté ---------
function userMode() {
  if (sessionStorage.getItem("token") !== null) {
    loginLogoutBtn.textContent = "logout";
    loginLogoutHandler();
    document.querySelector(".filters").style.display = "none";
  } else {
    loginLogoutBtn.textContent = "login";
    loginLogoutHandler();
    document.querySelector(".filters").style.display = "flex";
    document.querySelector(".editGalleryBtn").style.display = "none";
  }
}
userMode();

//! --------- gestion bouton login/logout ---------
function loginLogoutHandler() {
  loginLogoutBtn.addEventListener("click", (e) => {
    if (e.target.textContent == "login") {
      window.location.replace("./login.html");
    } else {
      sessionStorage.removeItem("token");
      userMode();
    }
  });
}
