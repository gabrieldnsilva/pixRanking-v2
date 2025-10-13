/**
 * Módulo para salvar relatórios no histórico do sistema
 */
import {
	showSuccessAlert,
	showErrorAlert,
	showLoading,
	closeAlert,
} from "../ui/feedbackManager.js";

let currentRankedData = null;

/**
 * Inicializa o módulo de salvamento de relatórios
 * @param {Object} appData - Referência ao estado central da aplicação
 */
export function initReportSaver(appData) {
	// Abre o modal ao clicar no botão
	$(document).on("click", "#save-report-btn", function () {
		const today = new Date().toISOString().split("T")[0];
		$("#data-inicial, #data-final").attr("max", today);
		$("#saveReportModal").modal("show");
	});

	// Submissão do formulário
	$(document).on("submit", "#save-report-form", async function (e) {
		e.preventDefault();

		const data_inicial = $("#data-inicial").val();
		const data_final = $("#data-final").val();

		// Validação extra: datas não podem ser futuras e inicial <= final
		const today = new Date().toISOString().split("T")[0];
		if (
			!data_inicial ||
			!data_final ||
			data_inicial > today ||
			data_final > today ||
			data_inicial > data_final
		) {
			showErrorAlert("Verifique as datas informadas.");
			return;
		}

		// Usa os dados do ranking atual armazenados no módulo
		const dados_relatorio = (currentRankedData || []).map((r) => ({
			numero_operadora: r.numero_operadora,
			nome_operadora: r.nome_operadora,
			pixTransactions: r.pixTransactions || 0,
			debitTransactions: r.debitTransactions || 0,
			totalTransactions:
				r.totalTransactions ||
				(r.pixTransactions || 0) + (r.debitTransactions || 0),
			pixProportion:
				r.totalTransactions > 0
					? (r.pixTransactions || 0) / (r.totalTransactions || 1)
					: r.pixProportion || 0,
		}));

		showLoading("Salvando relatório...");

		try {
			const resp = await $.ajax({
				url: "/php/views/save_report.php",
				type: "POST",
				contentType: "application/json",
				data: JSON.stringify({
					data_inicial,
					data_final,
					dados_relatorio,
				}),
				dataType: "json",
			});
			closeAlert();
			if (resp.success) {
				showSuccessAlert("Relatório salvo com sucesso!");
				$("#saveReportModal").modal("hide");
				// Limpa o formulário
				$("#save-report-form")[0].reset();
			} else {
				showErrorAlert(resp.message || "Erro ao salvar relatório.");
			}
		} catch (err) {
			closeAlert();
			showErrorAlert("Erro ao salvar relatório.");
		}
	});
}

/**
 * Atualiza os dados do ranking atual para salvamento
 * @param {Array} rankedData - Dados do ranking processado
 */
export function updateCurrentRankedData(rankedData) {
	currentRankedData = rankedData;
	// Habilita o botão de salvar quando há dados
	$("#save-report-btn").prop(
		"disabled",
		!rankedData || rankedData.length === 0
	);
}
