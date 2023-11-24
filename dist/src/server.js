"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const node_cron_1 = __importDefault(require("node-cron"));
const AuthController_1 = __importDefault(require("./controllers/AuthController"));
const UserController_1 = __importDefault(require("./controllers/UserController"));
const TicketController_1 = __importDefault(require("./controllers/TicketController"));
const EquipamentController_1 = __importDefault(require("./controllers/EquipamentController"));
const TicketCategory_1 = __importDefault(require("./controllers/TicketCategory"));
const TicketPriority_1 = __importDefault(require("./controllers/TicketPriority"));
const TicketTypeController_1 = __importDefault(require("./controllers/TicketTypeController"));
const LocationController_1 = __importDefault(require("./controllers/LocationController"));
const MaintenanceController_1 = __importDefault(require("./controllers/MaintenanceController"));
const ColletInformation_1 = __importDefault(require("./controllers/ColletInformation"));
const ProviderController_1 = __importDefault(require("./controllers/ProviderController"));
const CompanyController_1 = __importDefault(require("./controllers/CompanyController"));
const SLAController_1 = __importDefault(require("./controllers/SLAController"));
const DepositController_1 = __importDefault(require("./controllers/DepositController"));
const DepositItemController_1 = __importDefault(require("./controllers/DepositItemController"));
const GroupController_1 = __importDefault(require("./controllers/GroupController"));
const TodooController_1 = __importDefault(require("./controllers/TodooController"));
const EquipmentTypeController_1 = __importDefault(require("./controllers/EquipmentTypeController"));
const GeneratePDFController_1 = __importDefault(require("./controllers/GeneratePDFController"));
const ReportController_1 = __importDefault(require("./controllers/ReportController"));
const ShiftChangeController_1 = __importDefault(require("./controllers/ShiftChangeController"));
const NotificationController_1 = __importDefault(require("./controllers/NotificationController"));
const SuggestionComplaintController_1 = __importDefault(require("./controllers/SuggestionComplaintController"));
const ChatGPTController_1 = __importDefault(require("./controllers/ChatGPTController"));
const TenantController_1 = __importDefault(require("./controllers/TenantController"));
const processQueue_1 = require("./services/processQueue");
const tenant_1 = require("./middlewares/tenant");
const app = (0, express_1.default)();
app.use((_, response, next) => {
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,PATCH');
    response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    response.header('Access-Control-Expose-Headers', 'x-total-count');
    return next();
});
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(tenant_1.tenantMiddleware);
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads')));
app.use('/authenticate', AuthController_1.default);
app.use('/account', UserController_1.default);
app.use('/ticket', TicketController_1.default);
app.use('/ticket-category', TicketCategory_1.default);
app.use('/ticket-priority', TicketPriority_1.default);
app.use('/ticket-type', TicketTypeController_1.default);
app.use('/location', LocationController_1.default);
app.use('/equipament', EquipamentController_1.default);
app.use('/maintenance', MaintenanceController_1.default);
app.use('/collect', ColletInformation_1.default);
app.use('/providers', ProviderController_1.default);
app.use('/companies', CompanyController_1.default);
app.use('/sla', SLAController_1.default);
app.use('/deposit', DepositController_1.default);
app.use('/deposit-item', DepositItemController_1.default);
app.use('/todoo', TodooController_1.default);
app.use('/group', GroupController_1.default);
app.use('/equipmentType', EquipmentTypeController_1.default);
app.use('/pdf-gen', GeneratePDFController_1.default);
app.use('/report', ReportController_1.default);
app.use('/shift-changes', ShiftChangeController_1.default);
app.use('/notification', NotificationController_1.default);
app.use('/suggestion-complaint', SuggestionComplaintController_1.default);
app.use('/bot-ia', ChatGPTController_1.default);
app.use('/tenant', TenantController_1.default);
app.get('/', (_, res) => {
    return res.json({ status: 'OK', data: new Date().toLocaleString() });
});
const port = process.env.PORT || 3333;
node_cron_1.default.schedule('*/2 * * * *', processQueue_1.processEmailQueue);
function initialize() {
    return __awaiter(this, void 0, void 0, function* () {
        app.listen(port, () => {
            console.log(`Server started at http://localhost:${port}`);
        });
    });
}
initialize();
