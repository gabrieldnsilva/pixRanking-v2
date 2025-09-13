/**
 * Módulo para gerenciar a exportação de relatórios em PDF.
 * Usa as bibliotecas jsPDF e html2canvas.
 */

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
	const rankingCard = document.querySelector("#ranking-view .card-body");

	Swal.fire({
		title: "Gerando PDF...",
		text: "Por favor, aguarde enquanto o relatório é criado.",
		allowOutsideClick: false,
		didOpen: () => {
			Swal.showLoading();
		},
	});

	// Usa window.html2canvas para garantir que estamos pegando a biblioteca global
	window.html2canvas(rankingCard, { scale: 1.5 }).then((canvas) => {
		// CORREÇÃO: A forma correta de instanciar o jsPDF quando carregado via script
		const doc = new window.jspdf.jsPDF({
			orientation: "p",
			unit: "mm",
			format: "a4",
		});

		const imgData = canvas.toDataURL("image/jpeg, 0.9");
		const imgProps = doc.getImageProperties(imgData);
		const pdfWidth = doc.internal.pageSize.getWidth();
		const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

		// Limita a altura da imagem para não ultrapassar a página
		const pageHeightLimit = doc.internal.pageSize.getHeight() - 30; // Subtrai margens
		const finalHeight =
			pdfHeight > pageHeightLimit ? pageHeightLimit : pdfHeight;

		doc.addImage(imgData, "JPEG", 0, 20, pdfWidth, finalHeight);

		addHeaderAndFooter(doc);
		doc.save("ranking_operadoras.pdf");

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

	window.html2canvas(reportCard, { scale: 1.5 }).then((canvas) => {
		// CORREÇÃO: A forma correta de instanciar o jsPDF
		const doc = new window.jspdf.jsPDF({
			orientation: "p",
			unit: "mm",
			format: "a4",
		});

		const imgData = canvas.toDataURL("image/jpeg, 0.9");
		const imgProps = doc.getImageProperties(imgData);
		const pdfWidth = doc.internal.pageSize.getWidth();
		const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
		const pageHeightLimit = doc.internal.pageSize.getHeight() - 30;
		const finalHeight =
			pdfHeight > pageHeightLimit ? pageHeightLimit : pdfHeight;

		doc.addImage(imgData, "JPEG", 0, 20, pdfWidth, finalHeight);

		addHeaderAndFooter(doc);
		doc.save(
			`relatorio_${operatorName.replace("Métricas de: ", "").trim()}.pdf`
		);

		Swal.close();
	});
}
