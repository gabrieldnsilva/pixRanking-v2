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

					let quantityValue = null;
					let foundColumn = null;
					for (const key in newRow) {
						if (key.toLowerCase().includes("quantidade")) {
							quantityValue = newRow[key];
							foundColumn = key;
							break; // Usa a primeira correspondência
						}
					}

					// Se encontrou, remove a coluna original e renomeia para o tipo específico
					if (quantityValue !== null && foundColumn) {
						delete newRow[foundColumn]; // Remove a coluna original

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

export function loadInitialOperators( // Lembrar de commitar alteração
	appData,
	checkAndProcessData,
	updateUploadStatus,
	isStatusModalOpen
) {
	$.getJSON("data/operators.json")
		.done(function (data) {
			// Se bem-sucedido
			appData.operators = data;

			// Feedback sutil de dados carregados
			showSuccessToast("Operadores carregados");

			if (isStatusModalOpen) {
				updateUploadStatus("operators");
			}
			checkAndProcessData();

			// Atualiza a UI para refletir o carregamento
			const $label = $("label[for='json-upload'] span");
			$label.text("Operadores Carregados");
			$label.parent().addClass("loaded");
			$label
				.siblings("i")
				.removeClass("ri-database-2-line")
				.addClass("ri-database-2-fill");
		})
		.fail(function () {
			// Falha. Provavelmente o arquivo não existe.
			console.warn(
				"data/operators.json não encontrado. Aguardando upload manual."
			);
		});
}
