import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password, Anonymous],
});

export const loggedInUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    return user;
  },
});

export const updateUserProfile = mutation({
  args: {
    name: v.optional(v.string()),
    // Note: email updates might require additional verification in a production app
    // For now, we'll allow it but you may want to add email verification flow
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Build update object with only the provided fields
    const updates: Record<string, any> = {};
    
    if (args.name !== undefined && args.name.trim() !== "") {
      updates.name = args.name.trim();
    }

    // Only update if there are changes to make
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(userId, updates);
    }

    return null;
  },
});

export const deleteAccount = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx, _args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // 1. Delete all payments from/to this user
    const paymentsFrom = await ctx.db
      .query("payments")
      .withIndex("by_from_user", (q) => q.eq("fromUserId", userId))
      .collect();
    
    const paymentsTo = await ctx.db
      .query("payments")
      .withIndex("by_to_user", (q) => q.eq("toUserId", userId))
      .collect();

    for (const payment of paymentsFrom) {
      await ctx.db.delete(payment._id);
    }
    
    for (const payment of paymentsTo) {
      await ctx.db.delete(payment._id);
    }

    // 2. Delete all expenses paid by this user
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_paid_by", (q) => q.eq("paidBy", userId))
      .collect();

    for (const expense of expenses) {
      await ctx.db.delete(expense._id);
    }

    // 3. Delete all group memberships for this user
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const membership of memberships) {
      await ctx.db.delete(membership._id);
    }

    // 4. Delete groups created by this user (if they have no other members)
    const createdGroups = await ctx.db
      .query("groups")
      .filter((q) => q.eq(q.field("createdBy"), userId))
      .collect();

    for (const group of createdGroups) {
      // Check if there are other members in the group
      const remainingMembers = await ctx.db
        .query("groupMembers")
        .withIndex("by_group", (q) => q.eq("groupId", group._id))
        .collect();
      
      // If no remaining members, delete the group
      if (remainingMembers.length === 0) {
        await ctx.db.delete(group._id);
      }
    }

    // 5. Delete the user account
    // Note: The auth system will handle cleanup of auth-related tables
    await ctx.db.delete(userId);

    return null;
  },
});
