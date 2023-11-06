import express from "express";
import cors from "cors";
import path from "path";
import cron from "node-cron";

import authController from "./src/controllers/AuthController";
import userController from "./src/controllers/UserController";
import ticketController from "./src/controllers/TicketController";
import equipamentController from "./src/controllers/EquipamentController";
import ticketCategoryController from "./src/controllers/TicketCategory";
import ticketPriorityController from "./src/controllers/TicketPriority";
import ticketTypeController from "./src/controllers/TicketTypeController";
import locationController from "./src/controllers/LocationController";
import maintenanceController from "./src/controllers/MaintenanceController";
import colletInformationController from "./src/controllers/ColletInformation";
import providerController from "./src/controllers/ProviderController";
import companiesController from "./src/controllers/CompanyController";
import slaController from "./src/controllers/SLAController";
import depositController from "./src/controllers/DepositController";
import depositItemController from "./src/controllers/DepositItemController";
import groupController from "./src/controllers/GroupController";
import todooController from "./src/controllers/TodooController";
import typeOfEquipmentsController from "./src/controllers/EquipmentTypeController";
import generatePDF from "./src/controllers/GeneratePDFController";
import reportController from "./src/controllers/ReportController";

import { processEmailQueue } from "./src/services/processQueue";

const app = express();

app.use((_, response, next) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header(
    "Access-Control-Allow-Methods",
    "GET,HEAD,OPTIONS,POST,PUT,PATCH"
  );
  response.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  response.header("Access-Control-Expose-Headers", "x-total-count");

  return next();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/authenticate", authController);
app.use("/account", userController);
app.use("/ticket", ticketController);
app.use("/ticket-category", ticketCategoryController);
app.use("/ticket-priority", ticketPriorityController);
app.use("/ticket-type", ticketTypeController);
app.use("/location", locationController);
app.use("/equipament", equipamentController);
app.use("/maintenance", maintenanceController);
app.use("/collect", colletInformationController);
app.use("/providers", providerController);
app.use("/companies", companiesController);
app.use("/sla", slaController);
app.use("/deposit", depositController);
app.use("/deposit-item", depositItemController);
app.use("/todoo", todooController);
app.use("/group", groupController);
app.use("/equipmentType", typeOfEquipmentsController);
app.use("/pdf-gen", generatePDF);
app.use("/report", reportController);

app.get("/", (req, res) => {
  return res.json({ status: "OK", data: new Date().toLocaleString() });
});

const port = process.env.PORT || 3333;

cron.schedule("*/2 * * * *", processEmailQueue);

app.listen(port, () => {
  console.log(`Server running at https://localhost:${port}/`);
});
