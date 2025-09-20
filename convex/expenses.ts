import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const addExpense = mutation({
  args: {
    groupId: v.id("groups"),
    description: v.string(),
    amount: v.number(),
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

    if (args.amount <= 0) {
      throw new Error("Amount must be positive");
    }

    const expenseId = await ctx.db.insert("expenses", {
      groupId: args.groupId,
      description: args.description,
      amount: args.amount,
      paidBy: userId,
      date: Date.now(),
    });

    return expenseId;
  },
});

export const getGroupExpenses = query({
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

    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .order("desc")
      .collect();

    const expensesWithUsers = await Promise.all(
      expenses.map(async (expense) => {
        const paidByUser = await ctx.db.get(expense.paidBy);
        return {
          ...expense,
          paidByUser,
        };
      })
    );

    return expensesWithUsers;
  },
});

export const deleteExpense = mutation({
  args: { expenseId: v.id("expenses") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const expense = await ctx.db.get(args.expenseId);
    if (!expense) {
      throw new Error("Expense not found");
    }

    // Check if user is a member of the group
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) => 
        q.eq("groupId", expense.groupId).eq("userId", userId)
      )
      .unique();

    if (!membership) {
      throw new Error("Not a member of this group");
    }

    // Only allow the person who paid or group creator to delete
    const group = await ctx.db.get(expense.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    if (expense.paidBy !== userId && group.createdBy !== userId) {
      throw new Error("Only the person who paid or group creator can delete this expense");
    }

    await ctx.db.delete(args.expenseId);
    return null;
  },
});
