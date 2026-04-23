/**
 * Arquivo principal da aplicação - Centraliza a inicialização
 * Este arquivo coordena o fluxo de autenticação e inicialização da aplicação
 */

import { checkAuthStatus } from "./modules/auth/auth.js";
import {
	applyRoleVisibility,
	computePermissions,
} from "./modules/auth/roles.js";
import { initializeApp } from "./modules/initializeApp.js";

/**
 * Função principal da aplicação
 * Gerencia o fluxo de autenticação e inicialização
 */
export async function startApp() {
	try {
		console.log("🚀 Iniciando aplicação Ranking PIX...");

		// Verifica se o usuário está autenticado
		const userData = await checkAuthStatus();

		const perms =
			userData.permissions || computePermissions(userData.departamento);
		applyRoleVisibility(perms);

		// Se chegou até aqui, o usuário está autenticado
		console.log("✅ Usuário autenticado:", userData.email);

		// Inicializa a aplicação
		await initializeApp();

		console.log("✅ Aplicação inicializada com sucesso!");
	} catch (error) {
		// Falha na autenticação - redireciona para login
		console.log("❌ Erro de autenticação:", error);
		console.log("🔄 Redirecionando para login...");
		window.location.replace("login.html");
	}
}

// A função startApp será chamada pelo main.js
