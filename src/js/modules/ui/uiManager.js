import { switchView } from "../utils/utils.js";
import {
	exportIndividualReportPDF,
	exportRankingPDF_Native,
} from "../utils/pdfGenerator.js";

/**
 * Módulo para manipular a interface do usuário (DOM).
 */

// Estado da paginação
let currentPage = 1;
const ROWS_PER_PAGE = 10;
let fullRankedData = []; // Armazena todos os dados para paginação
let chartInstance = null; // Instância do gráfico
let individualChartInstance = null; // Instância do gráfico individual

/**
 * Mostra a tela de detalhes de uma operadora específica
 * @param {number} operatorId - o ID da operadora a ser exibida
 */
function displayIndividualMetrics(operatorId) {
	// Encontra o objeto completo da operadora no nosso array de dados
	const operatorData = fullRankedData.find(
		(op) => op.numero_operadora == operatorId
	);
	if (!operatorData) return;

	// Atualiza o título da seção e o resumo
	$("#individual-operator-name").text(
		`Métricas de: ${operatorData.nome_operadora}`
	);
	$("#metrics-summary").html(`
        <ul class="list-group list-group-flush">
            <li class="list-group-item"><strong>Nº da Operadora:</strong> ${
				operatorData.numero_operadora
			}</li>
            <li class="list-group-item"><strong>Transações PIX:</strong> ${operatorData.pixTransactions.toLocaleString(
				"pt-BR"
			)}</li>
            <li class="list-group-item"><strong>Transações Débito:</strong> ${operatorData.debitTransactions.toLocaleString(
				"pt-BR"
			)}</li>
            <li class="list-group-item"><strong>Total de Transações:</strong> ${operatorData.totalTransactions.toLocaleString(
				"pt-BR"
			)}</li>
            <li class="list-group-item"><strong>Proporção PIX:</strong> ${(
				operatorData.pixProportion * 100
			).toFixed(2)}%</li>
        </ul>
        <p class="mt-3 text-muted">O gráfico ao lado mostra a proporção de transações. As operações em Débito são potenciais operações em PIX que podem ser convertidas.</p>
    `);

	// Renderiza o gráfico de pizza
	const ctx = document.getElementById("metrics-chart").getContext("2d");
	const data = [operatorData.pixTransactions, operatorData.debitTransactions];

	if (individualChartInstance) {
		individualChartInstance.destroy();
	}

	individualChartInstance = new Chart(ctx, {
		type: "pie",
		data: {
			labels: ["PIX", "Débito"],
			datasets: [
				{
					data: data,
					backgroundColor: [
						"rgba(75, 192, 192, 0.7)",
						"rgba(255, 99, 132, 0.7)",
					],
					borderColor: [
						"rgba(75, 192, 192, 1)",
						"rgba(255, 99, 132, 1)",
					],
					borderWidth: 1,
				},
			],
		},
		options: {
			responsive: true,
			plugins: {
				legend: {
					position: "top",
				},
				title: {
					display: true,
					text: "Proporção de Transações",
				},
			},
		},
	});

	// Finalmente, troca para a view de detalhes
	switchView("#individual-view");
}

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

	let delayed;

	// Cria a nova instância do gráfico
	Chart.defaults.font.size = 14;
	Chart.defaults.font.weight = "bold";
	chartInstance = new Chart(ctx, {
		type: "bar", // Gráfico de barras
		data: {
			labels: labels,
			datasets: [
				{
					label: "Transações Pix",
					data: data,
					backgroundColor: [
						"rgb(75, 192, 192)",
						"rgb(54, 162, 235)",
						"rgb(255, 206, 86)",
					],
					borderColor: [
						"rgba(75, 192, 192)",
						"rgba(54, 162, 235)",
						"rgba(255, 206, 86)",
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
			animation: {
				onComplete: () => {
					delayed = true;
				},
				delay: (context) => {
					let delay = 0;
					if (
						context.type === "data" &&
						context.mode === "default" &&
						!delayed
					) {
						delay =
							context.dataIndex * 300 +
							context.datasetIndex * 100;
					}
					return delay;
				},
			},
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: {
					display: true,
				},
			},
		},
	});
}

/**
 * Renderiza o gráfico de barras com as 3 operadoras do topo por proporção PIX.
 * @param {Array} top3ProportionData - Array com os dados das 3 operadoras do topo por proporção.
 */
function displayTop3ProportionChart(top3ProportionData) {
	const ctx = document
		.getElementById("top3-proportion-chart")
		.getContext("2d");

	// Extrai os nomes e os valores para os eixos do gráfico
	const labels = top3ProportionData.map((op) => op.nome_operadora);
	const data = top3ProportionData.map((op) =>
		(op.pixProportion * 100).toFixed(2)
	); // Proporção em %

	// Destrói qualquer instância anterior do gráfico
	if (window.proportionChartInstance) {
		window.proportionChartInstance.destroy();
	}

	// Cria a nova instância do gráfico
	window.proportionChartInstance = new Chart(ctx, {
		type: "bar",
		data: {
			labels: labels,
			datasets: [
				{
					label: "Proporção PIX (%)",
					data: data,
					backgroundColor: [
						"rgb(255, 99, 132)", // Cor sólida diferente para distinguir
						"rgb(54, 162, 235)",
						"rgb(255, 206, 86)",
					],
					borderColor: [
						"rgb(255, 99, 132)",
						"rgb(54, 162, 235)",
						"rgb(255, 206, 86)",
					],
					borderWidth: 1,
				},
			],
		},
		options: {
			scales: {
				y: {
					beginAtZero: true,
					max: 100, // Máximo 100% para proporção
				},
			},
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: {
					display: true,
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
				<td>${operator.debitTransactions.toLocaleString("pt-BR")}</td>;
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

$(document).on("click", ".view-details-btn", function () {
	const operatorId = $(this).data("operator-id");
	displayIndividualMetrics(operatorId);
});

$(document).on("click", "#back-to-ranking", function () {
	switchView("#ranking-view");
});

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

/**  Listener para o botão de exportar o ranking geral
$(document).on("click", "#export-ranking-pdf", function () {
	exportRankingPDF();
});
*/

$(document).on("click", "#export-ranking-pdf", function () {
	// A variável 'fullRankedData' já contém todos os dados que precisamos
	if (fullRankedData && fullRankedData.length > 0) {
		exportRankingPDF_Native(fullRankedData);
	} else {
		alert("Não há dados para exportar.");
	}
});

// Listener para o botão de exportar o relatório individual
$(document).on("click", "#export-individual-pdf", function () {
	exportIndividualReportPDF();
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

	// --- Gráfico TOP 3 por Transações PIX ---
	const top3 = fullRankedData.slice(0, 3);
	displayTop3Chart(top3);

	// --- Novo: Gráfico TOP 3 por Proporção PIX ---
	const top3Proportion = [...fullRankedData]
		.sort((a, b) => b.pixProportion - a.pixProportion)
		.slice(0, 3);
	displayTop3ProportionChart(top3Proportion);

	renderTablePage();
}
