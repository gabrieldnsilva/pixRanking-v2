export function checkAuthStatus() {
	return new Promise((resolve, reject) => {
		$.ajax({
			url: "php/views/session_status.php",
			type: "GET",
			dataType: "json", // Força interpretação como JSON
			success: function (response) {
				if (response.success) {
					console.log("Usuário autenticado:", response.data);
					resolve(response.data);
				} else {
					reject("Sessão inválida");
				}
			},
			error: function (xhr, status, error) {
				console.error(
					"Erro na verificação de sessão:",
					xhr.status,
					error
				);
				reject("Erro na verificação de sessão");
			},
		});
	});
}
