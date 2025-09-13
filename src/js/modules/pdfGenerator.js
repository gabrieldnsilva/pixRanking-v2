/**
 * Módulo para gerenciar a exportação de relatórios em PDF.
 * Usa as bibliotecas jsPDF e html2canvas.
 */

// Desestruturação das bibliotecas necessárias
const { jsPDF } = window.jspdf;

/**
 * Adicionar um cabeçalho a rodapé padrão ao documento PDF.
 * @ {jsPDF} doc = A instância do jsPDF.
 */

function addHeaderAndFooter(doc) {
	const pageCount = doc.internal.getNumberOfPages();
	const pageWidth = doc.internal.pageSize.getWidth();
	const pageHeight = doc.internal.pageSize.getHeight();

	for (let i = 1; i <= pageCount; i++) {
		doc.setPage(i);

		// Cabeçalho
		doc.setFontSize(12);
		doc.setTextColor(40);
		doc.text("Relatório de Performance de Operadoras", pageWidth / 2, 15, {
			align: "center",
		});

		// Rodapé
		doc.setFontSize(8);
		doc.setTextColor(100);
		const footerText = `Página ${i} de ${pageCount} | Gerado em: ${new Date().toLocaleDateString(
			"pt-BR"
		)}`;
		doc.text(footerText, pageWidth / 2, pageHeight - 10, {
			align: "center",
		});
	}
}

/**
 * Exporta a visão principal do ranking para um arquivo PDF.
 */
export function exportRankingPDF() {
	// Seleciona os elementos que serão capturados
	const rankingCard = document.querySelector("ranking-view .card-body");
	const chartCanvas = document.querySelector("#top-3-chart");

	// Mostra um feedback para o usuário
	Swal.fire({
		title: "Gerando PDF...",
		text: "Por favor, aguarde enquanto o relatório é gerado.",
		allowOutsideClick: false,
		didOpen: () => {
			Swal.showLoading();
		},
	});

	html2canvas(rankingCard, { scale: 2 }).then((canvas) => {
		const doc = new jsPDF({
			orientation: "p",
			unit: "mm",
			format: "a4",
		});

		const imgData = canvas.toDataURL("image/png");
		const imgProps = doc.getImageProperties(imgData);
		const pdfWidth = doc.internal.pageSize.getWidth();
		const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

		doc.addImage(imgData, "PNG", 0, 20, pdfWidth, pdfHeight);

		addHeaderAndFooter(doc);
		doc.save("relatorio_ranking_pix.pdf");

		Swal.close();
	});
}

/**
 * Exporta a visão de métricas individuais para um arquivo PDF.
 */
export function exportIndividualReportPDF() {
	const reportCard = document.querySelector("#individual-view .card-body");
	const operatorName = document.querySelector(
		"#individual-operator-name"
	).innerText;

	Swal.fire({
		title: "Gerando Relatório...",
		text: "Aguarde enquanto o relatório individual é criado.",
		allowOutsideClick: false,
		didOpen: () => {
			Swal.showLoading();
		},
	});

	html2canvas(reportCard, { scale: 2 }).then((canvas) => {
		const doc = new jsPDF({
			orientation: "p",
			unit: "mm",
			format: "a4",
		});

		const imgData = canvas.toDataURL("image/png");
		const imgProps = doc.getImageProperties(imgData);
		const pdfWidth = doc.internal.pageSize.getWidth();
		const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

		doc.addImage(imgData, "PNG", 0, 20, pdfWidth, pdfHeight);

		addHeaderAndFooter(doc);
		doc.save(`relatorio_${operatorName.replace("Métricas de: ", "")}.pdf`);

		Swal.close();
	});
}
