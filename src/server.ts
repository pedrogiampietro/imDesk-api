import express from "express";
import cors from "cors";
import path from "path";

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
app.use("/", express.static(path.join(__dirname, "..", "build")));

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

app.get("/", (req, res) => {
  return res.json({ status: "OK", data: new Date().toLocaleString() });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running at https://localhost:${port}/`);
});
