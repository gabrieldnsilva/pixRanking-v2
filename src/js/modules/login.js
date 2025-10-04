import { showErrorAlert } from "./feedbackManager.js";

$(document).ready(function () {
	$("#login-form").on("submit", function (event) {
		event.preventDefault(); // Previne default

		const email = $("#email").val();
		const senha = $("#password").val();

		console.log("Tentando logar com:", email, senha);

		// Faz a requisição AJAX para nossa API de Login
		$.ajax({
			url: "/api/views/login.php",
			type: "POST",
			data: JSON.stringify({ email: email, senha: senha }),
			success: function (response) {
				// Verifica retorno da API
				if (response.success) {
					window.location.href = "index.html"; // Redireciona para index
				} else {
					// Se retornar erro
					showErrorAlert(
						response.message || "Credenciais inválidas.",
						"Falha no Login"
					);
				}
			},
			error: function () {
				showErrorAlert(
					"Não foi possível conectar ao servidor.",
					"Erro de Conexão"
				);
			},
		});
	});
});
