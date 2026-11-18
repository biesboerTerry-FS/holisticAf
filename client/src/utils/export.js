import { jsPDF } from "jspdf";
import "jspdf-autotable";

const escapeCsvCell = (value) => {
	const str = value == null ? "" : String(value);
	const needsQuotes = str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r");
	if (!needsQuotes) return str;
	return `"${str.replace(/"/g, '""')}"`;
};

const objectsToCsv = (rows) => {
	if (!Array.isArray(rows) || rows.length === 0) return "";
	const keys = Object.keys(rows[0]);
	const lines = [
		keys.join(","),
		...rows.map((row) => keys.map((key) => escapeCsvCell(row[key])).join(",")),
	];
	return lines.join("\n");
};

export const exportToCSV = (data, filename = "export.csv") => {
	const rows = Array.isArray(data) ? data : [];
	const csv = objectsToCsv(rows);
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);
};

const sanitizeFilename = (name) =>
	String(name || "export")
		.replace(/[^\w\-.\s]/g, "_")
		.trim();

export const exportToPDF = (data, title = "Export", filename = "export.pdf") => {
	const rows = Array.isArray(data) ? data : [];
	const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });
	const pageTitle = String(title || "Export");

	doc.setFontSize(16);
	doc.text(pageTitle, 40, 50);

	if (rows.length === 0) {
		doc.setFontSize(12);
		doc.text("No data available.", 40, 80);
		doc.save(sanitizeFilename(filename));
		return;
	}

	const keys = Object.keys(rows[0]);
	const head = [keys.map((k) => k.charAt(0).toUpperCase() + k.slice(1))];
	const body = rows.map((row) => keys.map((key) => (row[key] == null ? "" : String(row[key]))));

	const columnStyles = {};
	keys.forEach((_, index) => {
		columnStyles[index] = { cellWidth: "auto" };
	});

	doc.autoTable({
		startY: 70,
		head,
		body,
		styles: { fontSize: 9, cellPadding: 4, overflow: "linebreak" },
		headStyles: { fillColor: [30, 77, 67], textColor: [252, 250, 245] },
		alternateRowStyles: { fillColor: [245, 242, 236] },
		margin: { top: 70, right: 40, bottom: 40, left: 40 },
		columnStyles,
	});

	doc.save(sanitizeFilename(filename));
};
