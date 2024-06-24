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

// Modal "add project" elements:
const addProjForm = document.getElementById("add-pic_form");
const formInputPhoto = document.getElementById("photo");
const photoPreview = document.getElementById("picPreviewImg");
const photoPreviewContainer = document.querySelector(".picPreview_container");
const formCategorySelect = document.getElementById("category-select");
const formTitle = document.getElementById("title");
const formSubmitBtn = document.querySelector(".submit-btn");
const submitBtnDiv = document.querySelector(".submit-btn-div");

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
function filterProjects(proj) {
  filterBtns.forEach((filterBtn, i) => {
    filterBtn.addEventListener("click", () => {
      const filteredProjects =
        filterBtn.dataset.id == 0
          ? proj
          : proj.filter(
              (project) => project.categoryId == filterBtn.dataset.id
            );

      generateProjects(filteredProjects);

      selectedFilter = i;
      updateActiveBtn();
    });
  });
}
filterProjects(projects);
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
    location.reload();
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
  galleryEditModal();
  resetAddPhotoModal();
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
  resetAddPhotoModal();
}

// Reset la modale d'ajout de projet
function resetAddPhotoModal() {
  addProjForm.reset();
  photoPreview.src = "";
  submitBtnColor();
  photoPreviewContainer.style.display = "none";
  document.querySelector(".pic-format").style.display = "block";
  document.querySelector("#choose_pic_btn").style.display = "block";
  document.querySelector("#pic_icon").style.display = "block";
}

// ferme la modale lorsue l'on click
modal.addEventListener("click", (e) => {
  if (!e.target.closest("#gallery-edit") && !e.target.closest("#add-picture")) {
    closeModal();
  }
});

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

// !--------- **** MODALE Ajout de projet **** ---------

// ! --------- fonction preview de l'image selectionner ---------
function previewImg() {
  const fichiers = formInputPhoto.files;
  photoPreview.src = URL.createObjectURL(fichiers[0]);
  photoPreviewContainer.style.display = "flex";
  document.querySelector(".pic-format").style.display = "none";
  document.querySelector("#choose_pic_btn").style.display = "none";
  document.querySelector("#pic_icon").style.display = "none";
  submitBtnColor();
}
formInputPhoto.onchange = previewImg;

// ! --------- couleur du "submit" si les champs sont vides ---------
function submitBtnColor() {
  if (
    formInputPhoto.files[0] !== undefined &&
    formTitle.value !== "" &&
    formCategorySelect.selectedIndex !== 0
  ) {
    submitBtnDiv.style.display = "none";
    formSubmitBtn.style.backgroundColor = "#1D6154";
    formSubmitBtn.style.cursor = "pointer";
    formSubmitBtn.disabled = false;
  } else {
    submitBtnDiv.style.display = "block";
    formSubmitBtn.style.backgroundColor = "#a7a7a7";
    formSubmitBtn.style.cursor = "default";
    formSubmitBtn.disabled = true;
  }
}

formTitle.addEventListener("input", () => {
  submitBtnColor();
});
formCategorySelect.addEventListener("input", () => {
  submitBtnColor();
});

submitBtnDiv.addEventListener("click", () => {
  formValidation();
});

function formValidation() {
  if (formInputPhoto.files[0] == undefined) {
    alert("Le champ 'Ajouter photo' est vide");
    return false;
  }
  if (formTitle.value.trim().length == 0) {
    alert("Le champ 'Titre' est vide");
    return false;
  }
  if (formCategorySelect.selectedIndex == 0) {
    alert("Veuillez selectionner une catégorie");
    return false;
  }
}

// ! --------- submit form event listener ---------
formSubmitBtn.addEventListener("click", (e) => {
  e.preventDefault();
  submitNewProject();
});

// ! --------- submit un nouveau projet ---------
function submitNewProject() {
  let image = formInputPhoto.files[0];
  let title = formTitle.value;
  let categoryId = formCategorySelect.selectedIndex;
  let categoryName =
    formCategorySelect.options[formCategorySelect.selectedIndex].innerText;

  const formData = new FormData();
  formData.append("image", image);
  formData.append("title", title);
  formData.append("category", categoryId);

  addNewProj(formData, categoryName);
}

// ! --------- ajouter projet dans le tableau 'projects' ---------
function addProj(proj, categoryName) {
  let newProj = {};
  newProj.id = proj.id;
  newProj.title = proj.title;
  newProj.imageUrl = proj.imageUrl;
  newProj.category = { id: proj.categoryId, name: categoryName };

  projects.push(newProj);
}

// ! --------- ajouter projet sur API ---------
function addNewProj(formData, categoryName) {
  let token = sessionStorage.getItem("token");
  fetch("http://localhost:5678/api/works/", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
    },
    body: formData,
  })
    .then((res) => {
      if (res.ok) {
        alert("Votre nouveau projet a été ajouté");
        return res.json();
      } else {
        alert("Une erreur est survenue");
        console.log(res.status);
      }
    })
    .then((newProject) => {
      addProj(newProject, categoryName);
      generateProjects(projects);
      modalGallery(projects);
      closeModal();
    })
    .catch((error) => console.log(error));
}
