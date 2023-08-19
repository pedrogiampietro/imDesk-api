import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

const prisma = new PrismaClient();
const router = express.Router();
const saltRounds = 10;

router.post('/sign-up', async (request, response) => {
	const {
		username,
		name,
		email,
		password,
		phone,
		ramal,
		sector,
		isTechnician,
		companyId,
	} = request.body;

	if (!email || !password || !companyId)
		response
			.status(400)
			.json('Nome, e-mail, senha e companyId são obrigatórios para cadastro');

	const hashedPassword = bcrypt.hashSync(password, saltRounds);

	try {
		const createUser = await prisma.user.create({
			data: {
				username,
				name,
				email,
				password: hashedPassword,
				phone,
				ramal,
				sector,
				isTechnician,
				companyId,
			},
		});

		return response.status(201).json({
			message: 'User created successfully',
			body: createUser,
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

router.post('/sign-in', async (request, response) => {
	const { email, password } = request.body;

	try {
		const findUser = await prisma.user.findFirst({
			where: {
				email: email,
			},
			include: {
				Company: true,
			},
		});

		if (!findUser) {
			return response.status(404).json('Usuário não encontrado no sistema.');
		}

		const validPassword = await bcrypt.compare(password, findUser.password);

		if (!validPassword)
			return response.status(400).json('Password incorreto, tente novamente.');

		const token = generateAccessToken(findUser.id);
		const refreshToken = generateRefreshToken(findUser.id, token);

		return response.status(200).json({
			id: findUser.id,
			name: findUser.name,
			email: findUser.email,
			isTechnician: findUser.isTechnician,
			companies: {
				companyId: findUser.Company.id,
				companyName: findUser.Company.name,
			},
			tokens: {
				token: token,
				refreshToken: refreshToken,
			},
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

export default router;
