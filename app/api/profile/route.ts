import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '@/lib/middleware/auth';

export async function GET(req: Request) {
  try {
    // Authenticate use
    const authResult = await authMiddleware(req);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { userId } = authResult;

    // Connect to database
    await connectDB();

    // Find user by ID
    const user = await User.findById(userId).select('-password -emailVerificationCode -emailVerificationExpires');
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        birthDate: user.birthDate,
        profilePhoto: user.profilePhoto,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      },
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(req);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { userId } = authResult;
    const { firstName, lastName, birthDate, profilePhoto } = await req.json();

    // Connect to database
    await connectDB();

    // Prepare update data
    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName.trim();
    if (lastName !== undefined) updateData.lastName = lastName.trim();
    if (birthDate !== undefined) updateData.birthDate = new Date(birthDate);
    if (profilePhoto !== undefined) updateData.profilePhoto = profilePhoto;

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -emailVerificationCode -emailVerificationExpires');

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        birthDate: updatedUser.birthDate,
        profilePhoto: updatedUser.profilePhoto,
        isEmailVerified: updatedUser.isEmailVerified,
        createdAt: updatedUser.createdAt,
      },
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
