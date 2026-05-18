import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../lib/models/User';
import Conversation from '../lib/models/Conversation';
import Message from '../lib/models/Message';

const MONGODB_URI = 'mongodb+srv://fatoyeayomide123456:r64YxR3lcNkUxYDd@cluster0.6izol.mongodb.net/vibe?appName=Cluster0';

const activitiesData = [
  {
    name: 'Emma',
    email: 'emma@vibe.app',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    gender: 'female',
    bio: 'Love hiking, local coffee shops, and modern art.',
  },
  {
    name: 'Ava',
    email: 'ava@vibe.app',
    avatar: 'https://images.unsplash.com/photo-1517849845537-1d51a20414de?w=100&q=80',
    gender: 'female',
    bio: 'Software engineer by day, amateur pastry chef by night.',
  },
  {
    name: 'Sophia',
    email: 'sophia@vibe.app',
    avatar: 'https://images.unsplash.com/photo-1516987723245-1bcda002c1d6?w=100&q=80',
    gender: 'female',
    bio: 'Seeking someone to explore the city galleries with.',
  },
  {
    name: 'Olivia',
    email: 'olivia@vibe.app',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    gender: 'female',
    bio: 'Books, travel, and vinyl records. Let\'s swap recommendations!',
  },
];

async function main() {
  console.log('Connecting to database...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!');

  // 1. Find the primary user (e.g. fatoyeayomide123456@gmail.com)
  const primaryUser = await User.findOne({ email: 'fatoyeayomide123456@gmail.com' });
  if (!primaryUser) {
    console.error('Primary user fatoyeayomide123456@gmail.com not found! Register a user first.');
    process.exit(1);
  }
  console.log(`Found primary user: ${primaryUser.fullName} (ID: ${primaryUser._id})`);

  // Clear existing seeded conversations and messages for a clean slate
  console.log('Cleaning up existing mock conversations and messages...');
  const seededUserEmails = activitiesData.map(d => d.email);
  const seededUsers = await User.find({ email: { $in: seededUserEmails } });
  const seededUserIds = seededUsers.map(u => u._id);

  if (seededUserIds.length > 0) {
    const deletedConversations = await Conversation.deleteMany({
      participants: { $in: seededUserIds },
    });
    console.log(`Deleted ${deletedConversations.deletedCount} old conversations`);

    const deletedMessages = await Message.deleteMany({
      $or: [
        { senderId: { $in: seededUserIds } },
        { receiverId: { $in: seededUserIds } },
      ]
    });
    console.log(`Deleted ${deletedMessages.deletedCount} old messages`);
  }

  // 2. Create seeded users if they don't exist
  const hashedPassword = await bcrypt.hash('password123', 12);
  const userMap: Record<string, any> = {};

  for (const act of activitiesData) {
    let seededUser = await User.findOne({ email: act.email });
    if (!seededUser) {
      console.log(`Creating user: ${act.name}...`);
      seededUser = await User.create({
        email: act.email,
        password: hashedPassword,
        fullName: act.name,
        profilePhoto: act.avatar,
        gender: act.gender,
        bio: act.bio,
        isEmailVerified: true,
      });
    } else {
      console.log(`User already exists: ${act.name}. Updating password...`);
      // Update avatar/bio/password just in case
      seededUser.profilePhoto = act.avatar;
      seededUser.bio = act.bio;
      seededUser.password = hashedPassword;
      await seededUser.save();
    }
    userMap[act.name] = seededUser;
  }

  // 3. Create conversations and messages
  console.log('\nGenerating mock matches and chats...');

  // --- Emma's Conversation (Has unread messages) ---
  console.log('Seeding conversation with Emma...');
  const emmaConv = await Conversation.create({
    participants: [primaryUser._id, userMap['Emma']._id],
    unreadCount: new Map([
      [primaryUser._id.toString(), 2],
      [userMap['Emma']._id.toString(), 0],
    ]),
  });

  const emmaMsg1 = await Message.create({
    senderId: primaryUser._id,
    receiverId: userMap['Emma']._id,
    conversationId: emmaConv._id,
    text: 'Hey Emma! I noticed we both love hiking. What\'s your favorite trail around here?',
  });

  const emmaMsg2 = await Message.create({
    senderId: userMap['Emma']._id,
    receiverId: primaryUser._id,
    conversationId: emmaConv._id,
    text: 'Hey! Oh definitely the Starved Rock trails! The waterfalls are amazing.',
  });

  // Reply message
  const emmaMsg3 = await Message.create({
    senderId: primaryUser._id,
    receiverId: userMap['Emma']._id,
    conversationId: emmaConv._id,
    text: 'Oh I have been there! It\'s beautiful in the spring.',
    replyTo: {
      messageId: emmaMsg2._id,
      text: emmaMsg2.text,
      author: 'them',
    },
  });

  // Unread messages from Emma
  await Message.create({
    senderId: userMap['Emma']._id,
    receiverId: primaryUser._id,
    conversationId: emmaConv._id,
    text: 'Yes! Are you planning on going anytime soon?',
  });

  const emmaLastMsg = await Message.create({
    senderId: userMap['Emma']._id,
    receiverId: primaryUser._id,
    conversationId: emmaConv._id,
    text: 'Let me know, we could go together! 🥾',
  });

  emmaConv.lastMessage = emmaLastMsg._id;
  await emmaConv.save();

  // --- Ava's Conversation ---
  console.log('Seeding conversation with Ava...');
  const avaConv = await Conversation.create({
    participants: [primaryUser._id, userMap['Ava']._id],
    unreadCount: new Map([
      [primaryUser._id.toString(), 0],
      [userMap['Ava']._id.toString(), 0],
    ]),
  });

  const avaMsg1 = await Message.create({
    senderId: userMap['Ava']._id,
    receiverId: primaryUser._id,
    conversationId: avaConv._id,
    text: 'Hi there! What kind of software do you write?',
  });

  const avaLastMsg = await Message.create({
    senderId: primaryUser._id,
    receiverId: userMap['Ava']._id,
    conversationId: avaConv._id,
    text: 'Mostly Next.js and full-stack web apps! What about you?',
  });

  avaConv.lastMessage = avaLastMsg._id;
  await avaConv.save();

  // --- Sophia's Conversation ---
  console.log('Seeding conversation with Sophia...');
  const sophiaConv = await Conversation.create({
    participants: [primaryUser._id, userMap['Sophia']._id],
    unreadCount: new Map([
      [primaryUser._id.toString(), 0],
      [userMap['Sophia']._id.toString(), 0],
    ]),
  });

  const sophiaLastMsg = await Message.create({
    senderId: userMap['Sophia']._id,
    receiverId: primaryUser._id,
    conversationId: sophiaConv._id,
    text: 'Hey! I saw you\'re into art. Are you free to check out the new modern art gallery this weekend?',
  });

  sophiaConv.lastMessage = sophiaLastMsg._id;
  await sophiaConv.save();

  // --- Olivia's Conversation ---
  console.log('Seeding conversation with Olivia...');
  const oliviaConv = await Conversation.create({
    participants: [primaryUser._id, userMap['Olivia']._id],
    unreadCount: new Map([
      [primaryUser._id.toString(), 0],
      [userMap['Olivia']._id.toString(), 0],
    ]),
  });

  const oliviaLastMsg = await Message.create({
    senderId: userMap['Olivia']._id,
    receiverId: primaryUser._id,
    conversationId: oliviaConv._id,
    text: 'Do you prefer classic rock or jazz on vinyl?',
  });

  oliviaConv.lastMessage = oliviaLastMsg._id;
  await oliviaConv.save();

  console.log('\nSeeding completed successfully! 🚀');
  await mongoose.connection.close();
}

main().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
