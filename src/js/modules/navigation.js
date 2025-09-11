import { switchView } from "./utils.js";

/**
 * Módulo para gerenciar a navegação principal da aplicação.
 * @param {object} crudManager - O módulo de gerenciamento CRUD.
 */

export function initNavigation(crudManager) {
	const $navLinks = $(".sidebar .sidebar-nav  .nav-link");

	// Gerencia a navegação entre as seções
	function setActiveLink(clickedLink) {
		$navLinks.removeClass("active");
		$(clickedLink).addClass("active");
	}

	// Navegação para a tela principal
	$("#dashboard-link").on("click", function (e) {
		e.preventDefault();
		setActiveLink(this);
		switchView("#ranking-view");
	});

	// Navegação para a tela de Gerenciamento de Operadoras
	$("#manage-operators-link").on("click", function (e) {
		e.preventDefault();
		setActiveLink(this);

		// Precisamos popular a tabela do CRUD antes de mostrar a view
		crudManager.populateCrudTable();

		switchView("#crud-view");
	});
}
