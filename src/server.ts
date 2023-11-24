require("dotenv").config();

import express from "express";
import cors from "cors";
import path from "path";
import cron from "node-cron";

import authController from "./controllers/AuthController";
import userController from "./controllers/UserController";
import ticketController from "./controllers/TicketController";
import equipamentController from "./controllers/EquipamentController";
import ticketCategoryController from "./controllers/TicketCategory";
import ticketPriorityController from "./controllers/TicketPriority";
import ticketTypeController from "./controllers/TicketTypeController";
import locationController from "./controllers/LocationController";
import maintenanceController from "./controllers/MaintenanceController";
import colletInformationController from "./controllers/ColletInformation";
import providerController from "./controllers/ProviderController";
import companiesController from "./controllers/CompanyController";
import slaController from "./controllers/SLAController";
import depositController from "./controllers/DepositController";
import depositItemController from "./controllers/DepositItemController";
import groupController from "./controllers/GroupController";
import todooController from "./controllers/TodooController";
import typeOfEquipmentsController from "./controllers/EquipmentTypeController";
import generatePDF from "./controllers/GeneratePDFController";
import reportController from "./controllers/ReportController";
import shiftChangeController from "./controllers/ShiftChangeController";
import notificationController from "./controllers/NotificationController";
import suggestionComplaintController from "./controllers/SuggestionComplaintController";
import chatGPTController from "./controllers/ChatGPTController";

import { processEmailQueue } from "./services/processQueue";
import { tenantMiddleware } from "./middlewares/tenant";

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

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(tenantMiddleware);
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
app.use("/shift-changes", shiftChangeController);
app.use("/notification", notificationController);
app.use("/suggestion-complaint", suggestionComplaintController);
app.use("/bot-ia", chatGPTController);

app.get("/", (_, res) => {
  return res.json({ status: "OK", data: new Date().toLocaleString() });
});

const port = process.env.PORT || 3333;

cron.schedule("*/2 * * * *", processEmailQueue);

async function initialize() {
  app.listen(port, () => {
    console.log(`Server started at http://10.0.101.70:${port}`);
  });
}

initialize();
