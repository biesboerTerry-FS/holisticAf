import React, { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { assets, dummyOrders } from "../../assets/assets";
import toast from "react-hot-toast";
import { getHttpErrorMessage } from "../../utils/http";
import { exportToCSV, exportToPDF } from "../../utils/export";

const Orders = () => {
	const { currency, axios } = useAppContext();
	const [orders, setOrders] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [updatingId, setUpdatingId] = useState(null);

	const fetchOrders = async () => {
		setLoading(true);
		setError("");
		try {
			const { data } = await axios.get("/api/order/admin", { suppressGlobalErrorToast: true });
			if (data.success) {
				setOrders(Array.isArray(data.orders) ? data.orders : []);
			} else {
				const message = data.message || "Failed to load orders";
				setError(message);
				toast.error(message);
				setOrders([]);
			}
		} catch (err) {
			console.error(err);
			const message = getHttpErrorMessage(err, "Failed to load orders");
			setError(`${message} Showing sample data if available.`);
			toast.error(message);
			setOrders(dummyOrders || []);
		} finally {
			setLoading(false);
		}
	};

	const statusHandler = async (event, orderId) => {
		const newStatus = event.target.value;
		const prev = orders;
		setUpdatingId(orderId);
		setOrders((curr) => curr.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)));
		try {
			const { data } = await axios.post(
				"/api/order/status",
				{ orderId, status: newStatus },
				{ suppressGlobalErrorToast: true },
			);

			if (data.success) {
				toast.success("Order status updated");
				await fetchOrders();
			} else {
				setOrders(prev);
				toast.error(data.message || "Failed to update status");
			}
		} catch (err) {
			console.error(err);
			setOrders(prev);
			toast.error(getHttpErrorMessage(err, "Failed to update status"));
		} finally {
			setUpdatingId(null);
		}
	};

	useEffect(() => {
		fetchOrders();
	}, []);

	const filteredOrders = orders.filter((order) => {
		const search = searchTerm.toLowerCase();
		const orderId = String(order?._id || "").toLowerCase();
		const items = Array.isArray(order?.items) ? order.items : [];
		const matchesId = orderId.includes(search);
		const matchesProduct = items.some((item) =>
			String(item?.name || item?.product || "").toLowerCase().includes(search),
		);
		return matchesId || matchesProduct;
	});

	const exportRows = useMemo(
		() =>
			filteredOrders.map((order) => {
				const items = Array.isArray(order.items) ? order.items : [];
				const itemsSummary = items
					.map((item) => `${item.name || "Item"} × ${item.quantity || 0}`)
					.join("; ");
				return {
					orderId: String(order._id || "").slice(-8) || "—",
					date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—",
					customer: order.userId ? String(order.userId).slice(-8) : "—",
					itemsSummary,
					amount: Number(typeof order.amount === "object" ? order.amount?.total : order.amount || 0).toFixed(2),
					status: order.status || "pending",
					paymentType: order.paymentType || "—",
					paid: order.isPaid ? "Yes" : "No",
				};
			}),
		[filteredOrders],
	);

	const handleExportCSV = () => exportToCSV(exportRows, "orders.csv");
	const handleExportPDF = () => exportToPDF(exportRows, "Orders", "orders.pdf");

	return (
		<div className="p-4 md:p-6 lg:p-8 text-primary-forest-green">
			<div className="mx-auto max-w-6xl space-y-5">
				<div className="flex flex-col gap-3 rounded-3xl border border-primary-forest-green/10 bg-primary-warm-white/75 p-5 shadow-sm backdrop-blur md:flex-row md:items-end md:justify-between">
					<div>
						<p className="text-xs font-medium uppercase tracking-[0.16em] text-primary-forest-green/50">Fulfillment</p>
						<h2 className="mt-1 text-2xl font-semibold tracking-tight">
							Orders <span className="text-secondary-golden-honey">management</span>
						</h2>
						<p className="mt-1 text-sm text-primary-forest-green/65">
							Search orders, review payments, and update delivery status.
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
							onClick={fetchOrders}
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
						placeholder="Search by order ID or product name..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full rounded-xl border border-primary-forest-green/10 bg-secondary-soft-beige/80 px-4 py-3 text-sm outline-none transition focus:border-secondary-golden-honey/60 focus:ring-4 focus:ring-secondary-golden-honey/10"
					/>
				</div>

				{loading ? (
					<div className="space-y-3">
						{[1, 2, 3].map((i) => (
							<div key={i} className="h-28 animate-pulse rounded-2xl border border-primary-forest-green/10 bg-primary-warm-white/60" />
						))}
					</div>
				) : filteredOrders.length > 0 ? (
					filteredOrders.map((order, index) => (
						<div key={order._id || index} className="rounded-2xl border border-primary-forest-green/10 bg-primary-warm-white/75 p-4 shadow-sm backdrop-blur transition hover:shadow-md md:p-5">
							<div className="mb-3 flex flex-wrap items-center justify-between gap-2">
								<p className="font-mono text-xs text-primary-forest-green/55">Order #{String(order._id || "").slice(-8) || "—"}</p>
								<span className={`rounded-full px-2.5 py-1 text-xs font-medium ${order.isPaid ? "bg-semantic-success/12 text-semantic-success" : "bg-semantic-warning/12 text-semantic-warning"}`}>
									{order.isPaid ? "Paid" : "Payment pending"}
								</span>
							</div>

							<div className="grid gap-4 lg:grid-cols-[1.5fr_auto_auto_auto] lg:items-center">
								<div className="flex min-w-0 gap-3">
									<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary-forest-green/10 bg-secondary-soft-beige/70">
										<img className="h-7 w-7 object-contain opacity-80" src={assets.boxIcon} alt="" />
									</div>
									<div className="min-w-0 space-y-1">
										{(order.items || []).map((item, i) => (
											<p key={i} className="truncate text-sm font-medium">
												{item.name || "Item"} <span className="text-primary-forest-green/55">× {item.quantity || 0}</span>
											</p>
										))}
									</div>
								</div>

								<div className="rounded-xl border border-primary-forest-green/8 bg-secondary-soft-beige/50 px-3 py-2 text-sm">
									<p className="text-xs text-primary-forest-green/55">Amount</p>
									<p className="text-lg font-semibold tracking-tight">
										{currency}
										{Number(typeof order.amount === "object" ? order.amount?.total : order.amount || 0).toFixed(2)}
									</p>
								</div>

								<div className="space-y-1 text-sm text-primary-forest-green/70">
									<p>Method <span className="ml-1 font-medium uppercase text-primary-forest-green">{order.paymentType || "—"}</span></p>
									<p>Date <span className="ml-1 font-medium text-primary-forest-green">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}</span></p>
								</div>

								<div className="flex flex-col gap-1.5">
									<label className="text-xs font-medium text-primary-forest-green/55" htmlFor={`status-${order._id}`}>Status</label>
									<select
										id={`status-${order._id}`}
										onChange={(e) => statusHandler(e, order._id)}
										value={order.status || "pending"}
										disabled={updatingId === order._id}
										className="rounded-xl border border-primary-forest-green/10 bg-secondary-soft-beige/80 px-3 py-2.5 text-sm font-medium outline-none transition focus:border-secondary-golden-honey/60 focus:ring-4 focus:ring-secondary-golden-honey/10 disabled:opacity-60"
									>
										<option value="pending">Pending</option>
										<option value="processing">Processing</option>
										<option value="shipped">Shipped</option>
										<option value="delivered">Delivered</option>
										<option value="cancelled">Cancelled</option>
									</select>
								</div>
							</div>
						</div>
					))
				) : (
					<div className="rounded-3xl border border-dashed border-primary-forest-green/20 bg-primary-warm-white/60 p-10 text-center shadow-sm">
						<p className="text-primary-forest-green/65">
							{searchTerm ? "No orders match your search." : "No orders found."}
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default Orders;
