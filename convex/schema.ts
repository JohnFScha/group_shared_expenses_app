import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  groups: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.id("users"),
  }),

  groupMembers: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
    joinedAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_user", ["userId"])
    .index("by_group_and_user", ["groupId", "userId"]),

  expenses: defineTable({
    groupId: v.id("groups"),
    description: v.string(),
    amount: v.number(),
    paidBy: v.id("users"),
    date: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_paid_by", ["paidBy"]),

  payments: defineTable({
    groupId: v.id("groups"),
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    amount: v.number(),
    description: v.optional(v.string()),
    date: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_from_user", ["fromUserId"])
    .index("by_to_user", ["toUserId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
