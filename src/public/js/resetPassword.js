const form = document.getElementById('resetpassword-form');

const handleResponse = (result) => {
    console.log(result);

    const message = result.status === 'success' 
        ? 'Se ha enviado un correo electrónico con instrucciones para restablecer su contraseña.' 
        : `Error: ${result.message}`;
    
    Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        backgroundColor: result.status === 'success' ? "#4caf50" : "#f44336",
        stopOnFocus: true,
    }).showToast();
};

const handleError = (error) => {
    console.error('Error:', error);

    Toastify({
        text: 'Ha ocurrido un error. Por favor, inténtalo de nuevo.',
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        backgroundColor: "#f44336",
        stopOnFocus: true,
    }).showToast();
};

const validateFormData = (data) => {
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!emailRegex.test(data.get('email'))) {
        Toastify({
            text: 'Por favor, introduce un correo electrónico válido.',
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            backgroundColor: "#f44336",
            stopOnFocus: true,
        }).showToast();
        return false;
    }
    return true;
};

form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    const obj = Object.fromEntries(data);

    if (!validateFormData(data)) {
        return;
    }
    fetch('api/sessions/resetpassword', {            
        method: 'POST',
        body: JSON.stringify(obj),
        headers: {
            'Content-Type':'application/json'
        }
    })
    .then(response => response.json())
    .then(handleResponse) 
    .catch(handleError); 
});
