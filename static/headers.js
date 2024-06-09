document.addEventListener("DOMContentLoaded", function () {
  var headers = document.querySelectorAll(
    "main h1, main h2, main h3, main h4, main h5, main h6",
  );
  var numbers = [0, 0, 0, 0, 0, 0];

  headers.forEach(function (header) {
    var level = parseInt(header.tagName.substr(1)) - 1;

    numbers[level]++;
    for (var i = level + 1; i < numbers.length; i++) {
      numbers[i] = 0;
    }

    var numberStr = numbers.slice(0, level + 1).join(".");
    header.innerHTML = numberStr + ". " + header.innerHTML;
  });
});
