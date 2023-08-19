import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import si from 'systeminformation';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', async (_request: Request, response: Response) => {
	try {
		const systemData = await si.getAllData();
		const users = await si.users();
		const allNetworkConnections = await si.networkConnections();

		const networkConnections443 = allNetworkConnections
			.filter((conn: any) => conn.peerPort === '443')
			.map((conn: any) => ({
				protocol: conn.protocol,
				localAddress: conn.localAddress,
				localPort: conn.localPort,
				peerAddress: conn.peerAddress,
				peerPort: conn.peerPort,
				state: conn.state,
				pid: conn.pid,
				process: conn.process,
			}));

		const info = {
			hostname: systemData.system.manufacturer,
			platform: systemData.os.platform,
			release: systemData.os.release,
			cpu: systemData.cpu.brand,
			memory: systemData.mem.total,
			UserInfos: users.map((user: any) => ({
				user: user.user,
				tty: user.tty,
				date: new Date(user.date),
				time: user.time,
				ip: user.ip,
				command: user.command,
			})),
			NetworkConnections: networkConnections443[0],
		};

		// Salvando as informações no banco de dados usando Prisma
		const machineInfo = await prisma.machineInfo.create({
			data: {
				hostname: info.hostname,
				platform: info.platform,
				release: info.release,
				cpu: info.cpu,
				memory: info.memory.toString(),
				NetworkConnections: {
					create: info.NetworkConnections,
				},
				UserInfos: {
					create: info.UserInfos,
				},
			},
		});

		response.status(201).json({
			message: 'Data saved successfully',
			body: machineInfo,
			error: false,
		});
	} catch (error: any) {
		if (error.message.includes('Unable to fit integer value')) {
			console.error('O valor é muito grande para ser inserido!');
		} else {
			throw error;
		}
	}
});

export default router;
