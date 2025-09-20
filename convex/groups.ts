import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const createGroup = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const groupId = await ctx.db.insert("groups", {
      name: args.name,
      description: args.description,
      createdBy: userId,
    });

    // Add creator as first member
    await ctx.db.insert("groupMembers", {
      groupId,
      userId,
      joinedAt: Date.now(),
    });

    return groupId;
  },
});

export const getUserGroups = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const groups = await Promise.all(
      memberships.map(async (membership) => {
        const group = await ctx.db.get(membership.groupId);
        if (!group) return null;
        
        const memberCount = await ctx.db
          .query("groupMembers")
          .withIndex("by_group", (q) => q.eq("groupId", group._id))
          .collect();

        return {
          ...group,
          memberCount: memberCount.length,
          isCreator: group.createdBy === userId,
        };
      })
    );

    return groups.filter((group): group is NonNullable<typeof group> => group !== null);
  },
});

export const getGroupDetails = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if user is a member
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) => 
        q.eq("groupId", args.groupId).eq("userId", userId)
      )
      .unique();

    if (!membership) {
      throw new Error("Not a member of this group");
    }

    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    return {
      ...group,
      isCreator: group.createdBy === userId,
    };
  },
});

export const getGroupMembers = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if user is a member
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) => 
        q.eq("groupId", args.groupId).eq("userId", userId)
      )
      .unique();

    if (!membership) {
      throw new Error("Not a member of this group");
    }

    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    const members = await Promise.all(
      memberships.map(async (membership) => {
        const user = await ctx.db.get(membership.userId);
        return {
          ...membership,
          user,
        };
      })
    );

    return members.filter(m => m.user);
  },
});

export const inviteUserToGroup = mutation({
  args: {
    groupId: v.id("groups"),
    userEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if current user is a member
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) => 
        q.eq("groupId", args.groupId).eq("userId", userId)
      )
      .unique();

    if (!membership) {
      throw new Error("Not a member of this group");
    }

    // Get the group details
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    // Get the inviter's information
    const inviter = await ctx.db.get(userId);
    if (!inviter) {
      throw new Error("Inviter not found");
    }

    // Find user by email
    const targetUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.userEmail))
      .unique();

    if (!targetUser) {
      throw new Error("User not found");
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) => 
        q.eq("groupId", args.groupId).eq("userId", targetUser._id)
      )
      .unique();

    if (existingMembership) {
      throw new Error("User is already a member");
    }

    // Add user to group
    await ctx.db.insert("groupMembers", {
      groupId: args.groupId,
      userId: targetUser._id,
      joinedAt: Date.now(),
    });

    // Send invitation email
    if (targetUser.email) {
      await ctx.scheduler.runAfter(0, internal.sendEmails.sendGroupInvitationEmail, {
        recipientEmail: targetUser.email,
        recipientName: targetUser.name,
        inviterName: inviter.name || inviter.email || "Someone",
        groupName: group.name,
        groupDescription: group.description,
      });
    }

    return targetUser._id;
  },
});

export const removeMember = mutation({
  args: { 
    groupId: v.id("groups"),
    memberUserId: v.id("users")
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if current user is a member
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) => 
        q.eq("groupId", args.groupId).eq("userId", userId)
      )
      .unique();

    if (!membership) {
      throw new Error("Not a member of this group");
    }

    // Get group to check creator
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    // Only group creator can remove members, or members can remove themselves
    if (group.createdBy !== userId && args.memberUserId !== userId) {
      throw new Error("Only the group creator can remove other members");
    }

    // Cannot remove the group creator
    if (args.memberUserId === group.createdBy) {
      throw new Error("Cannot remove the group creator");
    }

    // Find the membership to remove
    const membershipToRemove = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) => 
        q.eq("groupId", args.groupId).eq("userId", args.memberUserId)
      )
      .unique();

    if (!membershipToRemove) {
      throw new Error("User is not a member of this group");
    }

    await ctx.db.delete(membershipToRemove._id);
    return null;
  },
});

export const deleteGroup = mutation({
  args: { 
    groupId: v.id("groups")
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get the group
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    // Only the group creator can delete the group
    if (group.createdBy !== userId) {
      throw new Error("Only the group creator can delete the group");
    }

    // 1. Delete all payments associated with this group
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    for (const payment of payments) {
      await ctx.db.delete(payment._id);
    }

    // 2. Delete all expenses associated with this group
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    for (const expense of expenses) {
      await ctx.db.delete(expense._id);
    }

    // 3. Delete all group memberships
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    for (const membership of memberships) {
      await ctx.db.delete(membership._id);
    }

    // 4. Finally, delete the group itself
    await ctx.db.delete(args.groupId);

    return null;
  },
});
