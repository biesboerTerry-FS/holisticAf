import mongoose from "mongoose";

const trainingSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		description: { type: String, trim: true, default: "" },
		assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],
		dueDate: { type: String, trim: true, default: "" }, // YYYY-MM-DD
		completedBy: [
			{
				employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
				completedAt: { type: Date, default: Date.now },
			},
		],
		status: {
			type: String,
			enum: ["draft", "active", "archived"],
			default: "draft",
		},
	},
	{ timestamps: true },
);

const Training = mongoose.models.Training || mongoose.model("Training", trainingSchema);

export default Training;
