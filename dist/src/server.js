"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const node_cron_1 = __importDefault(require("node-cron"));
const AuthController_1 = __importDefault(
  require("./controllers/AuthController")
);
const UserController_1 = __importDefault(
  require("./controllers/UserController")
);
const TicketController_1 = __importDefault(
  require("./controllers/TicketController")
);
const EquipamentController_1 = __importDefault(
  require("./controllers/EquipamentController")
);
const TicketCategory_1 = __importDefault(
  require("./controllers/TicketCategory")
);
const TicketPriority_1 = __importDefault(
  require("./controllers/TicketPriority")
);
const TicketTypeController_1 = __importDefault(
  require("./controllers/TicketTypeController")
);
const LocationController_1 = __importDefault(
  require("./controllers/LocationController")
);
const MaintenanceController_1 = __importDefault(
  require("./controllers/MaintenanceController")
);
const ColletInformation_1 = __importDefault(
  require("./controllers/ColletInformation")
);
const ProviderController_1 = __importDefault(
  require("./controllers/ProviderController")
);
const CompanyController_1 = __importDefault(
  require("./controllers/CompanyController")
);
const SLAController_1 = __importDefault(require("./controllers/SLAController"));
const DepositController_1 = __importDefault(
  require("./controllers/DepositController")
);
const DepositItemController_1 = __importDefault(
  require("./controllers/DepositItemController")
);
const GroupController_1 = __importDefault(
  require("./controllers/GroupController")
);
const TodooController_1 = __importDefault(
  require("./controllers/TodooController")
);
const EquipmentTypeController_1 = __importDefault(
  require("./controllers/EquipmentTypeController")
);
const GeneratePDFController_1 = __importDefault(
  require("./controllers/GeneratePDFController")
);
const ReportController_1 = __importDefault(
  require("./controllers/ReportController")
);
const processQueue_1 = require("./services/processQueue");
const app = (0, express_1.default)();
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
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(
  "/uploads",
  express_1.default.static(path_1.default.join(__dirname, "..", "uploads"))
);
app.use("/authenticate", AuthController_1.default);
app.use("/account", UserController_1.default);
app.use("/ticket", TicketController_1.default);
app.use("/ticket-category", TicketCategory_1.default);
app.use("/ticket-priority", TicketPriority_1.default);
app.use("/ticket-type", TicketTypeController_1.default);
app.use("/location", LocationController_1.default);
app.use("/equipament", EquipamentController_1.default);
app.use("/maintenance", MaintenanceController_1.default);
app.use("/collect", ColletInformation_1.default);
app.use("/providers", ProviderController_1.default);
app.use("/companies", CompanyController_1.default);
app.use("/sla", SLAController_1.default);
app.use("/deposit", DepositController_1.default);
app.use("/deposit-item", DepositItemController_1.default);
app.use("/todoo", TodooController_1.default);
app.use("/group", GroupController_1.default);
app.use("/equipmentType", EquipmentTypeController_1.default);
app.use("/pdf-gen", GeneratePDFController_1.default);
app.use("/report", ReportController_1.default);
app.get("/", (req, res) => {
  return res.json({ status: "OK", data: new Date().toLocaleString() });
});
const port = process.env.PORT || 3333;
node_cron_1.default.schedule("*/2 * * * *", processQueue_1.processEmailQueue);
app.listen(port, () => {
  console.log(`Server running at https://10.0.101.70:${port}/`);
});
