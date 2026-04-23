/**
 * Gerencia o período para exportação de PDF
 */
import { showErrorAlert } from "../ui/feedbackManager.js";

let pdfPeriod = null;

/**
 * Inicializa o modal de período para PDF
 * @param {function} onConfirm Callback quando o período é confirmado
 */
export function initPdfPeriodModal(onConfirm) {
	// Abrir modal e limitar datas até o dia atual
	$(document).on("show.bs.modal", "#pdfPeriodModal", function () {
		const today = new Date().toISOString().split("T")[0];
		$("#pdf-data-inicial, #pdf-data-final").attr("max", today).val("");
	});

	// Manipula o envio do formulário
	$(document)
		.off("$submit", "#pdf-period-form")
		.on("submit", "#pdf-period-form", function (e) {
			e.preventDefault();

			const dataInicial = $("#pdf-data-inicial").val();
			const dataFinal = $("#pdf-data-final").val();

			const today = new Date().toISOString().split("T")[0];
			if (
				!dataInicial ||
				!dataFinal ||
				dataInicial > today ||
				dataFinal > today ||
				dataInicial > dataFinal
			) {
				showErrorAlert(
					"Verifique as datas informadas. Data inicial deve ser menor ou igual à final e não podem ser futuras.",
				);
				return;
			}

			pdfPeriod = {
				start: dataInicial,
				end: dataFinal,
			};

			const ModalEl = document.getElementById("pdfPeriodModal");
			const modal = bootstrap.Modal.getInstance(ModalEl);
			modal.hide();

			if (typeof onConfirm === "function") {
				onConfirm(pdfPeriod);
			}
		});
}

/**
 * Abre o modal de período para PDF
 */
export function showPdfPeriodModal() {
	const modalEl = document.getElementById("pdfPeriodModal");
	const modal = new bootstrap.Modal(modalEl);
	modal.show();
}

/**
 * Retorna o período armazenado
 */
export function getPdfPeriod() {
	return pdfPeriod;
}

/**
 * Define o período externamente (ex: ao carregar relatório salvo)
 */
export function setPdfPeriod(period) {
	pdfPeriod = period;
}
