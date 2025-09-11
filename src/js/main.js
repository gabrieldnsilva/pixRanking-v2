// --- Módulos das regras de negócio ---
import { readJsonFile, readCsvFile } from "./modules/dataManager.js";
import { processAndRankData } from "./modules/analysis.js";
import { displayRanking } from "./modules/uiManager.js";

// --- Módulos de funcionalidades da UI
import { initSidebarToggle } from "./modules/sidebarToggle.js";
import { initCrud } from "./modules/crudManager.js";
import { initNavigation } from "./modules/navigation.js";

$(document).ready(function () {
	// --- Estado Central da Aplicação ---
	let appData = {
		operators: null,
		pixData: null,
		debitData: null,
	};

	// --- Instâncias de Componentes da UI ---
	const operatorModal = new bootstrap.Modal($("#operator-modal"));

	// --- Funções do Orquestrador ---

	// Checa se todos os dados foram carregados
	function checkAndProcessData() {
		if (appData.operators && appData.pixData && appData.debitData) {
			console.log("Todos os dados carregados. Processando...");
			try {
				const rankedData = processAndRankData(appData);
				displayRanking(rankedData);

				// Habilita agora o botão de exportação
				$("#export-ranking-btn").prop("disabled", false);
			} catch (error) {
				console.error("Erro ao processar os dados:", error);
				alert(
					"Ocorreu um erro ao processar os dados. Verifique o console para mais detalhes."
				);
			}
		}
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
				appData.operators = data;
				console.log("Operadoras carregadas do JSON inicial:", data);
				// Atualiza a UI para refletir o carregamento
				const $label = $("label[for='json-upload'] span");
				$label.text("Operadoras carregadas");
				$label.parent().addClass("loaded");

				checkAndProcessData();
			})
			.fail(function () {
				// Falha. Provavelmente o arquivo não existe.
				console.warn(
					"data/operators.json não encontrado. Aguardando upload manual."
				);
			});
	}

	/**
	 * Função genérica para configurar o listener de upload de arquivo. (Otimização DRY)
	 * @param {string} selector - O seletor jQuery para o input de arquivo (ex: '#json-upload').
	 * @param {function} readerFunction - A função que lerá o arquivo (ex: readJsonFile).
	 * @param {string} dataKey - A chave para salvar os dados em `appData` (ex: 'operators').
	 * @param {string} logMessage - A mensagem para exibir no console após o sucesso.
	 */
	function setupFileUploadListener(selector, readerFunction, dataKey) {
		$(selector).on("change", function (event) {
			const file = event.target.files[0];
			if (!file) return;

			readerFunction(file)
				.then((data) => {
					console.log("Dados do CSV de PIX:", data);
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

	// --- INICIALIZAÇÃO DA APLICAÇÃO ---

	// 1. Inicializa os componentes da UI
	initSidebarToggle();
	const crudManager = initCrud(appData, operatorModal);
	initNavigation(crudManager);

	// 2. Configura os listeners de upload de arquivos
	setupFileUploadListener("#json-upload", readJsonFile, "operators");
	setupFileUploadListener("#pix-upload", readCsvFile, "pixData");
	setupFileUploadListener("#debit-upload", readCsvFile, "debitData");

	// 3. Carrega os dados iniciais
	loadInitialOperators();
});
