import { readJsonFile, readCsvFile } from "./modules/dataManager";
import { processAndRankData } from "./modules/analysis";
import { displayRanking } from "./modules/uiManager";
import { sidebarToggle } from "./modules/sidebarToggle";

// Inicializa o toggle da sidebar
sidebarToggle();

// Lógica do Dashboard

// Objeto para
let appData = {
	operators: null,
	pixData: null,
	debitData: null,
};

// Checa se todos os dados foram carregados
function checkAndProcessData() {
	if (appData.operators && appData.pixData && appData.debitData) {
		console.log("Todos os dados carregados. Processando...");
		try {
			const rankedData = processAndRankData(appData);
			displayRanking(rankedData);

			// Habilita agora o botão de exportação
			$("export-ranking-btn").prop("disabled", false);
		} catch (error) {
			console.error("Erro ao processar os dados:", error);
			alert(
				"Ocorreu um erro ao processar os dados. Verifique o console para mais detalhes."
			);
		}
	}
}

/**
 * Função genérica para configurar o listener de upload de arquivo. (Otimização DRY)
 * @param {string} selector - O seletor jQuery para o input de arquivo (ex: '#json-upload').
 * @param {function} readerFunction - A função que lerá o arquivo (ex: readJsonFile).
 * @param {string} dataKey - A chave para salvar os dados em `appData` (ex: 'operators').
 * @param {string} logMessage - A mensagem para exibir no console após o sucesso.
 */
function setupFileUploadListener(
	selector,
	readerFunction,
	dataKey,
	logMessage
) {
	$(selector).on("change", function (event) {
		const file = event.target.files[0];
		if (!file) return;

		readerFunction(file)
			.then((data) => {
				console.log(logMessage, data);
				appData[dataKey] = data; // Usamos a chave dinâmica para salvar os dados
				checkAndProcessData();
			})
			.catch((error) => {
				console.error(
					`Erro ao carregar o arquivo para ${selector}:`,
					error
				);
				alert(`Ocorreu um erro ao carregar o arquivo: ${error}`);
			});
	});
}

/**
 * Carregar o JSON inicialmente
 * Tenta carregar o arquivo 'operators.json' na inicialização
 * Este será o método padrão de carregamento de operadores.
 */

function loadInitialOperators() {
	$.getJSON("data/operators.json")
		.done(function (data) {
			// Se bem-sucedido
			console.log("Arquivo operators.json carregado com sucesso:", data);
			appData.operators = data;

			// Atualiza a UI para refletir o carregamento
			const $label = $("label[for='json-upload'] span");
			$label.text("Operadoras carregadas");
			$label.parent().addClass("loaded");

			checkAndProcessData();
		})
		.fail(function (jqXHR, textStatus, errorThrown) {
			// Falha. Provavelmente o arquivo não existe.
			console.warn(
				"data/operators.json não encontrado. Aguardando upload manual."
			);
			// Não faz nada, espera o upload manual.
		});
}

// --- INICIALIZAÇÃO DA APLICAÇÃO ---

// 1. Tenta carregar as operadoras do arquivo padrão
loadInitialOperators();

// 2. Configura os listeners para upload manual (que agora serve como override)
setupFileUploadListener(
	"#json-upload",
	readJsonFile,
	"operators",
	"Operadoras substituídas via upload:"
);
setupFileUploadListener(
	"#pix-upload",
	readCsvFile,
	"pixData",
	"Transações PIX carregadas:"
);
setupFileUploadListener(
	"#debit-upload",
	readCsvFile,
	"debitData",
	"Transações Débito carregadas:"
);
