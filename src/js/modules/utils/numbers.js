// Util para parsing e formatação robusta de valores monetários (BR/US)
export function toNumberStrict(value) {
	// Retorna número ou 0 (sem NaN)
	if (typeof value === "number") return Number.isFinite(value) ? value : 0;
	if (value == null) return 0;

	const s = String(value).trim();
	if (!s) return 0;

	// Mantém dígitos, vírgula, ponto, sinal
	const cleaned = s.replace(/[^\d,.\-]/g, "");

	// Heurística: se há vírgula e ela está depois do último ponto → vírgula é decimal (pt-BR)
	if (
		cleaned.includes(",") &&
		cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")
	) {
		// Remove milhares ".", troca vírgula por ponto
		const normalized = cleaned.replace(/\./g, "").replace(",", ".");
		const n = parseFloat(normalized);
		return Number.isFinite(n) ? n : 0;
	}

	// Caso US: ponto decimal, vírgula de milhar
	const normalized = cleaned.replace(/,/g, "");
	const n = parseFloat(normalized);
	return Number.isFinite(n) ? n : 0;
}

export function formatBRL(value) {
	const n = toNumberStrict(value);
	return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
