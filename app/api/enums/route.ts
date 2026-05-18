import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const enums = {
      gender: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'non-binary', label: 'Non-binary' },
        { value: 'prefer-not-to-say', label: 'Prefer not to say' },
      ],
      experienceLevel: [
        { value: 'student', label: 'Student' },
        { value: 'entry', label: 'Entry Level (0-2 years)' },
        { value: 'mid', label: 'Mid Level (3-5 years)' },
        { value: 'senior', label: 'Senior (6-10 years)' },
        { value: 'executive', label: 'Executive (10+ years)' },
      ],
      industries: [
        { value: 'technology', label: 'Technology & Software' },
        { value: 'healthcare', label: 'Healthcare & Medicine' },
        { value: 'finance', label: 'Finance & Banking' },
        { value: 'education', label: 'Education' },
        { value: 'marketing', label: 'Marketing & Advertising' },
        { value: 'design', label: 'Design & Creative' },
        { value: 'consulting', label: 'Consulting' },
        { value: 'retail', label: 'Retail & E-commerce' },
        { value: 'manufacturing', label: 'Manufacturing' },
        { value: 'media', label: 'Media & Entertainment' },
        { value: 'non-profit', label: 'Non-profit & NGO' },
        { value: 'government', label: 'Government & Public Sector' },
        { value: 'legal', label: 'Legal & Law' },
        { value: 'science', label: 'Science & Research' },
        { value: 'sports', label: 'Sports & Fitness' },
        { value: 'hospitality', label: 'Hospitality & Tourism' },
        { value: 'real-estate', label: 'Real Estate' },
        { value: 'other', label: 'Other' },
      ],
      interests: [
        { value: 'technology', label: 'Technology & Programming' },
        { value: 'entrepreneurship', label: 'Entrepreneurship & Startups' },
        { value: 'investing', label: 'Investing & Trading' },
        { value: 'art', label: 'Art & Design' },
        { value: 'music', label: 'Music' },
        { value: 'reading', label: 'Reading & Writing' },
        { value: 'travel', label: 'Travel & Adventure' },
        { value: 'fitness', label: 'Fitness & Sports' },
        { value: 'cooking', label: 'Cooking & Food' },
        { value: 'gaming', label: 'Gaming' },
        { value: 'photography', label: 'Photography' },
        { value: 'fashion', label: 'Fashion & Style' },
        { value: 'science', label: 'Science & Innovation' },
        { value: 'politics', label: 'Politics & Current Affairs' },
        { value: 'philosophy', label: 'Philosophy & Psychology' },
        { value: 'sustainability', label: 'Sustainability & Environment' },
        { value: 'networking', label: 'Professional Networking' },
        { value: 'mentorship', label: 'Mentorship & Coaching' },
      ],
      intentions: [
        { value: 'networking', label: 'Networking' },
        { value: 'dating', label: 'Dating' },
        { value: 'friendship', label: 'Friendship' },
        { value: 'mentorship', label: 'Mentorship' },
        { value: 'collaboration', label: 'Business Collaboration' },
        { value: 'learning', label: 'Learning & Development' },
        { value: 'hiring', label: 'Hiring Talent' },
        { value: 'job-seeking', label: 'Job Opportunities' },
      ],
      languages: [
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Spanish' },
        { value: 'fr', label: 'French' },
        { value: 'de', label: 'German' },
        { value: 'it', label: 'Italian' },
        { value: 'pt', label: 'Portuguese' },
        { value: 'zh', label: 'Chinese' },
        { value: 'ja', label: 'Japanese' },
        { value: 'ko', label: 'Korean' },
        { value: 'ar', label: 'Arabic' },
        { value: 'hi', label: 'Hindi' },
        { value: 'ru', label: 'Russian' },
        { value: 'tr', label: 'Turkish' },
        { value: 'nl', label: 'Dutch' },
        { value: 'pl', label: 'Polish' },
        { value: 'sv', label: 'Swedish' },
        { value: 'other', label: 'Other' },
      ],
    };

    return NextResponse.json({ success: true, enums });
  } catch (error) {
    console.error('Enums API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enums' },
      { status: 500 }
    );
  }
}
