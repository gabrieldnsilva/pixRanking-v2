import {
	showErrorAlert,
	showUploadStatus,
	showSuccessToast,
} from "../ui/feedbackManager.js";

/* Módulo para gerenciar a leitura e o parsing de arquivos */

/**
 * Lê um arquivo JSON selecionado pelo usuário.
 * @param {File} file - O arquivo JSON a ser lido.
 * @returns {Promise<Object>} Uma promessa que resolve com o conteúdo do arquivo JSON.
 */

export function readJsonFile(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const jsonContent = JSON.parse(event.target.result);
				resolve(jsonContent);
			} catch (error) {
				reject("Erro: O arquivo JSON parece ser inválido.");
			}
		};
		reader.onerror = () => reject("Não foi possível ler o arquivo.");
		reader.readAsText(file);
	});
}

/**
 * Lê um arquivo CSV selecionado pelo usuário usando PapaParse.
 * @param {File} file - O arquivo CSV selecionado no input.
 * @param {Object} columnMap - Mapeamento opcional de nomes de colunas para renomeação.
 * @returns {Promise<Array<Object>>} Uma promessa que resolve com os dados do CSV parseados.
 */
export function readCsvFile(file, type) {
	return new Promise((resolve, reject) => {
		Papa.parse(file, {
			header: true,
			skipEmptyLines: true,
			dynamicTyping: true,
			complete: (results) => {
				// Renomear dinamicamente a coluna "Quantidade" baseada no tipo
				const adjustedData = results.data.map((row) => {
					const newRow = { ...row };

					// Detectar coluna de quantidade
					let quantityValue = null;
					let foundQuantityColumn = null;
					for (const key in newRow) {
						if (key.toLowerCase().includes("quantidade")) {
							quantityValue = newRow[key];
							foundQuantityColumn = key;
							break; // Usa a primeira correspondência
						}
					}

					// Detectar coluna de valor total (apenas para PIX)
					let valueAmount = null;
					let foundValueColumn = null;
					if (type === "pix") {
						for (const key in newRow) {
							if (
								key.toLowerCase().includes("valor") &&
								key.toLowerCase().includes("total")
							) {
								valueAmount = newRow[key];
								foundValueColumn = key;
								break;
							}
						}
					}

					// Se encontrou quantidade, remove a coluna original e renomeia para o tipo específico
					if (quantityValue !== null && foundQuantityColumn) {
						delete newRow[foundQuantityColumn]; // Remove a coluna original

						if (type === "pix") {
							newRow.QuantidadePix = quantityValue;
						} else if (type === "debit") {
							newRow.QuantidadeDebito = quantityValue;
						}
					} else {
						console.warn(
							"Linha sem coluna de quantidade válida:",
							row
						);
					}

					// Se encontrou valor total (PIX), remove a coluna original e renomeia
					if (type === "pix" && foundValueColumn) {
						delete newRow[foundValueColumn];
						newRow.ValorTotalPix = valueAmount || 0;
					} else if (type === "pix") {
						// Coluna valor não encontrada - define como 0 para retrocompatibilidade
						newRow.ValorTotalPix = 0;
					}

					return newRow;
				});
				console.log(`CSV ${type} parseado e ajustado:`, adjustedData);
				resolve(adjustedData);
			},
			error: (error) => {
				reject("Erro ao parsear o arquivo CSV: " + error.message);
			},
		});
	});
}

// Classe para gerenciar os dados da aplicação
export class DataManager {
	constructor() {
		this.operators = [];
		this.pixData = [];
		this.debitData = [];
	}
}

export function loadInitialOperators(
	appData,
	checkAndProcessData,
	updateUploadStatus,
	isStatusModalOpen
) {
	$.getJSON("php/core/ranking_operadoras.php")
		.done(function (data) {
			appData.operators = data;
			showSuccessToast("Operadoras carregadas do servidor");
			if (isStatusModalOpen) updateUploadStatus("operators");
			checkAndProcessData();
			const $label = $("label[for='json-upload'] span");
			$label.text("Operadoras Carregadas");
			$label.parent().addClass("loaded");
			$label
				.siblings("i")
				.removeClass("ri-database-2-line")
				.addClass("ri-database-2-fill");
		})
		.fail(function () {
			// fallback original (JSON local)
			$.getJSON("data/operators.json")
				.done(function (data) {
					appData.operators = data;
					showSuccessToast("Operadores carregados");
					if (isStatusModalOpen) updateUploadStatus("operators");
					checkAndProcessData();
					const $label = $("label[for='json-upload'] span");
					$label.text("Operadores Carregados");
					$label.parent().addClass("loaded");
					$label
						.siblings("i")
						.removeClass("ri-database-2-line")
						.addClass("ri-database-2-fill");
				})
				.fail(function () {
					console.warn(
						"data/operators.json não encontrado. Aguardando upload manual."
					);
				});
		});
}
