import { toNumberStrict } from "../utils/numbers.js";
/**
 * Módulo para processar e analisar os dados das operadoras.
 */

/**
 * Combina os dados, calcula métricas e cria o ranking
 * @param {Object} data - Um objeto contendo { operators, pixData, debitData }.
 * @returns {Array} Um array de operadoras ordenado por transações PIX.
 */

export function processAndRankData({ operators, pixData, debitData }) {
	// Map armazena objeto com quantidade e valor para cada operadora
	const pixMap = new Map(
		pixData.map((item) => [
			item.Operador,
			{
				quantidade: toNumberStrict(item.QuantidadePix),
				valor: toNumberStrict(item.ValorTotalPix) || 0,
			},
		])
	);
	const debitMap = new Map(
		debitData.map((item) => [
			item.Operador,
			toNumberStrict(item.QuantidadeDebito),
		])
	);

	// Alimentar os dados das operadoras com as transações e cálculos
	const processedData = operators.map((op) => {
		const pixData = pixMap.get(op.numero_operadora) || {
			quantidade: 0,
			valor: 0,
		};
		const pixCount = pixData.quantidade;
		const pixValue = pixData.valor;
		const debitCount = debitMap.get(op.numero_operadora) || 0;
		const totalTransactions = pixCount + debitCount;

		return {
			...op,
			pixTransactions: pixCount,
			pixValue: toNumberStrict(pixValue),
			debitTransactions: debitCount,
			totalTransactions: totalTransactions,
			pixProportion:
				totalTransactions > 0 ? pixCount / totalTransactions : 0,
		};
	});

	processedData.sort((a, b) => b.pixTransactions - a.pixTransactions);

	return processedData;
}
