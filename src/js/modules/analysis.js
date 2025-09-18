/**
 * Módulo para processar e analisar os dados das operadoras.
 */

/**
 * Combina os dados, calcula métricas e cria o ranking
 * @param {Object} data - Um objeto contendo { operators, pixData, debitData }.
 * @returns {Array} Um array de operadoras ordenado por transações PIX.
 */

export function processAndRankData({ operators, pixData, debitData }) {
	const pixMap = new Map(
		pixData.map((item) => [item.Operador, item.QuantidadePix || 0])
	);
	const debitMap = new Map(
		debitData.map((item) => [item.Operador, item.QuantidadeDebito || 0])
	);

	// Alimentar os dados das operadoras com as transações e cálculos
	const processedData = operators.map((op) => {
		const pixCount = pixMap.get(op.numero_operadora) || 0;
		const debitCount = debitMap.get(op.numero_operadora) || 0;
		const totalTransactions = pixCount + debitCount;

		return {
			...op,
			pixTransactions: pixCount,
			debitTransactions: debitCount,
			totalTransactions: totalTransactions,
			pixProportion:
				totalTransactions > 0 ? pixCount / totalTransactions : 0,
		};
	});

	processedData.sort((a, b) => b.pixTransactions - a.pixTransactions);

	return processedData;
}
