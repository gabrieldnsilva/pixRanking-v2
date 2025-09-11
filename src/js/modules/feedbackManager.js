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
 * @param {object} initialStatus - O estado inicial dos uploads
 */

export function showUploadStatus(initialStatus = {}) {
	// Helper para criar o ícone de status de cada item
	const getIcon = (isLoaded) => {
		return isLoaded
			? '<i class="ri-checkbox-circle-fill" style="color: green;"></i>'
			: '<i class="ri-loader-4-line"></i>';
	};

	Swal.fire({
		title: "Aguardando Arquivos",
		html: `
            <ul id="upload-status-list" style="list-style-type: none; padding: 0; text-align: left;">
                <li id="status-operators">${getIcon(
					initialStatus.operators
				)} Operadoras (.json)</li>
                <li id="status-pixData">${getIcon(
					initialStatus.pixData
				)} Transações PIX (.csv)</li>
                <li id="status-debitData">${getIcon(
					initialStatus.debitData
				)} Transações Débito (.csv)</li>
            </ul>
            <p class="mt-3">Por favor, carregue os arquivos restantes.</p>
        `,
		allowOutsideClick: true, // Impede que o modal seja fechado clicando fora
		allowEscapeKey: false, // Impede que a tecla "Esc" feche o modal
		showConfirmButton: false,
		timerProgressBar: true,
		timer: 3000, // Apenas para evitar que o modal fique aberto para sempre
		didOpen: () => {
			Swal.showLoading();
		},
		willOpen: () => {},
	});
}

/**
 * Atualiza um item na lista de status do upload.
 * @param {string} fileKey - A chave do arquivo ('operators', 'pixData', 'debitData')
 */
export function updateUploadStatus(fileKey) {
	const listItem = document.getElementById(`status-${fileKey}`);
	if (listItem) {
		// Pega o texto do item (ex: " Operadoras (.json)")
		const text = listItem.innerText;
		// Remonta o HTML com o ícone de sucesso
		listItem.innerHTML = `<i class="ri-checkbox-circle-fill" style="color: green;"></i>${text}`;
	}
}

/**
 * Fecha o modal de status e exibe uma mensagem final
 */

export function closeUploadStatusAndShowSuccess() {
	Swal.close();
	showSuccessToast("Dados processados com sucesso!");
}
