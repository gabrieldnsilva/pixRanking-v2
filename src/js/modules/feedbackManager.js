/**
 * Módulo para gerenciar o feedback ao usuário usando SweetAlert2
 */

/**
 * Exube um alerta de erro genérico
 * @param {string} message - A mensagem de erro a ser exibida
 */

export function showErrorAlert(message) {
	Swal.fire({
		icon: "error",
		title: "Opa...",
		text: message,
		confirmButtonColor: "#0b861cff",
	});
}

/**
 * Exibe uma notificação de sucesso que se fecha sozinha (toast)
 * @param {string} title - O título da notificação
 */

export function showSuccessToast(title) {
	Swal.fire({
		toast: true,
		position: "top-end",
		icon: "success",
		title: title,
		showConfirmButton: false,
		timer: 2500,
		timerProgressBar: true,
	});
}

/**
 * Exibe um modal de status do upload que pode ser atualizado
 */

export function showUploadStatus() {
	Swal.fire({
		title: "Aguardando Arquivos",
		html: `
            <ul id="upload-status-list" style="list-style-type: none; padding: 0; text-align: left;">
                <li id="status-operators"><i class="ri-loader-4-line"></i> Operadoras (.json)</li>
                <li id="status-pixData"><i class="ri-loader-4-line"></i> Transações PIX (.csv)</li>
                <li id="status-debitData"><i class="ri-loader-4-line"></i> Transações Débito (.csv)</li>
            </ul>
        `,
		allowOutsideClick: false,
		showConfirmButton: false,
		willOpen: () => {
			Swal.showLoading();
		},
	});
}

/**
 * Atualiza um item na lista de status do upload.
 * @param {string} fileKey - A chave do arquivo ('operators', 'pixData', 'debitData')
 */
export function updateUploadStatus(fileKey) {
	const listItem = document.getElementById(`status-${fileKey}`);
	if (listItem) {
		listItem.innerHTML = `<i class="ri-checkbox-circle-fill" style="color: green;"></i> ${listItem.innerText}`;
	}
}

/**
 * Fecha o modal de status e exibe uma mensagem final
 */

export function closeUploadStatusAndShowSuccess() {
	Swal.close();
	showSuccessToast;
	("Dados processados com sucesso!");
}
