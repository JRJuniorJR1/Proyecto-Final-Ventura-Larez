const socketCliente = io();

const messageInput = document.getElementById('message-input');
const form = document.getElementById('form');

let user;

Swal.fire({
    title: "Bienvenido",
    text: "Ingrese su nombre de usuario:",
    input: "text",
    allowOutsideClick: false,
    inputValidator: (value) => {
        if (!value) {
            return 'Necesitas escribir un nombre de usuario';
        }
    },
    showCancelButton: true,
    cancelButtonText: 'Salir',
    confirmButtonText: 'Aceptar',
    cancelButtonColor: '#d33',
    confirmButtonColor: '#3085d6',
}).then(result => {     
    if (result.isConfirmed) {
        user = result.value;
        socketCliente.emit('authenticated', user);

        socketCliente.emit('requestMessageLogs');
    } else if (result.dismiss === Swal.DismissReason.cancel) {
        window.location.href = '/home';
    }
});

form.onsubmit = (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();

    if (message.length > 0) {
        socketCliente.emit('message', { user: user, message: message });
        messageInput.value = '';
    }
}

socketCliente.on('messageLogs', data => {
    if (!user) return;
    const messagesLog = document.getElementById('messages-log');
    let messages = "";

    data.forEach(data => {
        messages += `${data.user} dice: ${data.message} <br/>`;
    });
    messagesLog.innerHTML = messages;
});

socketCliente.on('newUserConnected', user => {
    Swal.fire({
        toast: true,
        position: "top-right",
        text: "Nuevo usuario conectado",
        title: `${user} se ha unido al chat`,
        timer: 3000,
        showConfirmButton: false
    });
});
