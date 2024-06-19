//! --------- Recuperation des projets et des categories  --------

async function fetchData(url) {
  const response = await fetch(url);
  return response.json();
}

let projects = await fetchData("http://localhost:5678/api/works/");
let categories = await fetchData("http://localhost:5678/api/categories");

// ! ****** VARIABLES/ELEMENTS ******
const gallery = document.querySelector(".gallery");
const filters = document.querySelector(".filters");
const loginLogoutBtn = document.getElementById("loginLogoutBtn");
const editGalleryBtn = document.querySelector(".editGalleryBtn");

// Modal elements:
const modal = document.querySelector(".modal");
const galleryEditEle = document.getElementById("gallery-edit");
const addPhotoEle = document.getElementById("add-picture");
const modalArrowIcon = document.querySelector(".fa-arrow-left");
const modalCloseIcon = document.querySelectorAll(".modal_closeIcon");
const modalContent = document.querySelector(".modal_main-content");
const modalAddPhotoBtn = document.getElementById("modal_addPhotoBtn");

//! --------- generer les projets ---------
function generateProjects(projects) {
  gallery.innerHTML = "";

  projects.forEach((i) => {
    const projectEle = document.createElement("figure");
    const imgEle = document.createElement("img");
    const captionEle = document.createElement("figcaption");

    imgEle.src = i.imageUrl;
    imgEle.alt = i.title;
    captionEle.innerText = i.title;

    gallery.appendChild(projectEle);
    projectEle.appendChild(imgEle);
    projectEle.appendChild(captionEle);
  });
}
generateProjects(projects);

//! --------- generer les boutons de filtres ---------
function generateFilterBtns(categories) {
  const filterBtnAllEle = document.createElement("button");
  filterBtnAllEle.textContent = "Tous";
  filterBtnAllEle.dataset.id = 0;
  filters.appendChild(filterBtnAllEle);

  categories.forEach((category) => {
    const categoryEle = document.createElement("button");
    categoryEle.textContent = category.name;
    categoryEle.dataset.id = category.id;
    filters.appendChild(categoryEle);
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

//! --------- changement interface : utilisateur connecté ---------
function userMode() {
  let token = sessionStorage.getItem("token");
  if (token !== null) {
    loginLogoutBtn.textContent = "logout";
    filters.style.display = "none";
    editGalleryBtn.style.display = "block";
    editGalleryBtn.addEventListener("click", openModal);
    modalCloseIcon.forEach((closeIcon) =>
      closeIcon.addEventListener("click", closeModal)
    );
    modalArrowIcon.addEventListener("click", galleryEditModal);
    modalAddPhotoBtn.addEventListener("click", addPhotoModal);
    modalGallery(projects);
  } else {
    loginLogoutBtn.textContent = "login";
    filters.style.display = "flex";
    editGalleryBtn.style.display = "none";
  }
}
userMode();

//! --------- gestion bouton login/logout ---------
loginLogoutBtn.addEventListener("click", () => {
  if (loginLogoutBtn.textContent === "login") {
    window.location.replace("./login.html");
  } else {
    sessionStorage.removeItem("token");
    userMode();
  }
});

// !--------- **** MODALE **** ---------

// ouvre la MODAL (si token present)
function openModal() {
  if (sessionStorage.getItem("token") !== null) {
    modal.style.display = "flex";
  }
}

// ferme la MODAL
function closeModal() {
  modal.style.display = "none";
  galleryEditEle.style.display = "flex";
  addPhotoEle.style.display = "none";
}

// ouvre la MODAL "ajout de photos"
function addPhotoModal() {
  galleryEditEle.style.display = "none";
  addPhotoEle.style.display = "flex";
}

// retour à la modale "modifier gallery photo"
function galleryEditModal() {
  galleryEditEle.style.display = "flex";
  addPhotoEle.style.display = "none";
}

// ! --------- affiche la galerie de la modale  ---------
function modalGallery(projs) {
  modalContent.innerHTML = "";
  projs.forEach((i) => {
    const modalProjectEle = document.createElement("figure");
    const imgEle = document.createElement("img");
    const deleteProjIcon = document.createElement("i");

    deleteProjIcon.classList.add("fa-solid", "fa-trash-can");
    deleteProjIcon.id = i.id;
    imgEle.src = i.imageUrl;
    imgEle.alt = i.title;
    modalProjectEle.className = "modal_project";

    modalContent.appendChild(modalProjectEle);
    modalProjectEle.appendChild(imgEle);
    modalProjectEle.appendChild(deleteProjIcon);

    // supprimer un projet en clickant sur l'icone 'trash'
    deleteProjIcon.addEventListener("click", (e) => {
      e.preventDefault;
      let confirmation = confirm(
        "Êtes-vous sûr de vouloir supprimer ce projet ?"
      );
      if (confirmation) {
        deleteProj(e.target.id);
      }
    });
  });
}

// ! --------- fonction pour supprimer un projet ---------
function deleteProj(id) {
  // message de comfirmation
  let token = sessionStorage.getItem("token");
  fetch(`http://localhost:5678/api/works/${id}`, {
    method: "DELETE",
    headers: {
      authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (res.ok) {
        projects = projects.filter((project) => project.id != id);
        generateProjects(projects);
        modalGallery(projects);
      } else {
        console.log(`Erreur: ${res.status}`);
      }
    })
    .catch((error) => {
      console.log("Erreur de suppression:", error);
    });
}
