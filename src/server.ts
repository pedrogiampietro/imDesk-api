import express from 'express'
import cors from 'cors'

import authController from './controllers/AuthController'
import userController from './controllers/UserController'
import equipamentController from './controllers/EquipamentController'
import ticketCategoryController from './controllers/TicketCategory'

const app = express()

app.use((_, response, next) => {
	response.header('Access-Control-Allow-Origin', '*')
	response.header(
		'Access-Control-Allow-Methods',
		'GET,HEAD,OPTIONS,POST,PUT,PATCH'
	)
	response.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization'
	)
	response.header('Access-Control-Expose-Headers', 'x-total-count')

	return next()
})

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/authenticate', authController)
app.use('/account', userController)
app.use('/equipament', equipamentController)
app.use('/category', ticketCategoryController)

app.get('/', (req, res) => {
	return res.json({ status: 'OK', data: new Date().toLocaleString() })
})

app.listen(3333)
