/**
 * Módulo para funções utilitárias genéricas.
 */

/**
 * Troca a visualização ativa no painel principal, escondendo as outras.
 * @param {string} viewId - O ID da view a ser mostrada (ex: '#ranking-view').
 */
export function switchView(viewId) {
	// Esconde todas as seções que têm a classe .view
	$(".view").removeClass("active-view");
	// Mostra apenas a seção com o ID fornecido
	$(viewId).addClass("active-view");
}
