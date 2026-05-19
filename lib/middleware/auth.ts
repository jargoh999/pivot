import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function authMiddleware(req: Request) {
  try {
    let token = null;

    // Get token from Authorization header
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Fallback: Get token from query parameters (specifically for EventSource)
      const url = new URL(req.url);
      token = url.searchParams.get('token');
    }

    if (!token) {
      return { error: 'No token provided', status: 401 };
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Update lastActive in background (non-blocking)
    connectDB().then(() => {
      User.findByIdAndUpdate(decoded.userId, { lastActive: new Date() }).exec().catch((err: any) => {
        console.error('Failed to update lastActive:', err);
      });
    }).catch((err: any) => {
      console.error('Failed to connect DB in authMiddleware:', err);
    });
    
    return { userId: decoded.userId, email: decoded.email };

  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return { error: 'Invalid token', status: 401 };
    }
    if (error instanceof jwt.TokenExpiredError) {
      return { error: 'Token expired', status: 401 };
    }
    return { error: 'Authentication failed', status: 401 };
  }
}
