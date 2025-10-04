import { showErrorAlert, showSuccessAlert } from "./feedbackManager.js";

$(document).ready(function () {
	$("#register-form").on("submit", function (event) {
		event.preventDefault();

		const email = $("#email").val();
		const departamento = $("#departmento").val();
		const senha = $("#password").val();
		const confirmarSenha = $("#confirm-password").val();
	});
});

// Validação no lado do cliente

// Verifica se as senhas coincidem
if (senha !== confirmarSenha) {
	showErrorAlert("As senhas não coincidem.", "Erro de Registro");
	return;
}

// Verifica se o departamento foi selecionado
if (!departamento) {
	showErrorAlert("Por favor, selecione um departamento.", "Erro de Registro");
	return;
}

$.ajax({
	url: "/api/views/register.php",
	type: "POST",
	contentType: "application/json",
	data: JSON.stringify({ email, departamento, senha }),
	success: function (response) {
		if (response.success) {
			showSuccessAlert(
				"Cadastro bem-sucedido! Você será redirecionado para o login.",
				"Sucesso",
				{ timer: 2000 },
				{ showConfirmButton: false }
			).then(() => {
				window.location.href = "login.html";
			});
		} else {
			showErrorAlert(
				response.message || "Erro ao cadastrar. Tente novamente."
			);
		}
	},
	error: function () {
		showErrorAlert("Erro na comunicação com o servidor. Tente novamente.");
	},
});
