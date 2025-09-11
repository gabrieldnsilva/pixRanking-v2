/**
 * Módulo para manipular a interface do usuário (DOM).
 */

// Estado da paginação
let currentPage = 1;
const ROWS_PER_PAGE = 10;
let fullRankedData = []; // Armazena todos os dados para paginação
let chartInstance = null; // Instância do gráfico

/**
 * Renderiza o gráfico de barras com as 3 operadoras do topo.
 * @param {Array} top3Data - Array com os dados das 3 operadoras do topo.
 */
function displayTop3Chart(top3Data) {
	const ctx = document.getElementById("top3-chart").getContext("2d");

	// Extrai os nomes e os valores para os eixos do gráfico
	const labels = top3Data.map((op) => op.nome_operadora);
	const data = top3Data.map((op) => op.pixTransactions);

	// Destrói qualquer instância anterior do gráfico
	if (chartInstance) {
		chartInstance.destroy();
	}

	// Cria a nova instância do gráfico
	chartInstance = new chartInstance(ctx, {
		type: "bar", // Gráfico de barras
		data: {
			labels: labels,
			datasets: [
				{
					label: "Transações Pix",
					data: data,
					backgroundColor: [
						"rgba(75, 192, 192, 0.6)",
						"rgba(54, 162, 235, 0.6)",
						"rgba(255, 206, 86, 0.6)",
					],
					borderColor: [
						"rgba(75, 192, 192, 1)",
						"rgba(54, 162, 235, 1)",
						"rgba(255, 206, 86, 1)",
					],
					borderWidth: 1,
				},
			],
		},
		options: {
			scales: {
				y: {
					beginAtZero: true,
				},
			},
			responsive: true,
			plugins: {
				legend: {
					display: false,
				},
			},
		},
	});
}

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
 * Ponto de entrada principal: agora também renderiza o gráfico.
 * @param {Array} rankedData - O array de operadoras processado e ordenado.
 */
export function displayRanking(rankedData) {
	if (!rankedData || rankedData.length === 0) {
		// ...
		return;
	}

	fullRankedData = rankedData;
	currentPage = 1;

	// --- Chama a função para criar o gráfico ---
	// Pega as 3 primeiras operadoras do ranking completo
	const top3 = fullRankedData.slice(0, 3);
	displayTop3Chart(top3);

	// Renderiza a primeira página da tabela
	renderTablePage();
}
