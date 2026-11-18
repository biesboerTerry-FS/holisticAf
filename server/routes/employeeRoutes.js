import express from "express";
import {
	createEmployee,
	listEmployees,
	updateEmployee,
	deleteEmployee,
	createShift,
	listShifts,
	updateShift,
	deleteShift,
	listTrainings,
	createTraining,
	updateTraining,
	deleteTraining,
	completeTraining,
} from "../controllers/employeeController.js";

const employeeRouter = express.Router();

employeeRouter.get("/", listEmployees);
employeeRouter.post("/", createEmployee);
employeeRouter.put("/:id", updateEmployee);
employeeRouter.delete("/:id", deleteEmployee);

employeeRouter.get("/shifts/all", listShifts);
employeeRouter.post("/shifts", createShift);
employeeRouter.put("/shifts/:id", updateShift);
employeeRouter.delete("/shifts/:id", deleteShift);

employeeRouter.get("/trainings", listTrainings);
employeeRouter.post("/trainings", createTraining);
employeeRouter.put("/trainings/:id", updateTraining);
employeeRouter.delete("/trainings/:id", deleteTraining);
employeeRouter.post("/trainings/:id/complete", completeTraining);

export default employeeRouter;
