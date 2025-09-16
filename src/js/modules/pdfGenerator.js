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

/**
 * TÉCNICA AVANÇADA: Exporta o ranking gerando um PDF nativo com texto e tabelas vetoriais.
 * Requer o plugin jspdf-autotable.
 * @param {Array} rankedData - O array completo com os dados do ranking.
 */
export function exportRankingPDF_Native(rankedData) {
	// 1. Feedback inicial para o usuário
	Swal.fire({
		title: "Gerando PDF...",
		allowOutsideClick: false,
		didOpen: () => {
			Swal.showLoading();
		},
	});

	// 2. Cria uma nova instância do jsPDF
	const doc = new window.jspdf.jsPDF({
		orientation: "p",
		unit: "mm",
		format: "a4",
	});

	// 3. Adiciona o Título Principal
	doc.setFontSize(18);
	doc.setTextColor(40);
	doc.text(
		"Ranking de Performance de Operadoras",
		doc.internal.pageSize.getWidth() / 2,
		22,
		{ align: "center" }
	);

	// 4. Adiciona legendas para os gráficos
	doc.setFontSize(12);
	doc.text("Análise Gráfica - TOP 3 Operadoras", 14, 32), { align: "center" };

	// 5. Captura e adiciona os gráficos lado a lado
	const chartCanvas1 = document.getElementById("top3-chart");
	const chartCanvas2 = document.querySelector("#top3-proportion-chart");

	if (chartCanvas1 && chartCanvas2) {
		// Pega a imagem do gráfico em alta qualidade
		const chartImage1 = chartCanvas1.toDataURL("image/png", 1);
		const chartImage2 = chartCanvas2.toDataURL("image/png", 1);

		const chartWidth = 88.5;
		const chartHeight = 60;
		const startYCharts = 42;

		// Adiciona Legenda e gráfico 1 (Transações PIX)
		doc.setFontSize(10);
		doc.addImage(
			chartImage1,
			"PNG",
			14,
			startYCharts,
			chartWidth,
			chartHeight
		);
		// Adiciona legenda e gráfico 2 (Proporção PIX) ao lado
		doc.addImage(
			chartImage2,
			"PNG",
			14 + chartWidth + 5,
			startYCharts,
			chartWidth,
			chartHeight
		);

		// 6. Gera a tabela TOP 20
		doc.setFontSize(12);
		const startYTableTitle = startYCharts + chartHeight + 12; // Posição Y abaixo dos gráficos
		doc.text("Top 20 Operadoras - Ranking PIX", 14, startYTableTitle);

		// Filtra para pegar apenas os 20 primeiros
		const top20Data = rankedData.slice(0, 20);

		const head = [["Pos.", "Operadora", "Nº", "Trans. PIX", "Prop. PIX"]];
		const body = top20Data.map((op, i) => [
			i + 1,
			op.nome_operadora,
			op.numero_operadora,
			op.pixTransactions.toLocaleString("pt-BR"),
			`${(op.pixProportion * 100).toFixed(2)}%`,
		]);

		// Verifica se autoTable está disponível
		if (typeof doc.autoTable === "function") {
			doc.autoTable({
				head: head,
				body: body,
				startY: startYTableTitle + 4,
				theme: "grid",
				styles: { fontSize: 8, cellPadding: 1.5 },
				headStyles: {
					fillColor: [41, 128, 185],
					textColor: 255,
					fontStyle: "bold",
				},
			});
		} else {
			console.error(
				"autoTable não está disponível. Verifique o carregamento do plugin."
			);
		}

		// 7. Adiciona cabeçalho e rodapé
		addHeaderAndFooter(doc);

		// 8. Salva o arquivo
		doc.save("ranking_top20_operadoras.pdf");
		Swal.close();
	} else {
		console.error("Gráficos não encontrados no DOM.");
		Swal.fire("Erro", "Gráficos não puderam ser capturados.", "error");
	}
}
