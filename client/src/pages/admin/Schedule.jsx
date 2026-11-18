import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";
import { getHttpErrorMessage } from "../../utils/http";
import { exportToCSV, exportToPDF } from "../../utils/export";

const pad = (n) => String(n).padStart(2, "0");
const toYMD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const startOfWeek = (date) => {
	const d = new Date(date);
	const day = d.getDay(); // 0 Sun
	const diff = (day + 6) % 7; // Monday start
	d.setDate(d.getDate() - diff);
	d.setHours(0, 0, 0, 0);
	return d;
};
const addDays = (date, days) => {
	const d = new Date(date);
	d.setDate(d.getDate() + days);
	return d;
};

const emptyEmployee = { name: "", email: "", phone: "", position: "Staff", color: "#1e4d43", notes: "" };
const emptyShift = (date = toYMD(new Date())) => ({
	employee: "",
	date,
	startTime: "09:00",
	endTime: "17:00",
	role: "",
	location: "",
	notes: "",
	status: "scheduled",
});

const Schedule = () => {
	const { axios } = useAppContext();
	const [employees, setEmployees] = useState([]);
	const [shifts, setShifts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
	const [employeeForm, setEmployeeForm] = useState(emptyEmployee);
	const [shiftForm, setShiftForm] = useState(emptyShift(toYMD(new Date())));
	const [savingEmployee, setSavingEmployee] = useState(false);
	const [savingShift, setSavingShift] = useState(false);

	const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
	const weekRange = useMemo(() => ({ start: toYMD(weekDays[0]), end: toYMD(weekDays[6]) }), [weekDays]);

	const loadData = async () => {
		setLoading(true);
		setError("");
		try {
			const [empRes, shiftRes] = await Promise.all([
				axios.get("/api/employees", { suppressGlobalErrorToast: true }),
				axios.get("/api/employees/shifts/all", {
					params: { start: weekRange.start, end: weekRange.end },
					suppressGlobalErrorToast: true,
				}),
			]);
			if (!empRes.data?.success) throw new Error(empRes.data?.message || "Failed to load employees");
			if (!shiftRes.data?.success) throw new Error(shiftRes.data?.message || "Failed to load shifts");
			const emps = empRes.data.employees || [];
			setEmployees(emps);
			setShifts(shiftRes.data.shifts || []);
			setShiftForm((prev) => ({ ...prev, employee: prev.employee || emps[0]?._id || "" }));
		} catch (err) {
			setError(getHttpErrorMessage(err, "Failed to load schedule data"));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [weekRange.start, weekRange.end]);

	const shiftsByDay = useMemo(() => {
		const map = {};
		for (const day of weekDays) map[toYMD(day)] = [];
		for (const shift of shifts) {
			if (!map[shift.date]) map[shift.date] = [];
			map[shift.date].push(shift);
		}
		Object.values(map).forEach((list) => list.sort((a, b) => String(a.startTime).localeCompare(String(b.startTime))));
		return map;
	}, [shifts, weekDays]);

	const employeeExportRows = useMemo(
		() =>
			employees.map((emp) => ({
				name: emp.name || "—",
				email: emp.email || "—",
				phone: emp.phone || "—",
				position: emp.position || "Staff",
				role: emp.role || "staff",
				active: emp.active ? "Yes" : "No",
			})),
		[employees],
	);

	const shiftExportRows = useMemo(
		() =>
			shifts.map((shift) => {
				const emp = shift.employee || {};
				return {
					date: shift.date || "—",
					employee: emp.name || "—",
					startTime: shift.startTime || "—",
					endTime: shift.endTime || "—",
					role: shift.role || "—",
					location: shift.location || "—",
					status: shift.status || "scheduled",
				};
			}),
		[shifts],
	);

	const handleExportEmployeesCSV = () => exportToCSV(employeeExportRows, "employees.csv");
	const handleExportEmployeesPDF = () => exportToPDF(employeeExportRows, "Employees", "employees.pdf");
	const handleExportShiftsCSV = () => exportToCSV(shiftExportRows, `shifts-${weekRange.start}-to-${weekRange.end}.csv`);
	const handleExportShiftsPDF = () => exportToPDF(shiftExportRows, `Shifts ${weekRange.start} to ${weekRange.end}`, "shifts.pdf");

	const createEmployee = async (e) => {
		e.preventDefault();
		setSavingEmployee(true);
		try {
			const { data } = await axios.post("/api/employees", employeeForm, { suppressGlobalErrorToast: true });
			if (!data.success) throw new Error(data.message || "Failed to create employee");
			toast.success("Employee added");
			setEmployeeForm(emptyEmployee);
			await loadData();
		} catch (err) {
			toast.error(getHttpErrorMessage(err, "Failed to create employee"));
		} finally {
			setSavingEmployee(false);
		}
	};

	const toggleEmployeeActive = async (emp) => {
		try {
			const { data } = await axios.put(`/api/employees/${emp._id}`, { active: !emp.active }, { suppressGlobalErrorToast: true });
			if (!data.success) throw new Error(data.message || "Failed to update employee");
			setEmployees((prev) => prev.map((e) => (e._id === emp._id ? data.employee : e)));
		} catch (err) {
			toast.error(getHttpErrorMessage(err, "Failed to update employee"));
		}
	};

	const removeEmployee = async (emp) => {
		if (!window.confirm(`Delete ${emp.name} and all their shifts?`)) return;
		try {
			const { data } = await axios.delete(`/api/employees/${emp._id}`, { suppressGlobalErrorToast: true });
			if (!data.success) throw new Error(data.message || "Failed to delete employee");
			toast.success("Employee deleted");
			await loadData();
		} catch (err) {
			toast.error(getHttpErrorMessage(err, "Failed to delete employee"));
		}
	};

	const createShift = async (e) => {
		e.preventDefault();
		if (!shiftForm.employee) {
			toast.error("Select an employee");
			return;
		}
		if (shiftForm.endTime <= shiftForm.startTime) {
			toast.error("End time must be after start time");
			return;
		}
		setSavingShift(true);
		try {
			const { data } = await axios.post("/api/employees/shifts", shiftForm, { suppressGlobalErrorToast: true });
			if (!data.success) throw new Error(data.message || "Failed to create shift");
			toast.success("Shift added");
			setShiftForm((prev) => ({ ...emptyShift(prev.date), employee: prev.employee }));
			await loadData();
		} catch (err) {
			toast.error(getHttpErrorMessage(err, "Failed to create shift"));
		} finally {
			setSavingShift(false);
		}
	};

	const updateShiftStatus = async (shift, status) => {
		try {
			const { data } = await axios.put(`/api/employees/shifts/${shift._id}`, { status }, { suppressGlobalErrorToast: true });
			if (!data.success) throw new Error(data.message || "Failed to update shift");
			setShifts((prev) => prev.map((s) => (s._id === shift._id ? data.shift : s)));
		} catch (err) {
			toast.error(getHttpErrorMessage(err, "Failed to update shift"));
		}
	};

	const removeShift = async (shift) => {
		try {
			const { data } = await axios.delete(`/api/employees/shifts/${shift._id}`, { suppressGlobalErrorToast: true });
			if (!data.success) throw new Error(data.message || "Failed to delete shift");
			setShifts((prev) => prev.filter((s) => s._id !== shift._id));
			toast.success("Shift removed");
		} catch (err) {
			toast.error(getHttpErrorMessage(err, "Failed to delete shift"));
		}
	};

	return (
		<div className="p-4 md:p-6 lg:p-8 text-primary-forest-green">
			<div className="mx-auto max-w-7xl space-y-6">
				<div className="flex flex-col gap-3 rounded-3xl border border-primary-forest-green/10 bg-primary-warm-white/75 p-5 shadow-sm backdrop-blur md:flex-row md:items-end md:justify-between md:p-6">
					<div>
						<p className="text-xs font-medium uppercase tracking-[0.16em] text-primary-forest-green/50">Team</p>
						<h2 className="mt-1 text-2xl font-semibold tracking-tight">
							Employee <span className="text-secondary-golden-honey">schedule</span>
						</h2>
						<p className="mt-1 text-sm text-primary-forest-green/65">
							Manage employees and plan weekly shifts for the site.
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<button
							onClick={handleExportEmployeesCSV}
							className="rounded-full border border-primary-forest-green/15 bg-secondary-soft-beige/70 px-4 py-2 text-sm font-medium transition hover:bg-primary-sage-green/15"
						>
							Export Employees CSV
						</button>
						<button
							onClick={handleExportEmployeesPDF}
							className="rounded-full border border-primary-forest-green/15 bg-secondary-soft-beige/70 px-4 py-2 text-sm font-medium transition hover:bg-primary-sage-green/15"
						>
							Export Employees PDF
						</button>
						<button
							onClick={handleExportShiftsCSV}
							className="rounded-full border border-primary-forest-green/15 bg-secondary-soft-beige/70 px-4 py-2 text-sm font-medium transition hover:bg-primary-sage-green/15"
						>
							Export Shifts CSV
						</button>
						<button
							onClick={handleExportShiftsPDF}
							className="rounded-full border border-primary-forest-green/15 bg-secondary-soft-beige/70 px-4 py-2 text-sm font-medium transition hover:bg-primary-sage-green/15"
						>
							Export Shifts PDF
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

				<div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
					<div className="space-y-6">
						<section className="rounded-3xl border border-primary-forest-green/10 bg-primary-warm-white/75 p-4 shadow-sm backdrop-blur md:p-5">
							<h3 className="text-lg font-semibold tracking-tight">Add employee</h3>
							<form onSubmit={createEmployee} className="mt-4 space-y-3">
								<input
									className="w-full rounded-xl border border-primary-forest-green/10 bg-secondary-soft-beige/80 px-3.5 py-2.5 text-sm outline-none focus:border-secondary-golden-honey/60 focus:ring-4 focus:ring-secondary-golden-honey/10"
									placeholder="Full name"
									value={employeeForm.name}
									onChange={(e) => setEmployeeForm((p) => ({ ...p, name: e.target.value }))}
									required
								/>
								<div className="grid grid-cols-2 gap-3">
									<input
										className="rounded-xl border border-primary-forest-green/10 bg-secondary-soft-beige/80 px-3.5 py-2.5 text-sm outline-none focus:border-secondary-golden-honey/60 focus:ring-4 focus:ring-secondary-golden-honey/10"
										placeholder="Position"
										value={employeeForm.position}
										onChange={(e) => setEmployeeForm((p) => ({ ...p, position: e.target.value }))}
									/>
									<input
										type="color"
										className="h-[42px] w-full rounded-xl border border-primary-forest-green/10 bg-secondary-soft-beige/80 p-1"
										value={employeeForm.color}
										onChange={(e) => setEmployeeForm((p) => ({ ...p, color: e.target.value }))}
										title="Color"
									/>
								</div>
								<input
									type="email"
									className="w-full rounded-xl border border-primary-forest-green/10 bg-secondary-soft-beige/80 px-3.5 py-2.5 text-sm outline-none focus:border-secondary-golden-honey/60 focus:ring-4 focus:ring-secondary-golden-honey/10"
									placeholder="Email (optional)"
									value={employeeForm.email}
									onChange={(e) => setEmployeeForm((p) => ({ ...p, email: e.target.value }))}
								/>
								<input
									className="w-full rounded-xl border border-primary-forest-green/10 bg-secondary-soft-beige/80 px-3.5 py-2.5 text-sm outline-none focus:border-secondary-golden-honey/60 focus:ring-4 focus:ring-secondary-golden-honey/10"
									placeholder="Phone (optional)"
									value={employeeForm.phone}
									onChange={(e) => setEmployeeForm((p) => ({ ...p, phone: e.target.value }))}
								/>
								<textarea
									rows={2}
									className="w-full resize-y rounded-xl border border-primary-forest-green/10 bg-secondary-soft-beige/80 px-3.5 py-2.5 text-sm outline-none focus:border-secondary-golden-honey/60 focus:ring-4 focus:ring-secondary-golden-honey/10"
									placeholder="Notes (optional)"
									value={employeeForm.notes}
									onChange={(e) => setEmployeeForm((p) => ({ ...p, notes: e.target.value }))}
								/>
								<button
									disabled={savingEmployee}
									className="w-full rounded-full bg-primary-forest-green px-4 py-2.5 text-sm font-medium text-primary-cream transition hover:opacity-90 disabled:opacity-60"
								>
									{savingEmployee ? "Adding..." : "Add employee"}
								</button>
							</form>
						</section>

						<section className="rounded-3xl border border-primary-forest-green/10 bg-primary-warm-white/75 p-4 shadow-sm backdrop-blur md:p-5">
							<div className="flex items-center justify-between">
								<h3 className="text-lg font-semibold tracking-tight">Employees</h3>
								<span className="text-xs text-primary-forest-green/55">{employees.length} total</span>
							</div>
							<div className="mt-3 space-y-2 max-h-[360px] overflow-y-auto pr-1">
								{loading ? (
									<p className="text-sm text-primary-forest-green/60">Loading…</p>
								) : employees.length === 0 ? (
									<p className="text-sm text-primary-forest-green/60">No employees yet.</p>
								) : (
									employees.map((emp) => (
										<div key={emp._id} className="rounded-2xl border border-primary-forest-green/10 bg-secondary-soft-beige/40 p-3">
											<div className="flex items-start justify-between gap-2">
												<div className="min-w-0">
													<div className="flex items-center gap-2">
														<span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: emp.color || "#1e4d43" }} />
														<p className="truncate font-medium">{emp.name}</p>
														{!emp.active ? <span className="rounded-full bg-primary-forest-green/10 px-2 py-0.5 text-[10px] uppercase tracking-wide">inactive</span> : null}
													</div>
													<p className="mt-0.5 text-xs text-primary-forest-green/60">{emp.position || "Staff"}</p>
													{emp.email ? <p className="truncate text-xs text-primary-forest-green/55">{emp.email}</p> : null}
												</div>
											</div>
											<div className="mt-2 flex flex-wrap gap-2">
												<button onClick={() => toggleEmployeeActive(emp)} className="rounded-full border border-primary-forest-green/15 px-2.5 py-1 text-xs hover:bg-primary-sage-green/15">
													{emp.active ? "Set inactive" : "Set active"}
												</button>
												<button onClick={() => removeEmployee(emp)} className="rounded-full border border-semantic-error/20 px-2.5 py-1 text-xs text-semantic-error hover:bg-semantic-error/10">
													Delete
												</button>
											</div>
										</div>
									))
								)}
							</div>
						</section>
					</div>

					<div className="space-y-6">
						<section className="rounded-3xl border border-primary-forest-green/10 bg-primary-warm-white/75 p-4 shadow-sm backdrop-blur md:p-5">
							<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
								<div>
									<h3 className="text-lg font-semibold tracking-tight">Weekly schedule</h3>
									<p className="text-xs text-primary-forest-green/55">{weekRange.start} to {weekRange.end}</p>
								</div>
								<div className="flex flex-wrap items-center gap-2">
									<button onClick={() => setWeekStart((d) => addDays(d, -7))} className="rounded-full border border-primary-forest-green/15 px-3 py-1.5 text-sm hover:bg-primary-sage-green/15">Prev</button>
									<button onClick={() => setWeekStart(startOfWeek(new Date()))} className="rounded-full border border-primary-forest-green/15 px-3 py-1.5 text-sm hover:bg-primary-sage-green/15">This week</button>
									<button onClick={() => setWeekStart((d) => addDays(d, 7))} className="rounded-full border border-primary-forest-green/15 px-3 py-1.5 text-sm hover:bg-primary-sage-green/15">Next</button>
								</div>
							</div>

							<form onSubmit={createShift} className="mt-4 grid gap-3 rounded-2xl border border-primary-forest-green/10 bg-secondary-soft-beige/40 p-3 md:grid-cols-6">
								<select
									className="rounded-xl border border-primary-forest-green/10 bg-primary-warm-white/80 px-3 py-2.5 text-sm outline-none focus:border-secondary-golden-honey/60 md:col-span-2"
									value={shiftForm.employee}
									onChange={(e) => setShiftForm((p) => ({ ...p, employee: e.target.value }))}
									required
								>
									<option value="">Select employee</option>
									{employees.filter((e) => e.active).map((emp) => (
										<option key={emp._id} value={emp._id}>{emp.name} ({emp.position || "Staff"})</option>
									))}
								</select>
								<input type="date" className="rounded-xl border border-primary-forest-green/10 bg-primary-warm-white/80 px-3 py-2.5 text-sm outline-none focus:border-secondary-golden-honey/60" value={shiftForm.date} onChange={(e) => setShiftForm((p) => ({ ...p, date: e.target.value }))} required />
								<input type="time" className="rounded-xl border border-primary-forest-green/10 bg-primary-warm-white/80 px-3 py-2.5 text-sm outline-none focus:border-secondary-golden-honey/60" value={shiftForm.startTime} onChange={(e) => setShiftForm((p) => ({ ...p, startTime: e.target.value }))} required />
								<input type="time" className="rounded-xl border border-primary-forest-green/10 bg-primary-warm-white/80 px-3 py-2.5 text-sm outline-none focus:border-secondary-golden-honey/60" value={shiftForm.endTime} onChange={(e) => setShiftForm((p) => ({ ...p, endTime: e.target.value }))} required />
								<button disabled={savingShift || employees.length === 0} className="rounded-xl bg-primary-forest-green px-3 py-2.5 text-sm font-medium text-primary-cream disabled:opacity-60">
									{savingShift ? "Adding..." : "Add shift"}
								</button>
								<input className="rounded-xl border border-primary-forest-green/10 bg-primary-warm-white/80 px-3 py-2.5 text-sm outline-none focus:border-secondary-golden-honey/60 md:col-span-2" placeholder="Role/task (optional)" value={shiftForm.role} onChange={(e) => setShiftForm((p) => ({ ...p, role: e.target.value }))} />
								<input className="rounded-xl border border-primary-forest-green/10 bg-primary-warm-white/80 px-3 py-2.5 text-sm outline-none focus:border-secondary-golden-honey/60 md:col-span-2" placeholder="Location/area (optional)" value={shiftForm.location} onChange={(e) => setShiftForm((p) => ({ ...p, location: e.target.value }))} />
								<input className="rounded-xl border border-primary-forest-green/10 bg-primary-warm-white/80 px-3 py-2.5 text-sm outline-none focus:border-secondary-golden-honey/60 md:col-span-2" placeholder="Notes (optional)" value={shiftForm.notes} onChange={(e) => setShiftForm((p) => ({ ...p, notes: e.target.value }))} />
							</form>

							<div className="mt-5 grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
								{weekDays.map((day) => {
									const key = toYMD(day);
									const dayShifts = shiftsByDay[key] || [];
									const isToday = key === toYMD(new Date());
									return (
										<div key={key} className={`rounded-2xl border p-3 ${isToday ? "border-secondary-golden-honey/40 bg-secondary-golden-honey/5" : "border-primary-forest-green/10 bg-secondary-soft-beige/30"}`}>
											<div className="mb-2 flex items-center justify-between">
												<div>
													<p className="text-sm font-semibold">{day.toLocaleDateString(undefined, { weekday: "short" })}</p>
													<p className="text-xs text-primary-forest-green/55">{day.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</p>
												</div>
												<span className="rounded-full bg-primary-warm-white/70 px-2 py-0.5 text-xs text-primary-forest-green/60">{dayShifts.length}</span>
											</div>
											<div className="space-y-2 min-h-[80px]">
												{loading ? (
													<div className="h-12 animate-pulse rounded-xl bg-primary-sage-green/10" />
												) : dayShifts.length === 0 ? (
													<p className="text-xs text-primary-forest-green/45">No shifts</p>
												) : (
													dayShifts.map((shift) => {
														const emp = shift.employee || {};
														return (
															<div key={shift._id} className="rounded-xl border border-primary-forest-green/10 bg-primary-warm-white/80 p-2.5">
																<div className="flex items-start justify-between gap-2">
																	<div className="min-w-0">
																		<div className="flex items-center gap-2">
																			<span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: emp.color || "#1e4d43" }} />
																			<p className="truncate text-sm font-medium">{emp.name || "Employee"}</p>
																		</div>
																		<p className="text-xs text-primary-forest-green/70">{shift.startTime} - {shift.endTime}</p>
																		{shift.role ? <p className="text-xs text-primary-forest-green/60">{shift.role}</p> : null}
																		{shift.location ? <p className="text-xs text-primary-forest-green/55">{shift.location}</p> : null}
																	</div>
																	<span className={`rounded-full px-2 py-0.5 text-[10px] capitalize ${shift.status === "completed" ? "bg-semantic-success/12 text-semantic-success" : shift.status === "cancelled" ? "bg-semantic-error/12 text-semantic-error" : "bg-secondary-golden-honey/15 text-secondary-earthy-brown"}`}>
																		{shift.status}
																	</span>
																</div>
																<div className="mt-2 flex flex-wrap gap-1.5">
																	<select
																		value={shift.status}
																		onChange={(e) => updateShiftStatus(shift, e.target.value)}
																		className="rounded-lg border border-primary-forest-green/10 bg-secondary-soft-beige/70 px-2 py-1 text-[11px]"
																	>
																		<option value="scheduled">Scheduled</option>
																		<option value="completed">Completed</option>
																		<option value="cancelled">Cancelled</option>
																	</select>
																	<button onClick={() => removeShift(shift)} className="rounded-lg border border-semantic-error/20 px-2 py-1 text-[11px] text-semantic-error hover:bg-semantic-error/10">Remove</button>
																</div>
															</div>
														);
													})
												)}
											</div>
										</div>
									);
								})}
							</div>
						</section>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Schedule;
