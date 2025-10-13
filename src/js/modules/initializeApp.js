// -- Módulos de Dados e Arquivos ---
import {
	loadInitialOperators,
	readJsonFile,
	readCsvFile,
} from "./data/dataManager.js";

// --- Módulos das regras de negócio ---
import { processAndRankData } from "./data/analysis.js";
import { initCrud } from "./data/crudManager.js";
import {
	initReportSaver,
	updateCurrentRankedData,
} from "./data/reportSaver.js";

// --- Módulos de Interface do Usuário ---
import { displayRanking } from "./ui/uiManager.js";
import { initNavigation } from "./ui/navigation.js";
import { initSidebarToggle } from "./ui/components/sidebarToggle.js";

// --- Módulos de feedback ao usuário ---
import {
	showErrorAlert,
	showSuccessToast,
	showUploadStatus,
	updateUploadStatus,
	closeUploadStatusAndShowSuccess,
} from "./ui/feedbackManager.js";

// --- Módulos de Autenticação ---
import { setupLogoutHandler } from "./auth/logoutManager.js";

export function initializeApp() {
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

				// Habilita agora o botão de exportação e salvamento
				$("#export-ranking-pdf").prop("disabled", false);

				updateCurrentRankedData(rankedData);

				// Fecha o modal de status e mostra sucesso
				closeUploadStatusAndShowSuccess();
				isStatusModalOpen = false;
			}
		}

		/**
		 * Função personalizada para configurar listeners de upload
		 * Adapta a função do dataManager para usar o estado local da aplicação
		 */
		function setupAppFileUploadListener(selector, readerFunction, dataKey) {
			$(selector).on("change", function (event) {
				const file = event.target.files[0];
				if (!file) return;

				// Se for o primeiro upload, mostra modal de status
				if (!isStatusModalOpen) {
					const currentStatus = {
						operators: !!appData.operators,
						pixData: !!appData.pixData,
						debitData: !!appData.debitData,
					};
					showUploadStatus(currentStatus);
					isStatusModalOpen = true;
				}

				readerFunction(file)
					.then((data) => {
						appData[dataKey] = data;
						updateUploadStatus(dataKey);
						checkAndProcessData();
					})
					.catch((error) => {
						showErrorAlert(
							`Ocorreu um erro ao carregar o arquivo: ${error}`
						);
						if (isStatusModalOpen) {
							Swal.close();
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
		initReportSaver(appData);

		// 2. Configura os listeners de upload de arquivos
		setupAppFileUploadListener("#json-upload", readJsonFile, "operators");
		setupAppFileUploadListener(
			"#pix-upload",
			(file) => readCsvFile(file, "pix"),
			"pixData"
		);
		setupAppFileUploadListener(
			"#debit-upload",
			(file) => readCsvFile(file, "debit"),
			"debitData"
		);

		// 3. Carrega os dados iniciais
		loadInitialOperators(
			appData,
			checkAndProcessData,
			updateUploadStatus,
			() => isStatusModalOpen
		);

		// 4. Configura logout
		setupLogoutHandler("#logout-btn");
	});
}
