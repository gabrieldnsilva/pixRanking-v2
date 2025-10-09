/**
 * Módulo para gerenciar o logout do usuário
 */

/**
 * Configura o handler de logout para um botão específico
 * @param {string} buttonSelector - Seletor jQuery do botão de logout (ex: "#logout-btn")
 */
export function setupLogoutHandler(buttonSelector) {
	$(buttonSelector).on("click", function () {
		Swal.fire({
			title: "Confirmar Logout",
			text: "Deseja realmente sair do sistema?",
			icon: "question",
			showCancelButton: true,
			confirmButtonText: "Sim, sair",
			cancelButtonText: "Cancelar",
		}).then((result) => {
			if (result.isConfirmed) {
				$.ajax({
					url: "php/views/logout.php",
					type: "POST",
					success: function () {
						window.location.replace("login.html");
					},
					error: function () {
						window.location.replace("login.html");
					},
				});
			}
		});
	});
}
