import 'dotenv/config';
import { prisma } from '../lib/prisma.js';

async function anonymizeExpiredUsers() {
  console.log("Starting anonymization job...");
  
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = new Date(Date.now() - THIRTY_DAYS_MS);

  try {
    // Find users scheduled for deletion more than 30 days ago
    const expiredUsers = await prisma.user.findMany({
      where: {
        status: "ARCHIVED",
        deletedAt: {
          lte: thirtyDaysAgo
        }
      },
      select: { id: true }
    });

    if (expiredUsers.length === 0) {
      console.log("No expired users found.");
      process.exit(0);
    }

    console.log(`Found ${expiredUsers.length} users to fully anonymize.`);

    const userIds = expiredUsers.map(u => u.id);

    // Run anonymization in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Anonymize user records
      for (const id of userIds) {
        await tx.user.update({
          where: { id },
          data: {
            name: "[deleted]",
            email: `deleted-${id}@deleted.local`,
            image: null,
            bio: null,
            location: null,
            website: null,
            status: "DELETED",
            role: "USER"
          }
        });
      }

      // 2. Soft delete their poems
      await tx.poem.updateMany({
        where: { authorId: { in: userIds } },
        data: { status: "DELETED" }
      });

      // 3. Delete their likes
      await tx.like.deleteMany({
        where: { userId: { in: userIds } }
      });

      // 4. Delete their follows
      await tx.follow.deleteMany({
        where: {
          OR: [
            { followerId: { in: userIds } },
            { followingId: { in: userIds } }
          ]
        }
      });

      // 5. Delete authentication-related records
      await tx.session.deleteMany({
        where: { userId: { in: userIds } }
      });
      await tx.account.deleteMany({
        where: { userId: { in: userIds } }
      });
      await tx.authenticator.deleteMany({
        where: { userId: { in: userIds } }
      });
      await tx.apiKey.deleteMany({
        where: { userId: { in: userIds } }
      });
    });

    console.log(`Successfully anonymized ${userIds.length} users.`);
    process.exit(0);

  } catch (error) {
    console.error("Error running anonymization job:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

anonymizeExpiredUsers();
