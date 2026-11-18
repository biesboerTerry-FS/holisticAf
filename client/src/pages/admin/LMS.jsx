import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";
import { getHttpErrorMessage } from "../../utils/http";
import { exportToCSV, exportToPDF } from "../../utils/export";

const STATUS_OPTIONS = [
	{ value: "draft", label: "Draft" },
	{ value: "active", label: "Active" },
	{ value: "archived", label: "Archived" },
];

const emptyTraining = {
	title: "",
	description: "",
	assignedTo: [],
	dueDate: "",
	status: "draft",
};

const LMS = () => {
	const { axios } = useAppContext();
	const [trainings, setTrainings] = useState([]);
	const [employees, setEmployees] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [query, setQuery] = useState("");
	const [form, setForm] = useState(emptyTraining);
	const [editingId, setEditingId] = useState(null);
	const [saving, setSaving] = useState(false);
	const [statusFilter, setStatusFilter] = useState("all");

	const loadData = async () => {
		setLoading(true);
		setError("");
		try {
			const [trainRes, empRes] = await Promise.all([
				axios.get("/api/employees/trainings", { suppressGlobalErrorToast: true }),
				axios.get("/api/employees", { suppressGlobalErrorToast: true }),
			]);
			if (!trainRes.data?.success) throw new Error(trainRes.data?.message || "Failed to load trainings");
			if (!empRes.data?.success) throw new Error(empRes.data?.message || "Failed to load employees");
			setTrainings(trainRes.data.trainings || []);
			setEmployees(empRes.data.employees || []);
		} catch (err) {
			setError(getHttpErrorMessage(err, "Failed to load LMS data"));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return trainings.filter((t) => {
			const matchesQuery =
				!q ||
				(t.title || "").toLowerCase().includes(q) ||
				(t.description || "").toLowerCase().includes(q);
			const matchesStatus = statusFilter === "all" ? true : t.status === statusFilter;
			return matchesQuery && matchesStatus;
		});
	}, [trainings, query, statusFilter]);

	const exportRows = useMemo(
		() =>
			filtered.map((t) => ({
				Title: t.title,
				Status: t.status,
				Due: t.dueDate || "—",
				Assigned: (t.assignedTo || []).map((e) => e.name).join(", ") || "—",
				Completed: `${t.completedBy?.length || 0} / ${t.assignedTo?.length || 0}`,
			})),
		[filtered],
	);

	const resetForm = () => {
		setForm(emptyTraining);
		setEditingId(null);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!form.title.trim()) {
			toast.error("Title is required");
			return;
		}
		setSaving(true);
		try {
			const payload = { ...form, title: form.title.trim() };
			let data;
			if (editingId) {
				const res = await axios.put(`/api/employees/trainings/${editingId}`, payload, { suppressGlobalErrorToast: true });
				data = res.data;
			} else {
				const res = await axios.post("/api/employees/trainings", payload, { suppressGlobalErrorToast: true });
				data = res.data;
			}
			if (!data.success) throw new Error(data.message || "Failed to save training");
			toast.success(editingId ? "Training updated" : "Training created");
			resetForm();
			await loadData();
		} catch (err) {
			toast.error(getHttpErrorMessage(err, "Failed to save training"));
		} finally {
			setSaving(false);
		}
	};

	const startEdit = (training) => {
		setForm({
			title: training.title || "",
			description: training.description || "",
			assignedTo: (training.assignedTo || []).map((e) => String(e._id || e)),
			dueDate: training.dueDate || "",
			status: training.status || "draft",
		});
		setEditingId(training._id);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const deleteTraining = async (id, title) => {
		if (!window.confirm(`Delete training "${title || "Untitled"}"?`)) return;
		try {
			const { data } = await axios.delete(`/api/employees/trainings/${id}`, { suppressGlobalErrorToast: true });
			if (!data.success) throw new Error(data.message || "Failed to delete training");
			toast.success("Training deleted");
			if (editingId === id) resetForm();
			await loadData();
		} catch (err) {
			toast.error(getHttpErrorMessage(err, "Failed to delete training"));
		}
	};

	const markComplete = async (trainingId, employeeId) => {
		try {
			const { data } = await axios.post(
				`/api/employees/trainings/${trainingId}/complete`,
				{ employeeId },
				{ suppressGlobalErrorToast: true },
			);
			if (!data.success) throw new Error(data.message || "Failed to mark complete");
			toast.success("Marked complete");
			await loadData();
		} catch (err) {
			toast.error(getHttpErrorMessage(err, "Failed to mark complete"));
		}
	};

	const toggleAssigned = (id) => {
		setForm((prev) => {
			const set = new Set(prev.assignedTo);
			if (set.has(id)) set.delete(id);
			else set.add(id);
			return { ...prev, assignedTo: Array.from(set) };
		});
	};

	const completionFor = (training, empId) =>
		training.completedBy?.some((c) => String(c.employeeId?._id || c.employeeId) === String(empId));

	return (
		<div className="p-4 md:p-6 lg:p-8 text-primary-forest-green">
			<div className="mx-auto max-w-6xl space-y-6">
				<div className="flex flex-col gap-3 rounded-3xl border border-primary-forest-green/10 bg-primary-warm-white/75 p-5 shadow-sm backdrop-blur md:flex-row md:items-end md:justify-between md:p-6">
					<div>
						<p className="text-xs font-medium uppercase tracking-[0.16em] text-primary-forest-green/50">Learning</p>
						<h2 className="mt-1 text-2xl font-semibold tracking-tight">
							Learning <span className="text-secondary-golden-honey">Management</span>
						</h2>
						<p className="mt-1 text-sm text-primary-forest-green/65">
							Create trainings, assign staff or managers, and track completions.
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<button
							onClick={() => exportToCSV(exportRows, "trainings.csv")}
							className="rounded-full border border-primary-forest-green/15 bg-secondary-soft-beige/70 px-4 py-2 text-sm font-medium transition hover:bg-primary-sage-green/15"
						>
							Export CSV
						</button>
						<button
							onClick={() => exportToPDF(exportRows, "Trainings", "trainings.pdf")}
							className="rounded-full border border-primary-forest-green/15 bg-secondary-soft-beige/70 px-4 py-2 text-sm font-medium transition hover:bg-primary-sage-green/15"
						>
							Export PDF
						</button>
						<button
							onClick={loadData}
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

				<div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
					<section className="rounded-3xl border border-primary-forest-green/10 bg-primary-warm-white/75 p-4 shadow-sm backdrop-blur md:p-5">
						<h3 className="text-lg font-semibold tracking-tight">{editingId ? "Edit training" : "New training"}</h3>
						<form onSubmit={handleSubmit} className="mt-4 space-y-3">
							<input
								type="text"
								placeholder="Training title"
								required
								value={form.title}
								onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
								className="w-full rounded-xl border border-primary-forest-green/10 bg-secondary-soft-beige/80 px-3.5 py-2.5 text-sm outline-none focus:border-secondary-golden-honey/60 focus:ring-4 focus:ring-secondary-golden-honey/10"
							/>
							<textarea
								rows={3}
								placeholder="Description (optional)"
								value={form.description}
								onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
								className="w-full resize-y rounded-xl border border-primary-forest-green/10 bg-secondary-soft-beige/80 px-3.5 py-2.5 text-sm outline-none focus:border-secondary-golden-honey/60 focus:ring-4 focus:ring-secondary-golden-honey/10"
							/>
							<div className="grid grid-cols-2 gap-3">
								<input
									type="date"
									value={form.dueDate}
									onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
									className="rounded-xl border border-primary-forest-green/10 bg-secondary-soft-beige/80 px-3.5 py-2.5 text-sm outline-none focus:border-secondary-golden-honey/60"
								/>
								<select
									value={form.status}
									onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
									className="rounded-xl border border-primary-forest-green/10 bg-secondary-soft-beige/80 px-3 py-2.5 text-sm outline-none focus:border-secondary-golden-honey/60"
								>
									{STATUS_OPTIONS.map((opt) => (
										<option key={opt.value} value={opt.value}>
											{opt.label}
										</option>
									))}
								</select>
							</div>

							<div>
								<p className="mb-2 text-sm font-medium">Assign to</p>
								<div className="max-h-48 overflow-y-auto rounded-2xl border border-primary-forest-green/10 bg-secondary-soft-beige/40 p-2 space-y-1">
									{employees.length === 0 ? (
										<p className="px-2 py-1 text-xs text-primary-forest-green/55">No employees found.</p>
									) : (
										employees.map((emp) => (
											<label key={emp._id} className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-primary-sage-green/10 cursor-pointer">
												<input
													type="checkbox"
													checked={form.assignedTo.includes(String(emp._id))}
													onChange={() => toggleAssigned(String(emp._id))}
													className="h-4 w-4 accent-primary-forest-green"
												/>
												<span className="text-sm truncate">
													{emp.name} <span className="text-xs text-primary-forest-green/55">({emp.role || "staff"})</span>
												</span>
											</label>
										))
										)}
									</div>
								</div>

							<div className="flex gap-2 pt-1">
								<button
									type="submit"
									disabled={saving}
									className="flex-1 rounded-full bg-primary-forest-green px-4 py-2.5 text-sm font-medium text-primary-cream transition hover:opacity-90 disabled:opacity-60"
								>
									{saving ? "Saving..." : editingId ? "Update training" : "Create training"}
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
								<h3 className="text-lg font-semibold tracking-tight">All trainings</h3>
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
										<option value="draft">Draft</option>
										<option value="active">Active</option>
										<option value="archived">Archived</option>
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
									{query || statusFilter !== "all"
										? "No trainings match your filters."
										: "No trainings yet. Create one to get started."}
								</div>
							) : (
								<div className="mt-4 grid gap-4">
									{filtered.map((training) => (
										<div
											key={training._id}
											className="rounded-2xl border border-primary-forest-green/10 bg-secondary-soft-beige/40 p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
										>
											<div className="flex flex-wrap items-start justify-between gap-3">
												<div>
													<div className="flex flex-wrap items-center gap-2">
														<p className="font-medium">{training.title}</p>
														<span
															className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
																training.status === "active"
																	? "bg-semantic-success/12 text-semantic-success"
																	: training.status === "archived"
																		? "bg-primary-forest-green/10 text-primary-forest-green/70"
																		: "bg-secondary-golden-honey/15 text-secondary-earthy-brown"
															}`}
														>
															{training.status}
														</span>
													</div>
													{training.description ? (
														<p className="mt-1 text-sm text-primary-forest-green/65">{training.description}</p>
													) : null}
													<p className="mt-1 text-xs text-primary-forest-green/55">
															Due: {training.dueDate || "No due date"} · Assigned: {training.assignedTo?.length || 0} · Completed:{" "}
															{training.completedBy?.length || 0}
														</p>
												</div>
												<div className="flex flex-wrap gap-2">
													<button
														onClick={() => startEdit(training)}
														className="rounded-full border border-primary-forest-green/15 px-3 py-1 text-xs hover:bg-primary-sage-green/15"
													>
														Edit
													</button>
													<button
														onClick={() => deleteTraining(training._id, training.title)}
														className="rounded-full border border-semantic-error/20 px-3 py-1 text-xs text-semantic-error hover:bg-semantic-error/10"
													>
														Delete
													</button>
												</div>
											</div>

											{training.assignedTo?.length > 0 ? (
												<div className="mt-3 rounded-2xl border border-primary-forest-green/8 bg-primary-warm-white/60 p-3">
													<p className="text-xs font-medium text-primary-forest-green/70 mb-2">Assignee progress</p>
													<div className="flex flex-wrap gap-2">
														{training.assignedTo.map((emp) => {
															const done = completionFor(training, emp._id);
															return (
																<button
																	key={emp._id}
																	onClick={() => !done && markComplete(training._id, emp._id)}
																	disabled={done}
																	className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition ${
																		done
																			? "border-semantic-success/30 bg-semantic-success/10 text-semantic-success cursor-default"
																			: "border-primary-forest-green/15 bg-secondary-soft-beige/70 hover:bg-primary-sage-green/15"
																	}`}
																>
																	<span
																		className="h-2 w-2 rounded-full"
																		style={{ backgroundColor: emp.color || "#1e4d43" }}
									/>
																	{emp.name} {done ? "✓" : "Mark done"}
																</button>
															);
														})}
													</div>
												</div>
											) : null}
										</div>
									))}
								</div>
							)}
						</section>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LMS;
