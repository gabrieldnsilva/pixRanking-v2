// -- Módulos de Dados e Arquivos ---
import {
	loadInitialOperators,
	readJsonFile,
	readCsvFile,
} from "./data/dataManager.js";

// --- Módulos das regras de negócio ---
import { processAndRankData } from "./data/analysis.js";
import { initCrud } from "./data/crudManager.js";
import { initReportSaver, updateCurrentAppData } from "./data/reportSaver.js";
import { initReportHistory } from "./data/reportHistory.js";
import {
	findMissingOperatorNumbers,
	listUnknownOperatorRows,
	formatMissingSummary,
} from "./data/missingOperators.js";
import { initPdfPeriodModal, setPdfPeriod } from "./utils/pdfPeriodManager.js";
import { exportRankingPDF_Native } from "./utils/pdfGenerator.js";

// --- Módulos de Interface do Usuário ---
import {
	displayRanking,
	initTableSearch,
	initTableSorting,
} from "./ui/uiManager.js";
import { initNavigation } from "./ui/navigation.js";
import { initSidebarToggle } from "./ui/components/sidebarToggle.js";
import { initMissingOperatorsUI } from "./ui/missingOperatorsUI.js";

// --- Módulos de feedback ao usuário ---
import {
	showErrorAlert,
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

				// 2) Detectar operadoras ausentes (apenas admin/gestão)
				// Elemento controlado por RBAC: data-perm="manage-operators"
				const $badge = $("#missing-operators-badge span");
				if ($badge.length) {
					const missing = findMissingOperatorNumbers(appData);
					const summary = formatMissingSummary(missing);
					if (missing.length) {
						$badge
							.text(` (${missing.length})`)
							.removeClass("d-none")
							.addClass("badge bg-warning text-dark ms-2");
					} else {
						$badge
							.text(" ✓")
							.removeClass("d-none")
							.addClass("badge bg-success text-white ms-2");
					}

					// Log opcional para auditoria
					const { unknownPix, unknownDebit } =
						listUnknownOperatorRows(appData);
					console.debug(
						"[Pendências] PIX desconhecidos:",
						unknownPix.length,
					);
					console.debug(
						"[Pendências] Débito desconhecidos:",
						unknownDebit.length,
					);
				}

				// Habilita agora o botão de exportação e salvamento
				$("#export-ranking-pdf").prop("disabled", false);

				// Atualiza os dados atuais no módulo de salvamento
				updateCurrentAppData(appData);

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
			$(selector).on("change", async function (event) {
				const file = event.target.files[0];
				if (!file) return;

				try {
					showUploadStatus(`Carregando ${dataKey}...`);
					const parsedData = await readerFunction(file);
					appData[dataKey] = parsedData;

					if (isStatusModalOpen) {
						updateUploadStatus(dataKey);
					}

					checkAndProcessData();
					closeUploadStatusAndShowSuccess(
						`${dataKey} carregado com sucesso!`,
					);
				} catch (err) {
					console.error(`Erro ao carregar ${dataKey}:`, err);
					showErrorAlert(
						"Falha ao carregar arquivo",
						`Ocorreu um erro ao processar ${dataKey}.`,
					);
				} finally {
					// Reseta input para permitir novo upload do mesmo arquivo
					$(this).val("");
				}
			});
		}

		// --- INICIALIZAÇÃO DA APLICAÇÃO ---

		// 1. Inicializa os componentes da UI
		initSidebarToggle();
		const crudManager = initCrud(appData, operatorModal);
		initNavigation(crudManager);

		// Inicializa a UI de operadores ausentes
		initMissingOperatorsUI(appData, crudManager);

		// Inicializa o modal de período para PDF
		initPdfPeriodModal((period) => {
			if (
				appData &&
				appData.operators &&
				appData.pixData &&
				appData.debitData
			) {
				const rankedData = processAndRankData(appData);
				exportRankingPDF_Native(rankedData);
			}
		});

		// Integrar histórico: carregar relatório salvo preenche appData e recalcula
		initReportHistory({
			onLoadReport: (
				loadedAppData /* {operators,pixData,debitData} */,
			) => {
				appData = loadedAppData;
				checkAndProcessData();

				// ⬇️ NOVO: Restaura período para PDF ao carregar relatório salvo
				if (loadedAppData.data_inicial && loadedAppData.data_final) {
					setPdfPeriod({
						start: loadedAppData.data_inicial,
						end: loadedAppData.data_final,
					});
				}
			},
		});

		// Inicializa o módulo de salvamento de relatórios
		initReportSaver(appData);

		// 2. Configura os listeners de upload de arquivos
		setupAppFileUploadListener("#json-upload", readJsonFile, "operators");
		setupAppFileUploadListener(
			"#pix-upload",
			(file) => readCsvFile(file, "pix"),
			"pixData",
		);
		setupAppFileUploadListener(
			"#debit-upload",
			(file) => readCsvFile(file, "debit"),
			"debitData",
		);

		// 3. Carrega os dados iniciais
		loadInitialOperators(
			appData,
			checkAndProcessData,
			updateUploadStatus,
			() => isStatusModalOpen,
		);

		// ✅ Inicializa ordenação de tabelas
		initTableSorting();
		initTableSearch();

		// 4. Configura logout
		setupLogoutHandler("#logout-btn");
	});
}
