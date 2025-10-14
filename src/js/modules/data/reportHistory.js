/**
 * Histórico de relatórios salvos: lista e carrega
 */
import {
	showErrorAlert,
	showLoading,
	closeAlert,
} from "../ui/feedbackManager.js";

export function initReportHistory({ onLoadReport }) {
	// Abrir modal e carregar lista
	$(document)
		.off("click", "#open-saved-reports")
		.on("click", "#open-saved-reports", async function () {
			try {
				showLoading("Carregando relatórios...");
				const resp = await $.getJSON(
					"/php/views/list_saved_reports.php"
				);

				if (!resp?.success) {
					closeAlert();
					showErrorAlert(
						resp?.message || "Não foi possível listar relatórios."
					);
					return;
				}

				renderList(resp.data || []);
				$("#savedReportsModal").modal("show");
				closeAlert(); // Fechar o alerta após a renderização
			} catch (e) {
				closeAlert();
				showErrorAlert("Erro ao listar relatórios.");
			}
		});

	// Carregar um relatório
	$(document)
		.off("click", ".btn-load-report")
		.on("click", ".btn-load-report", async function () {
			const id = $(this).data("id");
			if (!id) return;

			try {
				showLoading("Carregando relatório...");
				const resp = await $.getJSON(
					`/php/views/load_saved_report.php?id=${id}`
				);

				if (!resp?.success) {
					closeAlert();
					showErrorAlert(
						resp?.message ||
							"Não foi possível carregar o relatório."
					);
					return;
				}

				const appData = {
					operators: resp.data.operators || [],
					pixData: resp.data.pixData || [],
					debitData: resp.data.debitData || [],
				};

				$("#savedReportsModal").modal("hide");
				closeAlert(); // Fechar o alerta após carregar o relatório
				onLoadReport(appData, resp.data); // callback do orquestrador
			} catch (e) {
				closeAlert();
				showErrorAlert("Erro ao carregar o relatório.");
			}
		});
}

function renderList(items) {
	const tbody = $("#saved-reports-tbody");
	tbody.empty();

	if (!items.length) {
		tbody.append(
			`<tr><td colspan="5" class="text-center">Nenhum relatório salvo.</td></tr>`
		);
		return;
	}

	items.forEach((r) => {
		const period = `${r.data_inicial} → ${r.data_final}`;
		const gen = new Date(r.data_geracao).toLocaleString("pt-BR");
		tbody.append(`
            <tr>
                <td>#${r.id}</td>
                <td>${period}</td>
                <td>${gen}</td>
                <td>${r.generated_by || "-"}</td>
                <td><button class="btn btn-sm btn-primary btn-load-report" data-id="${
					r.id
				}">
                    <i class="ri-eye-line"></i> Carregar
                </button></td>
            </tr>
        `);
	});
}
