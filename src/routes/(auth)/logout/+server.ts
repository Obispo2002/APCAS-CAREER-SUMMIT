import * as auth from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
    if (!event.locals.session) {
        throw redirect(302, '/');
    }
    
    await auth.invalidateSession(event.locals.session.id);  

    const sessionCookie = auth.generateSessionToken();      
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);  
    auth.setSessionTokenCookie(event, sessionCookie, expiresAt);  
    
    throw redirect(302, '/login');
};
