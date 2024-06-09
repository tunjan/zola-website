const mainElement = document.querySelector("main");
const previewLinks = mainElement.querySelectorAll("a");
const previewContainer = document.getElementById("preview-container");
let previewTimeout;
let previewDelayTimeout;

previewLinks.forEach((link) => {
  link.addEventListener("mouseenter", () => {
    clearTimeout(previewTimeout);
    clearTimeout(previewDelayTimeout);

    previewDelayTimeout = setTimeout(() => {
      fetch(link.href)
        .then((response) => response.text())
        .then((html) => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          const mainContent = doc.querySelector("main");
          if (mainContent) {
            previewContainer.innerHTML = mainContent.innerHTML;
          } else {
            previewContainer.innerHTML = "No main content found.";
          }
          previewContainer.style.display = "block";
          positionPreviewContainer(link);
          previewContainer.classList.add("show");
        })
        .catch((error) => {
          console.error("Error fetching preview:", error);
        });
    }, 200);
  });

  link.addEventListener("mouseleave", () => {
    clearTimeout(previewDelayTimeout);
    previewTimeout = setTimeout(() => {
      previewContainer.classList.remove("show");
      setTimeout(() => {
        previewContainer.style.display = "none";
      }, 200);
    }, 200);
  });
});

previewContainer.addEventListener("mouseenter", () => {
  clearTimeout(previewTimeout);
});

previewContainer.addEventListener("mouseleave", () => {
  previewTimeout = setTimeout(() => {
    previewContainer.classList.remove("show");
    setTimeout(() => {
      previewContainer.style.display = "none";
    }, 200);
  }, 200);
});

function positionPreviewContainer(link) {
  const linkRect = link.getBoundingClientRect();
  const containerRect = previewContainer.getBoundingClientRect();
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  let left = linkRect.left + linkRect.width + 10;
  let top = linkRect.top;

  if (left + containerRect.width > windowWidth) {
    left = linkRect.left - containerRect.width - 10;
  }

  if (top + containerRect.height > windowHeight) {
    top = windowHeight - containerRect.height - 10;
  }

  previewContainer.style.left = `${left}px`;
  previewContainer.style.top = `${top}px`;
}

previewContainer.addEventListener("mouseenter", (event) => {
  if (event.target.tagName === "A") {
    event.stopPropagation();
  }
});
