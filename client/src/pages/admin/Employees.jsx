import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";
import { getHttpErrorMessage } from "../../utils/http";
import { exportToCSV, exportToPDF } from "../../utils/export";

const emptyEmployee = {
	name: "",
	email: "",
	phone: "",
	position: "Staff",
	color: "#1e4d43",
	active: true,
	role: "staff",
	notes: "",
};

const ROLE_OPTIONS = [
	{ value: "staff", label: "Staff" },
	{ value: "manager", label: "Manager" },
];

const Employees = () => {
	const { axios } = useAppContext();
	const [employees, setEmployees] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [roleFilter, setRoleFilter] = useState("all");
	const [form, setForm] = useState(emptyEmployee);
	const [editingId, setEditingId] = useState(null);
	const [saving, setSaving] = useState(false);
	const [selectedEmployee, setSelectedEmployee] = useState(null);

	const loadEmployees = async () => {
		setLoading(true);
		setError("");
		try {
			const { data } = await axios.get("/api/employees", { suppressGlobalErrorToast: true });
			if (!data.success) throw new Error(data.message || "Failed to load employees");
			setEmployees(data.employees || []);
		} catch (err) {
			setError(getHttpErrorMessage(err, "Failed to load employees"));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadEmployees();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return employees.filter((emp) => {
			const matchesQuery =
				!q ||
				(emp.name || "").toLowerCase().includes(q) ||
				(emp.email || "").toLowerCase().includes(q) ||
				(emp.position || "").toLowerCase().includes(q) ||
				(emp.phone || "").toLowerCase().includes(q);
			const matchesStatus = statusFilter === "all" ? true : statusFilter === "active" ? emp.active : !emp.active;
			const matchesRole = roleFilter === "all" ? true : emp.role === roleFilter;
			return matchesQuery && matchesStatus && matchesRole;
		});
	}, [employees, query, statusFilter, roleFilter]);

	const resetForm = () => {
		setForm(emptyEmployee);
		setEditingId(null);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!form.name.trim()) {
			toast.error("Name is required");
			return;
		}
		setSaving(true);
		try {
			const payload = { ...form, name: form.name.trim() };
			let data;
			if (editingId) {
				const res = await axios.put(`/api/employees/${editingId}`, payload, { suppressGlobalErrorToast: true });
				data = res.data;
			} else {
				const res = await axios.post("/api/employees", payload, { suppressGlobalErrorToast: true });
				data = res.data;
			}
			if (!data.success) throw new Error(data.message || "Failed to save employee");
			toast.success(editingId ? "Employee updated" : "Employee added");
			resetForm();
			await loadEmployees();
		} catch (err) {
			toast.error(getHttpErrorMessage(err, "Failed to save employee"));
		} finally {
			setSaving(false);
		}
	};

	const startEdit = (emp) => {
		setForm({
			name: emp.name || "",
			email: emp.email || "",
			phone: emp.phone || "",
			position: emp.position || "Staff",
			color: emp.color || "#1e4d43",
			active: emp.active !== false,
			role: emp.role || "staff",
			notes: emp.notes || "",
		});
		setEditingId(emp._id);
		setSelectedEmployee(null);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const removeEmployee = async (id, name) => {
		if (!window.confirm(`Delete ${name || "this employee"} and all their shifts?`)) return;
		try {
			const { data } = await axios.delete(`/api/employees/${id}`, { suppressGlobalErrorToast: true });
			if (!data.success) throw new Error(data.message || "Failed to delete employee");
			toast.success("Employee deleted");
			if (editingId === id) resetForm();
			if (selectedEmployee?._id === id) setSelectedEmployee(null);
			await loadEmployees();
		} catch (err) {
			toast.error(getHttpErrorMessage(err, "Failed to delete employee"));
		}
	};

	const activeCount = employees.filter((e) => e.active).length;
	const managerCount = employees.filter((e) => e.role === "manager").length;

	const exportRows = useMemo(
		() =>
			filtered.map((emp) => ({
				Name: emp.name,
				Position: emp.position || "Staff",
				Role: emp.role === "manager" ? "Manager" : "Staff",
				Email: emp.email || "—",
				Phone: emp.phone || "—",
				Status: emp.active ? "Active" : "Inactive",
			})),
		[filtered],
	);

	return (
		<div className="p-4 md:p-6 lg:p-8 text-primary-forest-green">
			<div className="mx-auto max-w-6xl space-y-6">
				<div className="flex flex-col gap-3 rounded-3xl border border-primary-forest-green/10 bg-primary-warm-white/75 p-5 shadow-sm backdrop-blur md:flex-row md:items-end md:justify-between md:p-6">
					<div>
						<p className="text-xs font-medium uppercase tracking-[0.16em] text-primary-forest-green/50">Team</p>
						<h2 className="mt-1 text-2xl font-semibold tracking-tight">
							Employee <span className="text-secondary-golden-honey">directory</span>
						</h2>
						<p className="mt-1 text-sm text-primary-forest-green/65">
							Manage staff details, roles, and status in one place.
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<div className="rounded-2xl border border-primary-forest-green/10 bg-secondary-soft-beige/50 px-4 py-2 text-sm">
							<span className="font-semibold">{employees.length}</span> total ·{" "}
							<span className="font-semibold text-semantic-success">{activeCount}</span> active ·{" "}
							<span className="font-semibold text-secondary-golden-honey">{managerCount}</span> managers
						</div>
						<button
							onClick={() => exportToCSV(exportRows, "employees.csv")}
							className="rounded-full border border-primary-forest-green/15 bg-secondary-soft-beige/70 px-4 py-2 text-sm font-medium transition hover:bg-primary-sage-green/15"
						>
							Export CSV
						</button>
						<button
							onClick={() => exportToPDF(exportRows, "Employees", "employees.pdf")}
							className="rounded-full border border-primary-forest-green/15 bg-secondary-soft-beige/70 px-4 py-2 text-sm font-medium transition hover:bg-primary-sage-green/15"
						>
							Export PDF
						</button>
					</div>
				</div>

				{error ? (
					<div className="rounded-2xl border border-semantic-error/20 bg-semantic-error/10 p-4 text-sm text-semantic-error shadow-sm">
						{error}
					</div>
				) : null}

				<div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
					<section className="rounded-3xl border border-primary-forest-green/10 bg-primary-warm-white/75 p-4 shadow-sm backdrop-blur md:p-5">
						<h3 className="text-lg font-semibold tracking-tight">
							{editingId ? "Edit employee" : "Add employee"}
						</h3>
						<form onSubmit={handleSubmit} className="mt-4 space-y-3">
							<input
								type="text"
								placeholder="Full name"
								required
								value={form.name}
								onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
								className="w-full rounded-xl border border-primary-forest-green/10 bg-secondary-soft-beige/80 px-3.5 py-2.5 text-sm outline-none focus:border-secondary-golden-honey/60 focus:ring-4 focus:ring-secondary-golden-honey/10"
							/>
							<div className="grid grid-cols-2 gap-3">
								<input
									type="text"
									placeholder="Position"
									value={form.position}
									onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
									className="rounded-xl border border-primary-forest-green/10 bg-secondary-soft-beige/80 px-3.5 py-2.5 text-sm outline-none focus:border-secondary-golden-honey/60 focus:ring-4 focus:ring-secondary-golden-honey/10"
								/>
								<select
									value={form.role}
									onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
									className="rounded-xl border border-primary-forest-green/10 bg-secondary-soft-beige/80 px-3 py-2.5 text-sm outline-none focus:border-secondary-golden-honey/60"
								>
									{ROLE_OPTIONS.map((opt) => (
										<option key={opt.value} value={opt.value}>
											{opt.label}
										</option>
									))}
								</select>
							</div>
							<div className="grid grid-cols-[1fr_80px] gap-3">
								<input
									type="email"
									placeholder="Email (optional)"
									value={form.email}
									onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
									className="rounded-xl border border-primary-forest-green/10 bg-secondary-soft-beige/80 px-3.5 py-2.5 text-sm outline-none focus:border-secondary-golden-honey/60 focus:ring-4 focus:ring-secondary-golden-honey/10"
								/>
								<input
									type="color"
									value={form.color}
									onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
									className="h-[42px] w-full rounded-xl border border-primary-forest-green/10 bg-secondary-soft-beige/80 p-1"
									title="Color"
								/>
							</div>
							<input
								type="text"
								placeholder="Phone (optional)"
								value={form.phone}
								onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
								className="w-full rounded-xl border border-primary-forest-green/10 bg-secondary-soft-beige/80 px-3.5 py-2.5 text-sm outline-none focus:border-secondary-golden-honey/60 focus:ring-4 focus:ring-secondary-golden-honey/10"
							/>
							<textarea
								rows={2}
								placeholder="Notes (optional)"
								value={form.notes}
								onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
								className="w-full resize-y rounded-xl border border-primary-forest-green/10 bg-secondary-soft-beige/80 px-3.5 py-2.5 text-sm outline-none focus:border-secondary-golden-honey/60 focus:ring-4 focus:ring-secondary-golden-honey/10"
							/>
							<label className="flex items-center gap-2 text-sm">
								<input
									type="checkbox"
									checked={form.active}
									onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
									className="h-4 w-4 accent-primary-forest-green"
								/>
								Active employee
							</label>
							<div className="flex gap-2 pt-1">
								<button
									type="submit"
									disabled={saving}
									className="flex-1 rounded-full bg-primary-forest-green px-4 py-2.5 text-sm font-medium text-primary-cream transition hover:opacity-90 disabled:opacity-60"
								>
									{saving ? "Saving..." : editingId ? "Update employee" : "Add employee"}
								</button>
								{editingId ? (
									<button
										type="button"
										onClick={resetForm}
										className="rounded-full border border-primary-forest-green/15 bg-secondary-soft-beige/70 px-4 py-2.5 text-sm font-medium transition hover:bg-primary-sage-green/15"
									>
										Cancel
									</button>
								) : null}
							</div>
						</form>
					</section>

					<div className="space-y-5">
						<section className="rounded-3xl border border-primary-forest-green/10 bg-primary-warm-white/75 p-4 shadow-sm backdrop-blur md:p-5">
							<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
								<h3 className="text-lg font-semibold tracking-tight">All employees</h3>
								<div className="flex flex-wrap gap-2">
									<input
										type="text"
										placeholder="Search..."
										value={query}
										onChange={(e) => setQuery(e.target.value)}
										className="rounded-xl border border-primary-forest-green/10 bg-secondary-soft-beige/80 px-3.5 py-2 text-sm outline-none focus:border-secondary-golden-honey/60"
									/>
									<select
										value={statusFilter}
										onChange={(e) => setStatusFilter(e.target.value)}
										className="rounded-xl border border-primary-forest-green/10 bg-secondary-soft-beige/80 px-3 py-2 text-sm outline-none focus:border-secondary-golden-honey/60"
									>
										<option value="all">All statuses</option>
										<option value="active">Active</option>
										<option value="inactive">Inactive</option>
									</select>
									<select
										value={roleFilter}
										onChange={(e) => setRoleFilter(e.target.value)}
										className="rounded-xl border border-primary-forest-green/10 bg-secondary-soft-beige/80 px-3 py-2 text-sm outline-none focus:border-secondary-golden-honey/60"
									>
										<option value="all">All roles</option>
										<option value="staff">Staff</option>
										<option value="manager">Manager</option>
									</select>
								</div>
							</div>

							{loading ? (
								<div className="mt-4 space-y-2">
									<div className="h-16 animate-pulse rounded-2xl bg-primary-sage-green/10" />
									<div className="h-16 animate-pulse rounded-2xl bg-primary-sage-green/10" />
									<div className="h-16 animate-pulse rounded-2xl bg-primary-sage-green/10" />
								</div>
							) : filtered.length === 0 ? (
								<div className="mt-4 rounded-2xl border border-dashed border-primary-forest-green/15 bg-secondary-soft-beige/50 p-8 text-center text-sm text-primary-forest-green/60">
									{query || statusFilter !== "all" || roleFilter !== "all"
										? "No employees match your filters."
										: "No employees yet. Add one to get started."}
								</div>
							) : (
								<div className="mt-4 grid gap-3 sm:grid-cols-2">
									{filtered.map((emp) => (
										<div
											key={emp._id}
											onClick={() => setSelectedEmployee(emp)}
											className={`cursor-pointer rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-sm ${
												selectedEmployee?._id === emp._id
													? "border-secondary-golden-honey/50 bg-secondary-golden-honey/5"
													: "border-primary-forest-green/10 bg-secondary-soft-beige/40"
											}`}
										>
											<div className="flex items-start justify-between gap-3">
												<div className="flex min-w-0 items-center gap-2.5">
													<span
														className="h-3 w-3 shrink-0 rounded-full"
														style={{ backgroundColor: emp.color || "#1e4d43" }}
													/>
													<div className="min-w-0">
														<p className="truncate font-medium">{emp.name}</p>
														<p className="text-xs text-primary-forest-green/60">{emp.position || "Staff"}</p>
													</div>
												</div>
												<div className="flex shrink-0 flex-wrap gap-1">
													<span
														className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
															emp.active
																? "bg-semantic-success/12 text-semantic-success"
																: "bg-primary-forest-green/10 text-primary-forest-green/70"
														}`}
													>
														{emp.active ? "Active" : "Inactive"}
													</span>
													<span
														className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
															emp.role === "manager"
																? "bg-secondary-golden-honey/15 text-secondary-earthy-brown"
																: "bg-primary-sage-green/15 text-primary-forest-green"
														}`}
													>
														{emp.role === "manager" ? "Manager" : "Staff"}
													</span>
												</div>
											</div>
											<div className="mt-3 flex flex-wrap gap-2">
												<button
													onClick={(e) => {
														e.stopPropagation();
														startEdit(emp);
													}}
													className="rounded-full border border-primary-forest-green/15 px-3 py-1 text-xs hover:bg-primary-sage-green/15"
												>
													Edit
												</button>
												<button
													onClick={(e) => {
														e.stopPropagation();
														removeEmployee(emp._id, emp.name);
													}}
													className="rounded-full border border-semantic-error/20 px-3 py-1 text-xs text-semantic-error hover:bg-semantic-error/10"
												>
													Delete
												</button>
											</div>
										</div>
									))}
								</div>
							)}
						</section>

						{selectedEmployee ? (
							<section className="rounded-3xl border border-primary-forest-green/10 bg-primary-warm-white/75 p-5 shadow-sm backdrop-blur">
								<div className="flex items-start justify-between gap-3">
									<div className="flex items-center gap-3">
										<span
											className="h-4 w-4 rounded-full"
											style={{ backgroundColor: selectedEmployee.color || "#1e4d43" }}
										/>
										<div>
											<h3 className="text-lg font-semibold tracking-tight">{selectedEmployee.name}</h3>
											<p className="text-sm text-primary-forest-green/65">
												{selectedEmployee.position || "Staff"} ·{" "}
												{selectedEmployee.role === "manager" ? "Manager" : "Staff"}
											</p>
										</div>
									</div>
									<button
										onClick={() => setSelectedEmployee(null)}
										className="rounded-full border border-primary-forest-green/10 px-3 py-1 text-xs hover:bg-primary-sage-green/15"
									>
										Close
									</button>
								</div>
								<div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
									<div className="rounded-2xl border border-primary-forest-green/8 bg-secondary-soft-beige/50 p-3">
										<p className="text-xs text-primary-forest-green/55">Email</p>
										<p className="truncate">{selectedEmployee.email || "—"}</p>
									</div>
									<div className="rounded-2xl border border-primary-forest-green/8 bg-secondary-soft-beige/50 p-3">
										<p className="text-xs text-primary-forest-green/55">Phone</p>
										<p className="truncate">{selectedEmployee.phone || "—"}</p>
									</div>
									<div className="rounded-2xl border border-primary-forest-green/8 bg-secondary-soft-beige/50 p-3">
										<p className="text-xs text-primary-forest-green/55">Status</p>
										<p className="capitalize">{selectedEmployee.active ? "Active" : "Inactive"}</p>
									</div>
									<div className="rounded-2xl border border-primary-forest-green/8 bg-secondary-soft-beige/50 p-3">
										<p className="text-xs text-primary-forest-green/55">Added</p>
										<p>
											{selectedEmployee.createdAt
												? new Date(selectedEmployee.createdAt).toLocaleDateString()
												: "—"}
										</p>
									</div>
								</div>
								{selectedEmployee.notes ? (
									<div className="mt-3 rounded-2xl border border-primary-forest-green/8 bg-secondary-soft-beige/50 p-3 text-sm">
										<p className="text-xs text-primary-forest-green/55">Notes</p>
										<p className="mt-1 whitespace-pre-line">{selectedEmployee.notes}</p>
									</div>
								) : null}
							</section>
						) : null}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Employees;
