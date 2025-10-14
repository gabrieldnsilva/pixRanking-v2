/**
 * Módulo para salvar relatórios no histórico do sistema
 */
import {
	showSuccessAlert,
	showErrorAlert,
	showLoading,
	closeAlert,
} from "../ui/feedbackManager.js";

let currentAppData = null;

/**
 * Inicializa o módulo de salvamento de relatórios
 * @param {Object} appData - Referência ao estado central da aplicação
 */
export function initReportSaver(appData) {
	// Abre o modal ao clicar no botão
	$(document)
		.off("click", "#save-report-btn")
		.on("click", "#save-report-btn", function () {
			const today = new Date().toISOString().split("T")[0];
			$("#data-inicial, #data-final").attr("max", today);
			$("#saveReportModal").modal("show");
		});

	// Submissão do formulário
	$(document)
		.off("submit", "#save-report-form")
		.on("submit", "#save-report-form", async function (e) {
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

			if (
				!currentAppData ||
				!currentAppData.operators ||
				!currentAppData.pixData ||
				!currentAppData.debitData
			) {
				showErrorAlert(
					"Dados incompletos. Carregue todos os arquivos antes de salvar."
				);
				return;
			}

			// Salva os dados PRIMÁRIOS (sanitizados) que permitirão recriar o relatório
			const dados_relatorio = {
				operators: currentAppData.operators.map((op) => ({
					numero_operadora: parseInt(op.numero_operadora),
					nome_operadora: String(op.nome_operadora).trim(),
				})),
				pixData: currentAppData.pixData.map((pix) => ({
					Operador: parseInt(pix.Operador),
					QuantidadePix: parseInt(pix.QuantidadePix || 0),
				})),
				debitData: currentAppData.debitData.map((debit) => ({
					Operador: parseInt(debit.Operador),
					QuantidadeDebito: parseInt(debit.QuantidadeDebito || 0),
				})),
			};

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
				if (resp && resp.success === true) {
					showSuccessAlert("Relatório salvo com sucesso!");
					$("#saveReportModal").modal("hide");
					$("#save-report-form")[0].reset();
				} else {
					showErrorAlert(
						(resp && resp.message) || "Erro ao salvar relatório."
					);
				}
			} catch (err) {
				closeAlert();
				showErrorAlert("Erro ao salvar relatório.");
			}
		});
}

/**
 * Atualiza os dados completos da aplicação para salvamento
 * @param {Object} appData - Estado completo da aplicação (operators, pixData, debitData)
 */
export function updateCurrentAppData(appData) {
	currentAppData = appData;
	const hasAllData = !!(
		appData &&
		appData.operators &&
		appData.pixData &&
		appData.debitData
	);
	$("#save-report-btn").prop("disabled", !hasAllData);
}
