import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		email: { type: String, trim: true, lowercase: true, default: "" },
		phone: { type: String, trim: true, default: "" },
		position: { type: String, trim: true, default: "Staff" },
		role: { type: String, trim: true, lowercase: true, enum: ["staff", "manager"], default: "staff" },
		color: { type: String, trim: true, default: "#1e4d43" },
		active: { type: Boolean, default: true },
		notes: { type: String, trim: true, default: "" },
		managerNotes: { type: String, trim: true, default: "" },
	},
	{ timestamps: true },
);

const Employee = mongoose.models.Employee || mongoose.model("Employee", employeeSchema);

export default Employee;
