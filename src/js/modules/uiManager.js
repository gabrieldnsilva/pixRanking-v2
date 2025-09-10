/**
 * Módulo para manipular a interface do usuário (DOM).
 */

/**
 * Limpa a tabela e exibe os novos dados do ranking.
 * @param {Array} rankedData - O array de operadoras proessado e ordenado.
 */

export function displayRanking(rankedData) {
	const $rankingBody = $("#ranking-body");
	$rankingBody.empty(); // Limpa quaisquer dados antigos da tabela

	if (!rankedData || rankedData.length === 0) {
		const emptyRow = `<tr><td colspan="6" class="text-center">Nenhum dado para exibir. Carregue os arquivos.</td></tr>`;
		$rankingBody.html(emptyRow);
		return;
	}

	rankedData.forEach((operator, index) => {
		const rank = index + 1;

		const pixPercentage = (operator.pixProportion * 100).toFixed(2) + "%";

		const row = `
            <tr>
                <td><strong>${rank}</strong></td>
                <td>${operator.nome_operadora}</td>
                <td>${operator.numero_operadora}</td>
                <td>${operator.pixTransactions.toLocaleString("pt-BR")}</td>
                <td>${pixPercentage}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-details-btn" data-operator-id="${
						operator.numero_operadora
					}">
                        <i class="ri-pie-chart-line"></i> Detalhes
                    </button>
                </td>
            </tr>
        `;
		$rankingBody.append(row);
	});
}
