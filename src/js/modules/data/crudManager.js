/**
 * Módulo para encapsular toda a lógica do CRUD de operadoras.
 */

export function initCrud(appData, operatorModal) {
	/**
	 * Popula a tabela de gerenciamento com os dados atuais.
	 */
	function populateCrudTable() {
		const $crudBody = $("#crud-table-body");
		$crudBody.empty();

		if (!appData.operators || appData.operators.length === 0) {
			$crudBody.html(
				'<tr><td colspan="3" class="text-center">Nenhuma operadora cadastrada.</td></tr>'
			);
			return;
		}

		appData.operators.forEach((op) => {
			const row = `
                <tr>
                    <td>${op.nome_operadora}</td>
                    <td>${op.numero_operadora}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-secondary edit-operator-btn" data-id="${op.numero_operadora}">
                            <i class="ri-pencil-line"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-operator-btn" data-id="${op.numero_operadora}">
                            <i class="ri-delete-bin-line"></i> Excluir
                        </button>
                    </td>
                </tr>
            `;
			$crudBody.append(row);
		});
	}

	// --- Event Listeners do CRUD ---

	// Botão "Adicionar Nova Operadora"
	$("#add-operator-btn").on("click", function () {
		$("#operator-form")[0].reset();
		$("#operator-id-hidden").val("");
		$("#operator-modal-label").text("Adicionar Nova Operadora");
		operatorModal.show();
	});

	// Botão "Salvar" dentro do modal
	$("#save-operator-form-btn").on("click", function () {
		const originalId = $("#operator-id-hidden").val();
		const newName = $("#operator-name").val().trim();
		const newNumber = parseInt($("#operator-number").val());

		if (!newName || isNaN(newNumber)) {
			alert("Por favor, preencha todos os campos corretamente.");
			return;
		}

		if (originalId) {
			// Edição
			const operator = appData.operators.find(
				(op) => op.numero_operadora == originalId
			);
			if (operator) {
				operator.nome_operadora = newName;
				operator.numero_operadora = newNumber;
			}
		} else {
			// Criação
			const exists = appData.operators.some(
				(op) => op.numero_operadora === newNumber
			);
			if (exists) {
				alert("O número da operadora já existe.");
				return;
			}
			appData.operators.push({
				nome_operadora: newName,
				numero_operadora: newNumber,
			});
		}

		populateCrudTable();
		operatorModal.hide();
	});

	// Botão "Editar" (delegação)
	$("#crud-table-body").on("click", ".edit-operator-btn", function () {
		const id = $(this).data("id");
		const operator = appData.operators.find(
			(op) => op.numero_operadora == id
		);

		if (operator) {
			$("#operator-id-hidden").val(operator.numero_operadora);
			$("#operator-name").val(operator.nome_operadora);
			$("#operator-number").val(operator.numero_operadora);
			$("#operator-modal-label").text("Editar Operadora");
			operatorModal.show();
		}
	});

	// Botão "Excluir" (usando delegação de eventos)
	$("#crud-table-body").on("click", ".delete-operator-btn", function () {
		const id = $(this).data("id");
		if (
			confirm(
				"Tem certeza que deseja excluir esta operadora? Esta ação é temporária até que você salve as alterações no servidor."
			)
		) {
			appData.operators = appData.operators.filter(
				(op) => op.numero_operadora != id
			);
			populateCrudTable();
		}
	});

	// Botão "Salvar Alterações no Servidor"
	$("#save-changes-btn").on("click", function () {
		const $btn = $(this);
		$btn.prop("disabled", true).html(
			'<i class="ri-loader-4-line spin"></i> Salvando...'
		);

		$.ajax({
			url: "php/core/ranking_operadoras.php",
			type: "POST",
			contentType: "application/json",
			data: JSON.stringify(appData.operators),
			success: function (response) {
				alert(response.message || "Alterações salvas com sucesso!");

				// Recarregar operadoras do banco após salvar
				$.getJSON("php/core/ranking_operadoras.php")
					.done(function (data) {
						appData.operators = data;
						populateCrudTable();
					})
					.fail(function () {
						console.error(
							"Erro ao recarregar operadoras após salvar"
						);
					});
			},
			error: function (xhr) {
				console.error("Erro ao salvar:", xhr.responseText);
				alert(
					"Erro: Não foi possível salvar as alterações. Verifique o servidor."
				);
			},
			complete: function () {
				$btn.prop("disabled", false).html(
					'<i class="ri-save-3-line"></i> Salvar Alterações'
				);
			},
		});
	});

	// ✅ RETORNAR OBJETO COM FUNÇÃO EXPOSTA
	return {
		populateCrudTable,
	};
}
