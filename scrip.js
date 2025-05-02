let currentIndex = 0;
const slides = document.querySelectorAll('.carousel-slide');
const totalSlides = slides.length;

function moveToNextSlide() {
    currentIndex = (currentIndex + 1) % totalSlides;
    updateCarousel();
}

function updateCarousel() {
    const newTransform = -currentIndex * 100;
    document.querySelector('.carousel').style.transform = `translateX(${newTransform}%)`;
}

setInterval(moveToNextSlide, 3000);

function handleCredentialResponse(response) {
    const responsePayload = parseJwt(response.credential);
    const email = responsePayload.email;

    if (email.endsWith("@amigo.edu.co")) {
        // Guardar correo en localStorage
        localStorage.setItem("correo", email);

        // CONSULTAR AL BACKEND si ya está registrado
        fetch(`http://localhost:3000/verificar?correo=${email}`)
            .then(res => res.json())
            .then(data => {
                if (data.registrado) {
                    // Guardar el rol si existe
                    if (data.rol) {
                        localStorage.setItem("rol", data.rol);
                        
                        // Si tiene rol de admin, redirigir al panel correspondiente
                        if (data.rol === 'biblioteca' || data.rol === 'bienestar' || data.rol === 'servicios generales') {
                            alert("✅ Bienvenido administrador de " + data.rol);
                            window.location.href = "http://127.0.0.1:5500/interfaz_administrador/index.html";  // Panel de admin
                            return;
                        }
                    }
                    
                    alert("✅ Bienvenido de nuevo: " + email);
                    window.location.href = "http://127.0.0.1:5500/interfaz_usuario/index.html";  // Página de usuario
                } else {
                    alert("✅ Acceso aprobado, completa tu registro: " + email);
                    setTimeout(() => {
                        window.location.href = "formulario/formulario.html";
                    }, 1500);
                }
            })
            .catch(error => {
                console.error("❌ Error al verificar usuario:", error);
                alert("❌ Hubo un error al verificar el usuario.");
            });

    } else {
        alert("❌ Acceso denegado: Debes usar un correo @amigo.edu.co");
    }
}


function parseJwt(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

document.addEventListener("DOMContentLoaded", function () {
    const emailField = document.querySelector(".g_id_signin");

    emailField.addEventListener("click", function () {
        emailField.classList.add("click-effect");

        setTimeout(() => {
            emailField.classList.remove("click-effect");
        }, 500);
    });
});
