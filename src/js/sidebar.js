(function() {
    const opcionesConDesplegable = document.querySelectorAll(".li-desplegable");

    opcionesConDesplegable.forEach(function (opcion) {
      opcion.addEventListener("click", function () {
        const desplegable = opcion.querySelector(".desplegable");
        desplegable.classList.toggle("hidden");
      });
    });
})()