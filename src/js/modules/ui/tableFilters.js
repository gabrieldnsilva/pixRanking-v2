/**
 * Módulo para gerenciar filtros de ordenação nas tabelas de ranking.
 * Mantém estado de ordenação e aplica transformações aos dados.
 */

export class TableFilter {
	constructor() {
		this.currentSort = {
			column: "pixTransactions",
			direction: "desc",
		};
		this.searchTerm = "";
	}

	/**
	 * ✅ NOVO: Converte valor para número (trata strings monetárias)
	 * @param {any} value - Valor a ser convertido
	 * @returns {number} Valor numérico
	 */
	parseNumericValue(value) {
		if (typeof value === "number") return value;
		if (typeof value === "string") {
			// Remove "R$", pontos de milhar e troca vírgula por ponto
			const cleaned = value.replace(/[R$\s.]/g, "").replace(",", ".");
			const parsed = parseFloat(cleaned);
			return isNaN(parsed) ? 0 : parsed;
		}
		return 0;
	}

	/**
	 * Ordena os dados com base no critério atual
	 * @param {Array} data - Dados do ranking a serem ordenados
	 * @returns {Array} Dados ordenados (nova cópia)
	 */
	applySort(data) {
		if (!Array.isArray(data) || data.length === 0) return [];

		const sortedData = [...data];
		const { column, direction } = this.currentSort;
		const multiplier = direction === "asc" ? 1 : -1;

		sortedData.sort((a, b) => {
			// ✅ CORRIGIDO: Converte valores antes de comparar
			const valueA = this.parseNumericValue(a[column] ?? 0);
			const valueB = this.parseNumericValue(b[column] ?? 0);
			return (valueA - valueB) * multiplier;
		});

		return sortedData;
	}

	/**
	 * ✅ NOVO: Aplica filtro de busca nos dados
	 * @param {Array} data - Dados a serem filtrados
	 * @returns {Array} Dados filtrados por termo de busca
	 */
	applySearch(data) {
		if (!this.searchTerm.trim()) return data;

		const term = this.searchTerm.toLowerCase();
		return data.filter(
			(item) =>
				item.nome_operadora.toLowerCase().includes(term) ||
				String(item.numero_operadora).includes(term)
		);
	}

	/**
	 * ✅ NOVO: Aplica ordenação + busca em cadeia (composição de filtros)
	 * @param {Array} data - Dados originais
	 * @returns {Array} Dados filtrados e ordenados
	 */
	applyAll(data) {
		let result = [...data];
		result = this.applySearch(result); // 1º: Busca
		result = this.applySort(result); // 2º: Ordenação
		return result;
	}

	/**
	 * ✅ NOVO: Define termo de busca
	 * @param {string} term - Termo de busca
	 */
	setSearchTerm(term) {
		this.searchTerm = String(term || "").trim();
	}

	/**
	 * ✅ NOVO: Limpa termo de busca
	 */
	clearSearch() {
		this.searchTerm = "";
	}

	/**
	 * Alterna a direção da ordenação para a mesma coluna
	 * @param {string} column - Nome da coluna
	 */
	toggleSort(column) {
		if (this.currentSort.column === column) {
			this.currentSort.direction =
				this.currentSort.direction === "asc" ? "desc" : "asc";
		} else {
			this.currentSort = { column, direction: "desc" };
		}
	}

	/**
	 * Retorna o estado atual da ordenação
	 * @returns {{column: string, direction: string}}
	 */
	getCurrentSort() {
		return { ...this.currentSort };
	}

	/**
	 * Reseta para ordenação padrão (PIX DESC) e limpa busca
	 */
	reset() {
		this.currentSort = { column: "pixTransactions", direction: "desc" };
		this.searchTerm = "";
	}

	// ✅ MANTÉM MÉTODOS PARA EXPANSÃO FUTURA (não usados no MVP)
	applyRangeFilter(data, column, min, max) {
		return data.filter(
			(item) => item[column] >= min && item[column] <= max
		);
	}

	applySorts(data, sorts) {
		return data.sort((a, b) => {
			for (const { column, direction } of sorts) {
				const diff =
					(a[column] - b[column]) * (direction === "asc" ? 1 : -1);
				if (diff !== 0) return diff;
			}
			return 0;
		});
	}
}
