/**
 * Módulo para manipular a interface do usuário (DOM).
 */

// Estado da paginação
let currentPage = 1;
const ROWS_PER_PAGE = 10;
let fullRankedData = []; // Armazena todos os dados para paginação

/**
 * Renderiza uma página específica da tabela do ranking.
 */
function renderTablePage() {
	const $rankingBody = $("#ranking-body");
	$rankingBody.empty();

	// Calcula os índices de início e fim para o .slice()
	const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
	const endIndex = startIndex + ROWS_PER_PAGE;
	const paginatedData = fullRankedData.slice(startIndex, endIndex);

	paginatedData.forEach((operator, index) => {
		// O rank deve ser calculado com base na página atual
		const rank = startIndex + index + 1;
		const pixPercentage = (operator.pixProportion * 100).toFixed(2) + "%";

		const row = `
            <tr>
                <td><strong>${rank}</strong></td>
                <td>${operator.nome_operadora}</td>
                <td>${operator.numero_operadora}</td>
                <td>${operator.pixTransactions.toLocaleString("pt-BR")}</td>
                <td>${pixPercentage}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-details-btn" data-operator-id="${
						operator.numero_operadora
					}">
                        <i class="ri-pie-chart-line"></i> Detalhes
                    </button>
                </td>
            </tr>
        `;
		$rankingBody.append(row);
	});

	updatePaginationControls();
}

/**
 * Atualiza os botões e as informações da página.
 */
function updatePaginationControls() {
	const totalPages = Math.ceil(fullRankedData.length / ROWS_PER_PAGE);
	$("#page-info").text(`Página ${currentPage} de ${totalPages}`);

	// Desabilita/habilita os botões conforme a página atual
	$("#prev-page-btn").prop("disabled", currentPage === 1);
	$("#next-page-btn").prop("disabled", currentPage === totalPages);
}

// Event Listeners para os botões de paginação
$(document).on("click", "#prev-page-btn", function () {
	if (currentPage > 1) {
		currentPage--;
		renderTablePage();
	}
});

$(document).on("click", "#next-page-btn", function () {
	const totalPages = Math.ceil(fullRankedData.length / ROWS_PER_PAGE);
	if (currentPage < totalPages) {
		currentPage++;
		renderTablePage();
	}
});

/**
 * Ponto de entrada principal: recebe todos os dados, reseta o estado e renderiza a primeira página.
 * @param {Array} rankedData - O array de operadoras processado e ordenado.
 */
export function displayRanking(rankedData) {
	if (!rankedData || rankedData.length === 0) {
		$("#ranking-body").html(
			'<tr><td colspan="6" class="text-center">Nenhum dado para exibir.</td></tr>'
		);
		return;
	}

	fullRankedData = rankedData;
	currentPage = 1; // Reseta para a primeira página a cada novo carregamento
	renderTablePage();
}
