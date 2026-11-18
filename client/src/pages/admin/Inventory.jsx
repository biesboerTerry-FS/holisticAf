import React, { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { getHttpErrorMessage } from "../../utils/http";
import { exportToCSV, exportToPDF } from "../../utils/export";

const Inventory = () => {
	const { currency, axios } = useAppContext();
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [query, setQuery] = useState("");

	const loadInventory = async () => {
		setLoading(true);
		setError("");
		try {
			const { data } = await axios.get("/api/inventory/inventory", { suppressGlobalErrorToast: true });
			if (data.success) {
				setItems(Array.isArray(data.products) ? data.products : []);
			} else {
				setError(data.message || data.error || "Failed to load inventory");
				setItems([]);
			}
		} catch (err) {
			setError(getHttpErrorMessage(err, "Failed to load inventory"));
			setItems([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadInventory();
	}, []);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return items;
		return items.filter((p) => {
			const name = (p.name || p.description || "").toString().toLowerCase();
			const category = (p.category || "").toString().toLowerCase();
			const id = (p._id || p.upc || p.productId || "").toString().toLowerCase();
			return name.includes(q) || category.includes(q) || id.includes(q);
		});
	}, [items, query]);

	const getImage = (product) => {
		if (Array.isArray(product.image) && product.image.length) return product.image[0];
		if (Array.isArray(product.images) && product.images.length) return product.images[0];
		return "";
	};

	const getPrice = (product) => {
		if (typeof product.price === "object") return product.price?.regular ?? 0;
		return product.price ?? 0;
	};

	const getSalePrice = (product) => {
		if (typeof product.price === "object") return product.price?.sale ?? product.offerPrice ?? 0;
		return product.offerPrice ?? 0;
	};

	const exportRows = useMemo(
		() =>
			filtered.map((product) => ({
				name: product.name || "Unnamed product",
				category: product.category || "—",
				regularPrice: Number(getPrice(product) || 0).toFixed(2),
				offerPrice: Number(getSalePrice(product) || 0).toFixed(2),
				stock: product.stock ?? 0,
			})),
		[filtered],
	);

	const handleExportCSV = () => exportToCSV(exportRows, "inventory.csv");
	const handleExportPDF = () => exportToPDF(exportRows, "Inventory Catalog", "inventory.pdf");

	return (
		<div className="p-4 md:p-6 lg:p-8 text-primary-forest-green">
			<div className="mx-auto max-w-6xl space-y-5">
				<div className="flex flex-col gap-3 rounded-3xl border border-primary-forest-green/10 bg-primary-warm-white/75 p-5 shadow-sm backdrop-blur md:flex-row md:items-end md:justify-between">
					<div>
						<p className="text-xs font-medium uppercase tracking-[0.16em] text-primary-forest-green/50">Catalog</p>
						<h2 className="mt-1 text-2xl font-semibold tracking-tight">
							Inventory <span className="text-secondary-golden-honey">catalog</span>
						</h2>
						<p className="mt-1 text-sm text-primary-forest-green/65">
							Browse and search products stored in your inventory database.
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<button
							onClick={handleExportCSV}
							className="rounded-full border border-primary-forest-green/15 bg-secondary-soft-beige/70 px-4 py-2 text-sm font-medium transition hover:bg-primary-sage-green/15"
						>
							Export CSV
						</button>
						<button
							onClick={handleExportPDF}
							className="rounded-full border border-primary-forest-green/15 bg-secondary-soft-beige/70 px-4 py-2 text-sm font-medium transition hover:bg-primary-sage-green/15"
						>
							Export PDF
						</button>
						<button
							onClick={loadInventory}
							className="rounded-full border border-primary-forest-green/15 bg-secondary-soft-beige/70 px-4 py-2 text-sm font-medium transition hover:bg-primary-sage-green/15"
						>
							Refresh
						</button>
					</div>
				</div>

				{error ? (
					<div className="rounded-2xl border border-semantic-error/20 bg-semantic-error/10 p-4 text-sm text-semantic-error shadow-sm">
						{error}
					</div>
				) : null}

				<div className="rounded-2xl border border-primary-forest-green/10 bg-primary-warm-white/75 p-3 shadow-sm backdrop-blur md:p-4">
					<input
						type="text"
						placeholder="Search by name, category, or ID..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="w-full rounded-xl border border-primary-forest-green/10 bg-secondary-soft-beige/80 px-4 py-3 text-sm outline-none transition focus:border-secondary-golden-honey/60 focus:ring-4 focus:ring-secondary-golden-honey/10"
					/>
				</div>

				<div className="overflow-hidden rounded-3xl border border-primary-forest-green/10 bg-primary-warm-white/75 shadow-sm backdrop-blur">
					<div className="overflow-x-auto">
						<table className="w-full min-w-[720px] border-collapse text-sm">
							<thead className="bg-primary-sage-green/10 text-left text-primary-forest-green/70">
								<tr>
									<th className="px-4 py-3.5 font-semibold md:px-5">Product</th>
									<th className="px-4 py-3.5 font-semibold md:px-5">Category</th>
									<th className="px-4 py-3.5 font-semibold md:px-5">Price</th>
									<th className="px-4 py-3.5 font-semibold md:px-5">Sale</th>
								</tr>
							</thead>
							<tbody>
								{loading ? (
									<tr>
										<td colSpan={4} className="px-4 py-10 text-center text-primary-forest-green/65">Loading inventory…</td>
									</tr>
								) : filtered.length === 0 ? (
									<tr>
										<td colSpan={4} className="px-4 py-10 text-center text-primary-forest-green/65">
											{query ? "No products match your search." : "No inventory products found."}
										</td>
									</tr>
								) : (
									filtered.map((product) => (
										<tr key={product._id || product.upc || product.productId} className="border-t border-primary-forest-green/8 transition hover:bg-primary-sage-green/5">
											<td className="px-4 py-3.5 md:px-5">
												<div className="flex items-center gap-3">
													<div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-primary-forest-green/10 bg-secondary-soft-beige/70">
														{getImage(product) ? (
															<img src={getImage(product)} alt={product.name || "Product"} className="h-full w-full object-cover" />
														) : null}
													</div>
													<div className="min-w-0">
														<p className="truncate font-medium">{product.name || "Unnamed product"}</p>
														<p className="truncate text-xs text-primary-forest-green/55">
															{(Array.isArray(product.description) ? product.description[0] : product.description) || product.upc || "—"}
														</p>
													</div>
												</div>
											</td>
											<td className="px-4 py-3.5 capitalize md:px-5">{product.category || "—"}</td>
											<td className="px-4 py-3.5 font-medium md:px-5">{currency}{Number(getPrice(product) || 0).toFixed(2)}</td>
											<td className="px-4 py-3.5 font-medium text-primary-forest-green/85 md:px-5">{currency}{Number(getSalePrice(product) || 0).toFixed(2)}</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Inventory;
