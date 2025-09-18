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
					if (newRow.Quantidade !== undefined) {
						if (type === "pix") {
							newRow.QuantidadePix = newRow.Quantidade;
						} else if (type === "debit") {
							newRow.QuantidadeDebito = newRow.Quantidade;
						}
						delete newRow.Quantidade; // Remove a coluna original para evitar confusão
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
