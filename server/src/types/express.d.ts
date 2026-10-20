declare global {
	namespace Express {
		interface Request {
			user?: {
				userId: string
				role: import('./index.js').UserRole
			}
		}
	}
}

export {}
