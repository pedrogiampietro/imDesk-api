import express from 'express';
import cors from 'cors';

import authController from './controllers/AuthController';
import userController from './controllers/UserController';
import ticketController from './controllers/TicketController';
import equipamentController from './controllers/EquipamentController';
import ticketCategoryController from './controllers/TicketCategory';
import ticketPriorityController from './controllers/TicketPriority';
import ticketTypeController from './controllers/TicketTypeController';
import locationController from './controllers/LocationController';
import maintenanceController from './controllers/MaintenanceController';
import colletInformationController from './controllers/ColletInformation';
import providerController from './controllers/ProviderController';
import companiesController from './controllers/CompanyController';

const app = express();

app.use((_, response, next) => {
	response.header('Access-Control-Allow-Origin', '*');
	response.header(
		'Access-Control-Allow-Methods',
		'GET,HEAD,OPTIONS,POST,PUT,PATCH'
	);
	response.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization'
	);
	response.header('Access-Control-Expose-Headers', 'x-total-count');

	return next();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/authenticate', authController);
app.use('/account', userController);
app.use('/ticket', ticketController);
app.use('/ticket-category', ticketCategoryController);
app.use('/ticket-priority', ticketPriorityController);
app.use('/ticket-type', ticketTypeController);
app.use('/location', locationController);
app.use('/equipament', equipamentController);
app.use('/maintenance', maintenanceController);
app.use('/collect', colletInformationController);
app.use('/providers', providerController);
app.use('/companies', companiesController);

app.get('/', (req, res) => {
	return res.json({ status: 'OK', data: new Date().toLocaleString() });
});

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}...`));
