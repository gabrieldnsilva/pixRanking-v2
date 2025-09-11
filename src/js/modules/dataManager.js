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
 * @returns {Promise<Array<Object>>} Uma promessa que resolve com os dados do CSV parseados.
 */
export function readCsvFile(file) {
	return new Promise((resolve, reject) => {
		Papa.parse(file, {
			header: true,
			skipEmptyLines: true,
			dynamicTyping: true,
			complete: (results) => {
				console.log("CSV parseado:", results.data);
				resolve(results.data);
			},
			error: (error) => {
				reject("Erro ao parsear o arquivo CSV: " + error.message);
			},
		});
	});
}
