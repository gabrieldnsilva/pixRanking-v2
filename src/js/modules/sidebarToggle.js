/**
 * Lógica para controlar a sidebar dinâmica
 * Adiciona um evento de clique ao botão de menu que alterna a classe
 * 'sidebar-collapsed' no elemento body, controlando a visibilidade da sidebar.
 */
export function initSidebarToggle() {
	const $sidebarToggle = $("#sidebar-toggle");
	const $body = $("body");

	if ($sidebarToggle.length) {
		$sidebarToggle.on("click", function () {
			$body.toggleClass("sidebar-collapsed");

			const $icon = $(this).find("i");

			if ($body.hasClass("sidebar-collapsed")) {
				$icon
					.removeClass("ri-arrow-left-s-line")
					.addClass("ri-arrow-right-s-line");
				$(this).attr("title", "Expandir Menu");
			} else {
				$icon
					.removeClass("ri-arrow-right-s-line")
					.addClass("ri-arrow-left-s-line");
				$(this).attr("title", "Recolher Menu");
			}
		});
	}
}

// Initialize the sidebar toggle when the document is ready
$(document).ready(function () {});
