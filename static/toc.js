document.addEventListener("DOMContentLoaded", function () {
  const content = document.querySelector("main");
  const toc = document.querySelector(".toc ul");
  const headings = content.querySelectorAll("h1, h2");

  headings.forEach((heading, index) => {
    const id = `section-${index + 1}`;
    heading.setAttribute("id", id);

    const tocItem = document.createElement("li");
    const tocLink = document.createElement("a");
    tocLink.setAttribute("href", `#${id}`);
    tocLink.textContent = heading.textContent;
    tocItem.appendChild(tocLink);

    // Check if the heading is an h2 (subheading) and add indentation
    if (heading.tagName === "H2") {
      tocItem.style.paddingLeft = "20px"; // Adjust the indentation as needed
    }

    toc.appendChild(tocItem);
  });

  const tocLinks = document.querySelectorAll(".toc a");

  window.addEventListener("scroll", () => {
    let currentSection = "";

    headings.forEach((section) => {
      const sectionTop = section.offsetTop;
      if (scrollY >= sectionTop - 50) {
        currentSection = section.getAttribute("id");
      }
    });

    tocLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentSection}`) {
        link.classList.add("active");
      }
    });
  });
});
