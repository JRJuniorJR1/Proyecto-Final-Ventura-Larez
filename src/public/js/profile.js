
window.upgradeToPremium = async (userId) => {
  try {
    const response = await fetch(`/api/users/premium/${userId}`);
    const data = await response.json();
    if (data.status === 'success') {
      const userRole = data.user.role;
      Toastify({
        text: `¡Felicidades! Ahora eres un usuario ${userRole}`,
        duration: 3000,
        close: true,
        gravity: 'top',
        position: 'right',
        stopOnFocus: true,
        style: {
          background: 'linear-gradient(to right, #00b09b, #96c93d)',
        },
      }).showToast();
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } else {
      Toastify({
        text: `No se pudo cambiar de ROL`,
        duration: 1000,
        close: true,
        gravity: "top",
        position: 'right',
        backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
      }).showToast();
    }
  } catch (error) {
    console.error('Error al enviar la solicitud:', error);
    Toastify({
      text: `Falta subir documentacion.`,
      duration: 1000,
      close: true,
      gravity: "top",
      position: 'right',
      backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
    }).showToast();
  }
};
