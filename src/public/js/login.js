const form = document.getElementById('loginForm');

form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = new FormData(form);
    const obj = {};
    data.forEach((value, key) => obj[key] = value);

    try {
        const response = await fetch('/api/sessions/login', { 
            method: 'POST',
            body: JSON.stringify(obj),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) { 
            window.location.replace('/products');
        } else {
            Toastify({
                text: 'Contraseña incorrecta o usuario no encontrado.',
                duration: 3000,
                close: true,
                gravity: 'top',
                position: 'right',
                backgroundColor: 'linear-gradient(to right, #ff5f6d, #ffc371)',
            }).showToast();
        }
    } catch (error) {
        console.error('Error al enviar la solicitud:', error);
        Toastify({
            text: 'Error en la conexión con el servidor.',
            duration: 3000,
            close: true,
            gravity: 'top',
            position: 'right',
            backgroundColor: 'linear-gradient(to right, #ff5f6d, #ffc371)',
        }).showToast();
    }
});
