$(document).ready(function () {
	$("#register-form").on("submit", function (event) {
		event.preventDefault();

		const email = $("#email").val();
		const departamento = $("#departamento").val();
		const senha = $("#password").val();
		const confirmarSenha = $("#confirm-password").val();

		// Verifica se as senhas coincidem
		if (senha !== confirmarSenha) {
			Swal.fire("Erro", "As senhas não coincidem!", "error");
			return;
		}
		if (!departamento) {
			Swal.fire("Erro", "Por favor, selecione um departamento.", "error");
			return;
		}

		$.ajax({
			url: "/api/views/register.php",
			type: "POST",
			contentType: "application/json",
			data: JSON.stringify({
				email,
				senha,
				departamento,
			}),
			success: function (response) {
				if (response.success) {
					Swal.fire({
						title: "Sucesso!",
						text: "Usuário cadastrado com sucesso. Você será redirecionado para o login.",
						icon: "success",
						timer: 2000,
						showConfirmButton: false,
					}).then(() => {
						window.location.href = "login.html";
					});
				} else {
					Swal.fire("Erro no Cadastro", response.message, "error");
				}
			},
			error: function () {
				Swal.fire(
					"Erro de Servidor",
					"Não foi possível processar sua solicitação.",
					"error"
				);
			},
		});
	});
});
