import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const recordPayment = mutation({
  args: {
    groupId: v.id("groups"),
    toUserId: v.id("users"),
    amount: v.number(),
    description: v.optional(v.string()),
  },
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

    // Check if recipient is a member
    const recipientMembership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) => 
        q.eq("groupId", args.groupId).eq("userId", args.toUserId)
      )
      .unique();

    if (!recipientMembership) {
      throw new Error("Recipient is not a member of this group");
    }

    if (args.amount <= 0) {
      throw new Error("Amount must be positive");
    }

    if (userId === args.toUserId) {
      throw new Error("Cannot pay yourself");
    }

    const paymentId = await ctx.db.insert("payments", {
      groupId: args.groupId,
      fromUserId: userId,
      toUserId: args.toUserId,
      amount: args.amount,
      description: args.description,
      date: Date.now(),
    });

    return paymentId;
  },
});

export const getGroupPayments = query({
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

    const payments = await ctx.db
      .query("payments")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .order("desc")
      .collect();

    const paymentsWithUsers = await Promise.all(
      payments.map(async (payment) => {
        const fromUser = await ctx.db.get(payment.fromUserId);
        const toUser = await ctx.db.get(payment.toUserId);
        return {
          ...payment,
          fromUser,
          toUser,
        };
      })
    );

    return paymentsWithUsers;
  },
});

export const getGroupBalances = query({
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

    // Get all members
    const members = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    const memberCount = members.length;

    // Get all expenses
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    // Get all payments
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    // Calculate balances for each member
    const balances = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        
        // Calculate total expenses paid by this user
        const totalPaid = expenses
          .filter(expense => expense.paidBy === member.userId)
          .reduce((sum, expense) => sum + expense.amount, 0);

        // Calculate this user's share of all expenses
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const userShare = totalExpenses / memberCount;

        // Calculate payments made by this user
        const paymentsMade = payments
          .filter(payment => payment.fromUserId === member.userId)
          .reduce((sum, payment) => sum + payment.amount, 0);

        // Calculate payments received by this user
        const paymentsReceived = payments
          .filter(payment => payment.toUserId === member.userId)
          .reduce((sum, payment) => sum + payment.amount, 0);

        // Net balance = (amount paid for expenses - user's share) + (payments received - payments made)
        const netBalance = (totalPaid - userShare) + (paymentsReceived - paymentsMade);

        return {
          userId: member.userId,
          user,
          totalPaid,
          userShare,
          paymentsMade,
          paymentsReceived,
          netBalance,
        };
      })
    );

    return balances.filter(b => b.user);
  },
});

export const deletePayment = mutation({
  args: { paymentId: v.id("payments") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const payment = await ctx.db.get(args.paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    // Check if user is a member of the group
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) => 
        q.eq("groupId", payment.groupId).eq("userId", userId)
      )
      .unique();

    if (!membership) {
      throw new Error("Not a member of this group");
    }

    // Only allow the person who made the payment or group creator to delete
    const group = await ctx.db.get(payment.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    if (payment.fromUserId !== userId && group.createdBy !== userId) {
      throw new Error("Only the person who made the payment or group creator can delete this payment");
    }

    await ctx.db.delete(args.paymentId);
    return null;
  },
});
