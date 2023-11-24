import { Request } from 'express';

export function getTenantId(req: Request): string | undefined {
	return (req as any).tenantId;
}
