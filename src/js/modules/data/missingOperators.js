// Detecta operadores presentes nos CSVs (pix/débito) que não existem em operators.json
// Boas práticas: funções puras, nomes claros, sem efeitos colaterais, validação defensiva.

/**
 * Converte uma lista de operadoras conhecidas em um Set de números.
 * @param {Array<{numero_operadora:number}>} operators
 * @returns {Set<number>}
 */
function knownOperatorSet(operators) {
	if (!Array.isArray(operators)) return new Set();
	const ids = operators
		.map((op) => parseInt(op?.numero_operadora))
		.filter((n) => Number.isInteger(n));
	return new Set(ids);
}

/**
 * Extrai o conjunto de operadores referenciados nos CSVs (PIX/Débito).
 * @param {Array<{Operador:number}>} pixData
 * @param {Array<{Operador:number}>} debitData
 * @returns {Set<number>}
 */
function csvOperatorSet(pixData, debitData) {
	const s = new Set();
	[pixData, debitData].forEach((arr) => {
		if (!Array.isArray(arr)) return;
		for (const r of arr) {
			const id = parseInt(r?.Operador);
			if (Number.isInteger(id)) s.add(id);
		}
	});
	return s;
}

/**
 * Encontra IDs de operadoras presentes nos CSVs e ausentes no operators.json.
 * @param {{operators:Array, pixData:Array, debitData:Array}} appData
 * @returns {number[]} lista ordenada de IDs ausentes
 */
export function findMissingOperatorNumbers(appData) {
	if (!appData || typeof appData !== "object") return [];
	const known = knownOperatorSet(appData.operators || []);
	const fromCsv = csvOperatorSet(
		appData.pixData || [],
		appData.debitData || []
	);
	const missing = [];
	for (const id of fromCsv) {
		if (!known.has(id)) missing.push(id);
	}
	return missing.sort((a, b) => a - b);
}

/**
 * Retorna linhas dos CSVs cujo Operador não está cadastrado.
 * Útil para auditar dados e montar um CSV de "pendências".
 * @param {{operators:Array, pixData:Array, debitData:Array}} appData
 * @returns {{ unknownPix: Array, unknownDebit: Array }}
 */
export function listUnknownOperatorRows(appData) {
	if (!appData || typeof appData !== "object")
		return { unknownPix: [], unknownDebit: [] };

	const known = knownOperatorSet(appData.operators || []);

	const unknownPix = Array.isArray(appData.pixData)
		? appData.pixData.filter((r) => !known.has(parseInt(r?.Operador)))
		: [];

	const unknownDebit = Array.isArray(appData.debitData)
		? appData.debitData.filter((r) => !known.has(parseInt(r?.Operador)))
		: [];

	return { unknownPix, unknownDebit };
}

/**
 * Utilitário para gerar uma string amigável do resumo das pendências.
 * @param {number[]} ids
 * @returns {string}
 */
export function formatMissingSummary(ids) {
	if (!Array.isArray(ids) || ids.length === 0) return "Nenhuma pendência";
	return `${ids.length} não cadastradas: ${ids.join(", ")}`;
}

/**
 * Gera um resumo detalhado com contadores de transações por operadora ausente.
 * @param {{operators:Array, pixData:Array, debitData:Array}} appData
 * @returns {Array<{id:number, pixCount:number, debitCount:number, total:number}>}
 */
export function getMissingOperatorsDetail(appData) {
	if (!appData || typeof appData !== "object") return [];

	const missing = findMissingOperatorNumbers(appData);
	if (missing.length === 0) return [];

	const detail = missing.map((id) => {
		const pixCount = (appData.pixData || []).filter(
			(r) => parseInt(r?.Operador) === id
		).length;
		const debitCount = (appData.debitData || []).filter(
			(r) => parseInt(r?.Operador) === id
		).length;

		return {
			id,
			pixCount,
			debitCount,
			total: pixCount + debitCount,
		};
	});

	return detail.sort((a, b) => b.total - a.total);
}
