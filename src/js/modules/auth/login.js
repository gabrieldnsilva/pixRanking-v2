$(document).ready(function () {
	/**
	 * Verifica o status da sessão ao carregar a página
	 * Se já estiver logado, redireciona para o dashboard
	 * Se não, permanece na página de login
	 */
	$.ajax({
		url: "php/views/session_status.php",
		type: "GET",
		dataType: "json",
		success: function (response) {
			if (response.success) {
				// Já está logado, redireciona para o dashboard
				window.location.replace("index.html");
				return;
			}
		},
		error: function () {
			// Não está logado, continua na página de login
			console.log(
				"Usuário não autenticado, mostrando formulário de login"
			);
		},
	});

	// Manipulador de submissão do formulário de login
	$("#login-form").on("submit", function (event) {
		event.preventDefault();

		const email = $("#email").val().trim();
		const senha = $("#password").val();

		// Validações client-side
		if (!email || !senha) {
			Swal.fire("Erro", "Por favor, preencha todos os campos.", "error");
			return;
		}

		// Mostra loading
		Swal.fire({
			title: "Processando...",
			text: "Verificando suas credenciais",
			allowOutsideClick: false,
			didOpen: () => {
				Swal.showLoading();
			},
		});

		$.ajax({
			url: "php/views/login.php",
			type: "POST",
			contentType: "application/json",
			data: JSON.stringify({ email, senha }),
			success: function (response) {
				Swal.close();

				if (response.success) {
					Swal.fire({
						title: "Sucesso!",
						text: "Login realizado com sucesso. Redirecionando...",
						icon: "success",
						timer: 1500,
						showConfirmButton: false,
					}).then(() => {
						window.location.replace("index.html");
					});
				} else {
					Swal.fire("Erro no Login", response.message, "error");
				}
			},
			error: function (xhr, status, error) {
				Swal.close();

				console.error("Erro completo no login:", {
					xhr: xhr,
					status: status,
					error: error,
					responseText: xhr.responseText,
				});

				let errorMessage = "Não foi possível conectar ao servidor.";

				if (xhr.responseJSON && xhr.responseJSON.message) {
					errorMessage = xhr.responseJSON.message;
				} else if (xhr.responseText) {
					errorMessage =
						"Erro do servidor: " +
						xhr.responseText.substring(0, 100);
				} else if (xhr.status === 401) {
					errorMessage = "Email ou senha incorretos.";
				} else if (xhr.status === 500) {
					errorMessage =
						"Erro interno do servidor. Contate o administrador.";
				}

				Swal.fire("Erro de Servidor", errorMessage, "error");
			},
		});
	});
});
