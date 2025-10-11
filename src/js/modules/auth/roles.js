// Pequeno RBCA (Role-Based Access Control) para gerenciar permissões com base em departamentos.

export const roles = {
	CPD: "Informatica",
	CAD: "Cadastro",
	GER: "Gerencia",
	FCX: "Frente de Caixa",
};

export function computePermissions(departamento) {
	switch ((departamento || "").trim()) {
		case roles.CPD:
			return {
				"manage-operators": true,
				"upload-csv": true,
				"view-reports": true,
			};
		case roles.CAD:
			return {
				"manage-operators": false,
				"upload-csv": true,
				"view-reports": true,
			};
		case roles.GER:
			return {
				"manage-operators": false,
				"upload-csv": false,
				"view-reports": true,
			};
		case roles.FCX:
			return {
				"manage-operators": false,
				"upload-csv": false,
				"view-reports": true,
			};
		default:
			return {
				"manage-operators": false,
				"upload-csv": false,
				"view-reports": true,
			};
	}
}

// Escode ou mostra elementos com base em permissões
export function applyRoleVisibility(permissions) {
	document.querySelectorAll("[data-perm]").forEach((el) => {
		const needed = el.getAttribute("data-perm");
		const allowed = !!permissions[needed];
		el.style.display = allowed ? "" : "none";
	});

	// Disable actionable controls when container cannot be hidden
	document.querySelectorAll("[data-perm-disable]").forEach((el) => {
		const needed = el.getAttribute("data-perm-disable");
		const allowed = !!permissions[needed];
		el.toggleAttribute("disabled", !allowed);
		el.classList.toggle("disabled", !allowed);
	});
}
