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
        fullName: user.fullName,
        birthDate: user.birthDate,
        profilePhoto: user.profilePhoto,
        isEmailVerified: user.isEmailVerified,
        // New profile fields
        gender: user.gender,
        country: user.country,
        timezone: user.timezone,
        industry: user.industry,
        experienceLevel: user.experienceLevel,
        interests: user.interests,
        intentions: user.intentions,
        languages: user.languages,
        bio: user.bio,
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
    const { birthDate, profilePhoto, gender, country, timezone, industry, experienceLevel, interests, intentions, languages, bio } = await req.json();

    // Connect to database
    await connectDB();

    // Prepare update data
    const updateData: any = {};
    if (birthDate !== undefined) updateData.birthDate = new Date(birthDate);
    if (profilePhoto !== undefined) updateData.profilePhoto = profilePhoto;
    if (gender !== undefined) updateData.gender = gender;
    if (country !== undefined) updateData.country = country;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (industry !== undefined) updateData.industry = industry;
    if (experienceLevel !== undefined) updateData.experienceLevel = experienceLevel;
    if (interests !== undefined) updateData.interests = interests;
    if (intentions !== undefined) updateData.intentions = intentions;
    if (languages !== undefined) updateData.languages = languages;
    if (bio !== undefined) updateData.bio = bio.trim();

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
        fullName: updatedUser.fullName,
        birthDate: updatedUser.birthDate,
        profilePhoto: updatedUser.profilePhoto,
        isEmailVerified: updatedUser.isEmailVerified,
        // New profile fields
        gender: updatedUser.gender,
        country: updatedUser.country,
        timezone: updatedUser.timezone,
        industry: updatedUser.industry,
        experienceLevel: updatedUser.experienceLevel,
        interests: updatedUser.interests,
        intentions: updatedUser.intentions,
        languages: updatedUser.languages,
        bio: updatedUser.bio,
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
