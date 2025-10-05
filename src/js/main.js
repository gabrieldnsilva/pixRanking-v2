// --- Módulos das regras de negócio ---
import { readJsonFile, readCsvFile } from "./modules/dataManager.js";
import { processAndRankData } from "./modules/analysis.js";
import { displayRanking } from "./modules/uiManager.js";

// --- Módulos de funcionalidades da UI
import { initSidebarToggle } from "./modules/sidebarToggle.js";
import { initCrud } from "./modules/crudManager.js";
import { initNavigation } from "./modules/navigation.js";
import {
	showErrorAlert,
	showSuccessToast,
	showUploadStatus,
	updateUploadStatus,
	closeUploadStatusAndShowSuccess,
} from "./modules/feedbackManager.js";

/**
 * Verifica o status da sessão do usuário ao carregar a página.
 * Se não autenticado, redireciona para a página de login.
 * Se autenticado, permite que o resto do código seja executado.
 */
$.ajax({
	url: "/api/views/session_status.php",
	type: "GET",
	dataType: "json",
	success: function (response) {
		if (!response.success) {
			// Se a API retornar sucesso false (improvável aqui) ou erro, redireciona
			window.location.replace("login.html");
		}
		// Se sucesso, o código continua e o document.ready será executado
		console.log("Usuário autenticado:", response.data);
	},
	error: function () {
		// Se a requisição falhar (erro 401, 500, etc), redireciona para o login
		window.location.replace("login.html");
	},
});

$(document).ready(function () {
	// --- Estado Central da Aplicação ---
	let appData = {
		operators: null,
		pixData: null,
		debitData: null,
	};

	// Variável para controlar o modal de operadores
	let isStatusModalOpen = false;

	// --- Instâncias de Componentes da UI ---
	const operatorModal = new bootstrap.Modal($("#operator-modal"));

	// --- Funções do Orquestrador ---

	// Checa se todos os dados foram carregados
	function checkAndProcessData() {
		if (appData.operators && appData.pixData && appData.debitData) {
			const rankedData = processAndRankData(appData);
			displayRanking(rankedData);

			// Habilita agora o botão de exportação
			$("#export-ranking-pdf").prop("disabled", false);

			// Fecha o modal de status e mostra sucesso
			closeUploadStatusAndShowSuccess();
			isStatusModalOpen = false;
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

				// Feedback sutil de dados carregados
				showSuccessToast("Operadores carregados");

				if (isStatusModalOpen) {
					updateUploadStatus("operators");
				}
				checkAndProcessData();

				// Atualiza a UI para refletir o carregamento
				const $label = $("label[for='json-upload'] span");
				$label.text("Operadores Carregados");
				$label.parent().addClass("loaded");
				$label
					.siblings("i")
					.removeClass("ri-database-2-line")
					.addClass("ri-database-2-fill");
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
	 */
	function setupFileUploadListener(
		selector,
		readerFunction,
		dataKey,
		columnMap = null
	) {
		$(selector).on("change", function (event) {
			const file = event.target.files[0];
			if (!file) return;

			// Se for o primeiro upload manual, mostra o modal de status
			if (!isStatusModalOpen) {
				const currentStatus = {
					operators: !!appData.operators,
					pixData: !!appData.pixData,
					debitData: !!appData.debitData,
				};
				showUploadStatus(currentStatus);
				isStatusModalOpen = true;
			}

			readerFunction(file, columnMap)
				.then((data) => {
					appData[dataKey] = data;
					// Atualiza o item específico na lista de status
					updateUploadStatus(dataKey);
					checkAndProcessData();
				})
				.catch((error) => {
					// Usa o novo alerta de erro
					showErrorAlert(
						`Ocorreu um erro ao carregar o arquivo: ${error}`
					);
					if (isStatusModalOpen) {
						Swal.close(); // Fecha o modal de status em caso de erro
						isStatusModalOpen = false;
					}
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
	setupFileUploadListener(
		"#pix-upload",
		(file) => readCsvFile(file, "pix"),
		"pixData"
	); // Passa 'pix' como tipo
	setupFileUploadListener(
		"#debit-upload",
		(file) => readCsvFile(file, "debit"),
		"debitData"
	); // Passa 'debit' como tipo

	// 3. Carrega os dados iniciais
	loadInitialOperators();
});
