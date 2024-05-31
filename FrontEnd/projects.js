const response = await fetch("http://localhost:5678/api/works/");
let projects = await response.json();

console.log(projects[0].title);

function generateProjects(projects) {
  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];

    const gallerySection = document.querySelector(".gallery");

    const projectEle = document.createElement("figure");
    const imgEle = document.createElement("img");
    const captionEle = document.createElement("figcaption");

    imgEle.src = project.imageUrl;
    imgEle.alt = project.title;
    captionEle.innerText = project.title;

    gallerySection.appendChild(projectEle);
    projectEle.appendChild(imgEle);
    projectEle.appendChild(captionEle);
  }
}

generateProjects(projects);
