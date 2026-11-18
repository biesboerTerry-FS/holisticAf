import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";
import { getHttpErrorMessage } from "../../utils/http";
import { exportToCSV, exportToPDF } from "../../utils/export";

const emptyManager = {
	name: "",
	email: "",
	phone: "",
	position: "Manager",
	color: "#e0a030",
	active: true,
	role: "manager",
	notes: "",
	managerNotes: "",
};

const Managers = () => {
	const { axios } = useAppContext();
	const [employees, setEmployees] = useState([]);
	const [managers, setManagers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [query, setQuery] = useState("");
	const [form, setForm] = useState(emptyManager);
	const [showForm, setShowForm] = useState(false);
	const [saving, setSaving] = useState(false);
	const [selectedManager, setSelectedManager] = useState(null);

	const loadManagers = async () => {
		setLoading(true);
		setError("");
		try {
			const { data } = await axios.get("/api/employees", { suppressGlobalErrorToast: true });
			if (!data.success) throw new Error(data.message || "Failed to load managers");
			const emps = data.employees || [];
			setEmployees(emps);
			setManagers(emps.filter((e) => e.role === "manager"));
		} catch (err) {
			setError(getHttpErrorMessage(err, "Failed to load managers"));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadManagers();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return managers;
		return managers.filter(
			(m) =>
				(m.name || "").toLowerCase().includes(q) ||
				(m.email || "").toLowerCase().includes(q) ||
				(m.position || "").toLowerCase().includes(q),
		);
	}, [managers, query]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!form.name.trim()) {
			toast.error("Name is required");
			return;
		}
		setSaving(true);
		try {
			const { data } = await axios.post("/api/employees", { ...form, name: form.name.trim() }, { suppressGlobalErrorToast: true });
			if (!data.success) throw new Error(data.message || "Failed to add manager");
			toast.success("Manager added");
			setForm(emptyManager);
			setShowForm(false);
			await loadManagers();
		} catch (err) {
			toast.error(getHttpErrorMessage(err, "Failed to add manager"));
		} finally {
			setSaving(false);
		}
	};

	const removeManager = async (id, name) => {
		if (!window.confirm(`Remove ${name || "this manager"}? Their employee record and shifts will be deleted.`)) return;
		try {
			const { data } = await axios.delete(`/api/employees/${id}`, { suppressGlobalErrorToast: true });
			if (!data.success) throw new Error(data.message || "Failed to remove manager");
			toast.success("Manager removed");
			if (selectedManager?._id === id) setSelectedManager(null);
			await loadManagers();
		} catch (err) {
			toast.error(getHttpErrorMessage(err, "Failed to remove manager"));
		}
	};

	const stats = useMemo(() => {
		const active = managers.filter((m) => m.active).length;
		const inactive = managers.length - active;
		const staffManaged = employees.filter((e) => e.role !== "manager").length;
		return { total: managers.length, active, inactive, staffManaged };
	}, [managers, employees]);

	const exportRows = useMemo(
		() =>
			filtered.map((m) => ({
				Name: m.name,
				Position: m.position || "Manager",
				Email: m.email || "—",
				Phone: m.phone || "—",
				Status: m.active ? "Active" : "Inactive",
			})),
		[filtered],
	);

	return (
		<div className="p-4 md:p-6 lg:p-8 text-primary-forest-green">
			<div className="mx-auto max-w-6xl space-y-6">
				<div className="flex flex-col gap-3 rounded-3xl border border-primary-forest-green/10 bg-primary-warm-white/75 p-5 shadow-sm backdrop-blur md:flex-row md:items-end md:justify-between md:p-6">
					<div>
						<p className="text-xs font-medium uppercase tracking-[0.16em] text-primary-forest-green/50">Leadership</p>
						<h2 className="mt-1 text-2xl font-semibold tracking-tight">
							Manager <span className="text-secondary-golden-honey">roster</span>
						</h2>
						<p className="mt-1 text-sm text-primary-forest-green/65">
							Oversee managers and keep leadership contact details up to date.
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<button
							onClick={() => exportToCSV(exportRows, "managers.csv")}
							className="rounded-full border border-primary-forest-green/15 bg-secondary-soft-beige/70 px-4 py-2 text-sm font-medium transition hover:bg-primary-sage-green/15"
						>
							Export CSV
						</button>
						<button
							onClick={() => exportToPDF(exportRows, "Managers", "managers.pdf")}
							className="rounded-full border border-primary-forest-green/15 bg-secondary-soft-beige/70 px-4 py-2 text-sm font-medium transition hover:bg-primary-sage-green/15"
						>
							Export PDF
						</button>
						<button
							onClick={() => setShowForm((s) => !s)}
							className="rounded-full bg-primary-forest-green px-4 py-2 text-sm font-medium text-primary-cream shadow-sm transition hover:opacity-90"
						>
							{showForm ? "Cancel" : "Add manager"}
						</button>
					</div>
				</div>

				{error ? (
					<div className="rounded-2xl border border-semantic-error/20 bg-semantic-error/10 p-4 text-sm text-semantic-error shadow-sm">
						{error}
					</div>
				) : null}

				<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
					<div className="rounded-2xl border border-primary-forest-green/10 bg-gradient-to-br from-primary-warm-white/90 to-primary-sage-green/10 p-4 shadow-sm">
						<p className="text-[11px] font-medium uppercase tracking-[0.14em] text-primary-forest-green/55">Total</p>
						<p className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{loading ? "—" : stats.total}</p>
					</div>
					<div className="rounded-2xl border border-primary-forest-green/10 bg-gradient-to-br from-primary-warm-white/90 to-semantic-success/10 p-4 shadow-sm">
						<p className="text-[11px] font-medium uppercase tracking-[0.14em] text-primary-forest-green/55">Active</p>
						<p className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{loading ? "—" : stats.active}</p>
					</div>
					<div className="rounded-2xl border border-primary-forest-green/10 bg-gradient-to-br from-primary-warm-white/90 to-secondary-golden-honey/10 p-4 shadow-sm">
						<p className="text-[11px] font-medium uppercase tracking-[0.14em] text-primary-forest-green/55">Inactive</p>
						<p className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{loading ? "—" : stats.inactive}</p>
					</div>
					<div className="rounded-2xl border border-primary-forest-green/10 bg-gradient-to-br from-primary-warm-white/90 to-primary-sage-green/10 p-4 shadow-sm">
						<p className="text-[11px] font-medium uppercase tracking-[0.14em] text-primary-forest-green/55">Staff</p>
						<p className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{loading ? "—" : stats.staffManaged}</p>
						<p className="mt-1 text-xs text-primary-forest-green/60">non-manager employees</p>
					</div>
				</div>

				{showForm ? (
					<section className="rounded-3xl border border-primary-forest-green/10 bg-primary-warm-white/75 p-4 shadow-sm backdrop-blur md:p-5">
						<h3 className="text-lg font-semibold tracking-tight">Add manager</h3>
						<form onSubmit={handleSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
							<input
								type="text"
								placeholder="Full name"
								required
								value={form.name}
								onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
								className="rounded-xl border border-primary-forest-green/10 bg-secondary-soft-beige/80 px-3.5 py-2.5 text-sm outline-none focus:border-secondary-golden-honey/60 focus:ring-4 focus:ring-secondary-golden-honey/10"
							/>
							<input
								type="text"
								placeholder="Position"
								value={form.position}
								onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
								className="rounded-xl border border-primary-forest-green/10 bg-secondary-soft-beige/80 px-3.5 py-2.5 text-sm outline-none focus:border-secondary-golden-honey/60 focus:ring-4 focus:ring-secondary-golden-honey/10"
							/>
							<input
								type="email"
								placeholder="Email (optional)"
								value={form.email}
								onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
								className="rounded-xl border border-primary-forest-green/10 bg-secondary-soft-beige/80 px-3.5 py-2.5 text-sm outline-none focus:border-secondary-golden-honey/60 focus:ring-4 focus:ring-secondary-golden-honey/10"
							/>
							<input
								type="text"
								placeholder="Phone (optional)"
								value={form.phone}
								onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
								className="rounded-xl border border-primary-forest-green/10 bg-secondary-soft-beige/80 px-3.5 py-2.5 text-sm outline-none focus:border-secondary-golden-honey/60 focus:ring-4 focus:ring-secondary-golden-honey/10"
							/>
							<div className="flex items-center gap-3 sm:col-span-2">
								<input
									type="color"
									value={form.color}
									onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
									className="h-[42px] w-16 rounded-xl border border-primary-forest-green/10 bg-secondary-soft-beige/80 p-1"
								/>
								<label className="flex items-center gap-2 text-sm">
									<input
										type="checkbox"
										checked={form.active}
										onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
										className="h-4 w-4 accent-primary-forest-green"
									/>
									Active on add
								</label>
							</div>
							<textarea
								rows={2}
								placeholder="Manager notes (optional)"
								value={form.managerNotes}
								onChange={(e) => setForm((p) => ({ ...p, managerNotes: e.target.value }))}
								className="rounded-xl border border-primary-forest-green/10 bg-secondary-soft-beige/80 px-3.5 py-2.5 text-sm outline-none focus:border-secondary-golden-honey/60 focus:ring-4 focus:ring-secondary-golden-honey/10 sm:col-span-2"
							/>
							<div className="flex gap-2 sm:col-span-2">
								<button
									type="submit"
									disabled={saving}
									className="rounded-full bg-primary-forest-green px-4 py-2.5 text-sm font-medium text-primary-cream transition hover:opacity-90 disabled:opacity-60"
								>
									{saving ? "Saving..." : "Add manager"}
								</button>
								<button
									type="button"
									onClick={() => setShowForm(false)}
									className="rounded-full border border-primary-forest-green/15 bg-secondary-soft-beige/70 px-4 py-2.5 text-sm font-medium transition hover:bg-primary-sage-green/15"
								>
									Cancel
								</button>
							</div>
						</form>
					</section>
				) : null}

				<section className="rounded-3xl border border-primary-forest-green/10 bg-primary-warm-white/75 p-4 shadow-sm backdrop-blur md:p-5">
					<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
						<h3 className="text-lg font-semibold tracking-tight">Managers</h3>
						<input
							type="text"
							placeholder="Search managers..."
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							className="rounded-xl border border-primary-forest-green/10 bg-secondary-soft-beige/80 px-3.5 py-2 text-sm outline-none focus:border-secondary-golden-honey/60"
						/>
					</div>

					{loading ? (
						<div className="mt-4 space-y-2">
							<div className="h-16 animate-pulse rounded-2xl bg-primary-sage-green/10" />
							<div className="h-16 animate-pulse rounded-2xl bg-primary-sage-green/10" />
							<div className="h-16 animate-pulse rounded-2xl bg-primary-sage-green/10" />
						</div>
					) : filtered.length === 0 ? (
						<div className="mt-4 rounded-2xl border border-dashed border-primary-forest-green/15 bg-secondary-soft-beige/50 p-8 text-center text-sm text-primary-forest-green/60">
							{query ? "No managers match your search." : "No managers yet. Promote an employee or add a new manager."}
						</div>
					) : (
						<div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{filtered.map((mgr) => (
								<div
									key={mgr._id}
									onClick={() => setSelectedManager(mgr)}
									className={`cursor-pointer rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-sm ${
										selectedManager?._id === mgr._id
											? "border-secondary-golden-honey/50 bg-secondary-golden-honey/5"
											: "border-primary-forest-green/10 bg-secondary-soft-beige/40"
									}`}
								>
									<div className="flex items-start justify-between gap-3">
										<div className="flex min-w-0 items-center gap-2.5">
											<span
												className="h-10 w-10 shrink-0 rounded-full border border-primary-forest-green/10"
												style={{ backgroundColor: mgr.color || "#e0a030" }}
											/>
											<div className="min-w-0">
												<p className="truncate font-medium">{mgr.name}</p>
												<p className="text-xs text-primary-forest-green/60">{mgr.position || "Manager"}</p>
											</div>
										</div>
										<span
											className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
												mgr.active
													? "bg-semantic-success/12 text-semantic-success"
													: "bg-primary-forest-green/10 text-primary-forest-green/70"
											}`}
										>
											{mgr.active ? "Active" : "Inactive"}
										</span>
									</div>
									<div className="mt-3 flex flex-wrap gap-2">
										<button
											onClick={(e) => {
												e.stopPropagation();
												setSelectedManager(mgr);
											}}
											className="rounded-full border border-primary-forest-green/15 px-3 py-1 text-xs hover:bg-primary-sage-green/15"
										>
											View
										</button>
										<button
											onClick={(e) => {
												e.stopPropagation();
												removeManager(mgr._id, mgr.name);
											}}
											className="rounded-full border border-semantic-error/20 px-3 py-1 text-xs text-semantic-error hover:bg-semantic-error/10"
										>
											Remove
										</button>
									</div>
								</div>
							))}
						</div>
					)}
				</section>

				{selectedManager ? (
					<section className="rounded-3xl border border-primary-forest-green/10 bg-primary-warm-white/75 p-5 shadow-sm backdrop-blur">
						<div className="flex items-start justify-between gap-3">
							<div className="flex items-center gap-3">
								<span
									className="h-12 w-12 rounded-full border border-primary-forest-green/10"
									style={{ backgroundColor: selectedManager.color || "#e0a030" }}
								/>
								<div>
									<h3 className="text-lg font-semibold tracking-tight">{selectedManager.name}</h3>
									<p className="text-sm text-primary-forest-green/65">{selectedManager.position || "Manager"}</p>
								</div>
							</div>
							<button
								onClick={() => setSelectedManager(null)}
								className="rounded-full border border-primary-forest-green/10 px-3 py-1 text-xs hover:bg-primary-sage-green/15"
							>
								Close
							</button>
						</div>
						<div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
							<div className="rounded-2xl border border-primary-forest-green/8 bg-secondary-soft-beige/50 p-3">
								<p className="text-xs text-primary-forest-green/55">Email</p>
								<p className="truncate">{selectedManager.email || "—"}</p>
							</div>
							<div className="rounded-2xl border border-primary-forest-green/8 bg-secondary-soft-beige/50 p-3">
								<p className="text-xs text-primary-forest-green/55">Phone</p>
								<p className="truncate">{selectedManager.phone || "—"}</p>
							</div>
							<div className="rounded-2xl border border-primary-forest-green/8 bg-secondary-soft-beige/50 p-3">
								<p className="text-xs text-primary-forest-green/55">Status</p>
								<p className="capitalize">{selectedManager.active ? "Active" : "Inactive"}</p>
							</div>
							<div className="rounded-2xl border border-primary-forest-green/8 bg-secondary-soft-beige/50 p-3">
								<p className="text-xs text-primary-forest-green/55">Added</p>
								<p>
									{selectedManager.createdAt
										? new Date(selectedManager.createdAt).toLocaleDateString()
										: "—"}
								</p>
							</div>
						</div>
						{selectedManager.managerNotes ? (
							<div className="mt-3 rounded-2xl border border-primary-forest-green/8 bg-secondary-soft-beige/50 p-3 text-sm">
								<p className="text-xs text-primary-forest-green/55">Manager notes</p>
								<p className="mt-1 whitespace-pre-line">{selectedManager.managerNotes}</p>
							</div>
						) : null}
					</section>
				) : null}
			</div>
		</div>
	);
};

export default Managers;
