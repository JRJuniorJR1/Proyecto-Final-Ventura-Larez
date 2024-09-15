document.addEventListener('DOMContentLoaded', function() {
    const newPasswordForm = document.getElementById('newpassword-form');

    newPasswordForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const code = document.getElementById('code').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm_password').value;

        if (password !== confirmPassword) {
            Toastify({
                text: 'Las contraseñas no coinciden. Por favor, inténtalo de nuevo.',
                duration: 3000,
                close: true,
                gravity: "top",
                position: "right",
                backgroundColor: "#f44336",
                stopOnFocus: true,
            }).showToast();
            return;
        }

        fetch('/api/sessions/newpassword', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: code,
                password: password,
            }),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data); 
            if (data.status === 'success') {
                Toastify({
                    text: 'Contraseña actualizada con éxito',
                    duration: 3000,
                    close: true,
                    gravity: "top",
                    position: "right",
                    backgroundColor: "#4caf50",
                    stopOnFocus: true,
                }).showToast();
                setTimeout(() => {
                    window.location.href = '/login';
                }, 3000);
            } else {
                Toastify({
                    text: data.message,
                    duration: 3000,
                    close: true,
                    gravity: "top",
                    position: "right",
                    backgroundColor: "#f44336",
                    stopOnFocus: true,
                }).showToast();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Toastify({
                text: 'Error al actualizar la contraseña. Por favor, inténtalo de nuevo.',
                duration: 3000,
                close: true,
                gravity: "top",
                position: "right",
                backgroundColor: "#f44336",
                stopOnFocus: true,
            }).showToast();
        });
    });
});
