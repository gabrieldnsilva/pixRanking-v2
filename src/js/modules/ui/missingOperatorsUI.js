/**
 * Módulo UI para exibir operadoras ausentes.
 * Integra com Bootstrap Modal e SweetAlert2.
 */

import {
	findMissingOperatorNumbers,
	getMissingOperatorsDetail,
	listUnknownOperatorRows,
} from "../data/missingOperators.js";
import { switchView } from "../utils/utils.js";
import { showErrorAlert } from "./feedbackManager.js";

/**
 * Renderiza a tabela de operadoras ausentes no modal.
 * @param {Array} detailData - Array com {id, pixCount, debitCount, total}
 * @returns {string} HTML da tabela
 */
function renderMissingOperatorsTable(detailData) {
	if (!Array.isArray(detailData) || detailData.length === 0) {
		return `
            <div class="alert alert-success" role="alert">
                <i class="ri-checkbox-circle-line"></i>
                <strong>Tudo certo!</strong> Todas as operadoras nos CSVs estão cadastradas no sistema.
            </div>
        `;
	}

	const rows = detailData
		.map(
			(item) => `
        <tr>
            <td><strong>${item.id}</strong></td>
            <td class="text-center">${item.pixCount}</td>
            <td class="text-center">${item.debitCount}</td>
            <td class="text-center"><strong>${item.total}</strong></td>
        </tr>
    `
		)
		.join("");

	return `
        <div class="table-responsive">
            <table class="table table-hover align-middle">
                <thead class="table-light">
                    <tr>
                        <th>Nº Operadora</th>
                        <th class="text-center">Transações PIX</th>
                        <th class="text-center">Transações Débito</th>
                        <th class="text-center">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
        <p class="text-muted mb-0">
            <i class="ri-information-line"></i>
            <strong>${detailData.length}</strong> operadora(s) pendente(s) de cadastro.
        </p>
    `;
}

/**
 * Exibe o modal com operadoras ausentes.
 * @param {Object} appData - {operators, pixData, debitData}
 */
export function showMissingOperatorsModal(appData) {
	console.log("[missingOperatorsUI] Iniciando abertura do modal");

	const modalElement = document.getElementById("missingOperatorsModal");
	if (!modalElement) {
		console.error(
			"[missingOperatorsUI] Modal 'missingOperatorsModal' não encontrado no DOM."
		);
		return;
	}

	// Validar se há dados carregados
	if (!appData.operators || !appData.pixData || !appData.debitData) {
		console.warn("[missingOperatorsUI] Dados incompletos detectados");
		showErrorAlert(
			"Dados Incompletos",
			"Carregue todos os arquivos (Operadoras, PIX e Débito) antes de verificar pendências."
		);
		return;
	}

	// Obter detalhes das operadoras ausentes
	const detailData = getMissingOperatorsDetail(appData);
	const missingIds = findMissingOperatorNumbers(appData);

	// Logs de debug no console
	console.group("🔍 [Operadoras Ausentes] Análise Completa");
	console.log("Total de operadoras cadastradas:", appData.operators.length);
	console.log("IDs ausentes:", missingIds);
	console.log("Detalhamento:", detailData);

	const { unknownPix, unknownDebit } = listUnknownOperatorRows(appData);
	console.log("Linhas PIX desconhecidas:", unknownPix.length, unknownPix);
	console.log(
		"Linhas Débito desconhecidas:",
		unknownDebit.length,
		unknownDebit
	);
	console.groupEnd();

	// Renderizar conteúdo no modal
	const $content = $("#missing-operators-content");
	$content.html(renderMissingOperatorsTable(detailData));

	// Destruir instância existente (se houver) e criar nova
	const existingModal = bootstrap.Modal.getInstance(modalElement);
	if (existingModal) {
		console.log(
			"[missingOperatorsUI] Destruindo instância existente do modal"
		);
		existingModal.dispose();
	}

	// Limpar classes de backdrop residuais
	$(".modal-backdrop").remove();
	$("body").removeClass("modal-open").css("padding-right", "");

	console.log("[missingOperatorsUI] Criando nova instância do modal");
	const modal = new bootstrap.Modal(modalElement, {
		backdrop: true,
		keyboard: true,
		focus: true,
	});

	console.log("[missingOperatorsUI] Exibindo modal");
	modal.show();

	// Verificar se modal foi aberto corretamente
	setTimeout(() => {
		const isVisible = $(modalElement).hasClass("show");
		console.log("[missingOperatorsUI] Modal visível?", isVisible);
		if (!isVisible) {
			console.error(
				"[missingOperatorsUI] Modal não foi exibido corretamente!"
			);
		}
	}, 500);
}

/**
 * Inicializa os event listeners para operadoras ausentes.
 * @param {Object} appData - Referência ao estado central da aplicação
 * @param {Object} crudManager - Gerenciador do CRUD para navegação
 */
export function initMissingOperatorsUI(appData, crudManager) {
	console.log("[missingOperatorsUI] Inicializando módulo");

	// Botão na sidebar: "Operadoras Ausentes"
	$("#missing-operators-badge").on("click", function (e) {
		e.preventDefault();
		console.log("[missingOperatorsUI] Botão 'Operadoras Ausentes' clicado");
		showMissingOperatorsModal(appData);
	});

	// Botão no modal: "Ir para Gerenciamento"
	$("#go-to-crud-from-missing").on("click", function () {
		console.log("[missingOperatorsUI] Navegando para tela de CRUD");

		// Fechar modal
		const modalElement = document.getElementById("missingOperatorsModal");
		const modal = bootstrap.Modal.getInstance(modalElement);
		if (modal) {
			modal.hide();
		}

		// Limpar backdrop residual
		setTimeout(() => {
			$(".modal-backdrop").remove();
			$("body").removeClass("modal-open").css("padding-right", "");
		}, 300);

		// Navegar para view de gerenciamento
		crudManager.populateCrudTable();
		switchView("#crud-view");

		// Ativar link na sidebar
		$(".sidebar .nav-link").removeClass("active");
		$("#manage-operators-link").addClass("active");
	});

	console.log(
		"[missingOperatorsUI] Event listeners configurados com sucesso"
	);
}
