import { showSuccessToast, showErrorAlert } from "../ui/feedbackManager.js";

export function initForgotPassword() {
	const $form = $("#forgot-form");
	const $email = $("#forgot-email");

	$form.off("submit").on("submit", async (e) => {
		e.preventDefault();
		const email = $email.val().trim();
		if (!email) return;

		const $btn = $form.find('button[type="submit"]');
		const originalHtml = $btn.html();
		$btn.prop("disabled", true).html(
			'<i class="ri-loader-4-line spin"></i> Enviando...'
		);

		try {
			await $.ajax({
				url: "php/views/forgot_password.php",
				type: "POST",
				contentType: "application/json",
				data: JSON.stringify({ email }),
			});
			showSuccessToast(
				"Se o e-mail existir, enviaremos instruções de redefinição."
			);
			const modal = bootstrap.Modal.getInstance(
				document.getElementById("forgotModal")
			);
			modal?.hide();
			$email.val(""); // Limpa campo
		} catch (err) {
			showErrorAlert(
				"Não foi possível processar a solicitação agora.",
				"Erro"
			);
		} finally {
			$btn.prop("disabled", false).html(originalHtml);
		}
	});
}

export function initResetPassword() {
	const params = new URLSearchParams(window.location.search);
	const token = params.get("token");
	const email = params.get("email");
	const $form = $("#reset-form");
	const $pass = $("#reset-password");
	const $confirm = $("#reset-password-confirm");
	const $status = $("#reset-status");
	const $btn = $("#reset-submit-btn");

	// ✅ Validação do link
	if (!token || !email) {
		$status
			.removeClass("d-none alert-info")
			.addClass("alert-danger")
			.html(
				'<i class="ri-error-warning-line"></i> <strong>Link inválido ou incompleto.</strong><br>Solicite um novo link de redefinição.'
			);
		$form.hide();
		return;
	}

	// ✅ Feedback de link válido
	$status
		.removeClass("d-none alert-danger")
		.addClass("alert-info")
		.html(
			'<i class="ri-information-line"></i> Link válido. Digite sua nova senha abaixo.'
		);

	$form.off("submit").on("submit", async (e) => {
		e.preventDefault();
		const p1 = $pass.val();
		const p2 = $confirm.val();

		// Validações
		if (p1.length < 6) {
			showErrorAlert(
				"A senha deve ter pelo menos 6 caracteres.",
				"Senha Fraca"
			);
			return;
		}
		if (p1 !== p2) {
			showErrorAlert("As senhas não conferem.", "Erro");
			return;
		}

		const originalHtml = $btn.html();
		$btn.prop("disabled", true).html(
			'<i class="ri-loader-4-line spin"></i> Redefinindo...'
		);

		try {
			const response = await $.ajax({
				url: "php/views/reset_password.php",
				type: "POST",
				contentType: "application/json",
				data: JSON.stringify({ email, token, password: p1 }),
			});

			// ✅ Sucesso
			$status
				.removeClass("alert-info alert-danger")
				.addClass("alert-success")
				.html(
					'<i class="ri-checkbox-circle-line"></i> <strong>Senha redefinida com sucesso!</strong><br>Redirecionando para o login...'
				);
			$form.hide();

			setTimeout(() => (window.location.href = "login.html"), 2000);
		} catch (err) {
			const msg =
				err.responseJSON?.message ||
				"Link inválido ou expirado. Solicite um novo.";
			showErrorAlert(msg, "Erro ao Redefinir");
			$btn.prop("disabled", false).html(originalHtml);
		}
	});
}
