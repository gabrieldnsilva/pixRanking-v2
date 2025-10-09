$(document).ready(function () {
	$("#register-form").on("submit", function (event) {
		event.preventDefault();

		const email = $("#email").val().trim();
		const departamento = $("#departamento").val();
		const senha = $("#password").val();
		const confirmarSenha = $("#confirm-password").val();

		// Validação de domínio do e-mail -- ATENÇÃO AQUI --
		const emailRegex = /^[a-zA-Z0-9._%+-]+@atacadao\.com\.br$/i;
		if (!emailRegex.test(email)) {
			Swal.fire(
				"Erro",
				"Utilize um e-mail corporativo @atacadao.com.br para se cadastrar.",
				"error"
			);
			return;
		}

		// Validações client-side
		if (!email || !senha || !confirmarSenha) {
			Swal.fire("Erro", "Por favor, preencha todos os campos.", "error");
			return;
		}

		if (senha !== confirmarSenha) {
			Swal.fire("Erro", "As senhas não coincidem!", "error");
			return;
		}

		if (!departamento) {
			Swal.fire("Erro", "Por favor, selecione um departamento.", "error");
			return;
		}

		if (senha.length < 6) {
			Swal.fire(
				"Erro",
				"A senha deve ter pelo menos 6 caracteres.",
				"error"
			);
			return;
		}

		// Mostra loading
		Swal.fire({
			title: "Processando...",
			text: "Criando sua conta",
			allowOutsideClick: false,
			didOpen: () => {
				Swal.showLoading();
			},
		});

		$.ajax({
			url: "php/views/register.php",
			type: "POST",
			contentType: "application/json",
			data: JSON.stringify({
				email,
				senha,
				departamento,
			}),
			success: function (response) {
				Swal.close();

				if (response.success) {
					Swal.fire({
						title: "Sucesso!",
						text: "Usuário cadastrado com sucesso. Você será redirecionado para o login.",
						icon: "success",
						timer: 3000,
						showConfirmButton: false,
					}).then(() => {
						window.location.href = "login.html";
					});
				} else {
					Swal.fire("Erro no Cadastro", response.message, "error");
				}
			},
			error: function (xhr, status, error) {
				Swal.close();

				let errorMessage =
					"Não foi possível processar sua solicitação.";

				if (xhr.responseJSON && xhr.responseJSON.message) {
					errorMessage = xhr.responseJSON.message;
				} else if (xhr.status === 500) {
					errorMessage =
						"Erro interno do servidor. Contate o administrador.";
				}

				console.error("Erro no registro:", xhr, status, error);
				Swal.fire("Erro de Servidor", errorMessage, "error");
			},
		});
	});
});
