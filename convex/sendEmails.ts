import { components } from "./_generated/api";
import { Resend } from "@convex-dev/resend";
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const resend: Resend = new Resend(components.resend, {
  apiKey: process.env.RESEND_API_KEY!,
  webhookSecret: process.env.RESEND_WEBHOOK_SECRET!,
  testMode: false, // Set to false in production
});

export const sendTestEmail = internalMutation({
  handler: async (ctx) => {
    await resend.sendEmail(ctx, {
      from: "spplitty@resend.dev",
      to: "delivered@resend.dev",
      subject: "Hi there",
      html: "This is a test email",
    });
  },
});

/**
 * Generate HTML email content for group invitation
 */
function generateInvitationEmailHTML(
  inviterName: string,
  groupName: string,
  groupDescription?: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>You've been invited to join a group!</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 8px 8px 0 0;
          text-align: center;
        }
        .content {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 0 0 8px 8px;
        }
        .group-info {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #667eea;
        }
        .btn {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
          font-weight: 600;
        }
        .footer {
          text-align: center;
          color: #666;
          font-size: 14px;
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎉 You've been invited!</h1>
        <p>Join a shared expenses group</p>
      </div>
      
      <div class="content">
        <p>Hi there!</p>
        
        <p><strong>${inviterName}</strong> has invited you to join their group for tracking shared expenses.</p>
        
        <div class="group-info">
          <h3>📝 ${groupName}</h3>
          ${groupDescription ? `<p>${groupDescription}</p>` : ''}
        </div>
        
        <p>This group will help you easily track and split expenses with your friends, family, or colleagues. You can:</p>
        
        <ul>
          <li>📊 Add and track shared expenses</li>
          <li>💰 See who owes what to whom</li>
          <li>📱 Record payments between group members</li>
          <li>🔍 View detailed expense history</li>
        </ul>
        
        <p>Ready to get started? Simply log in to your account to join the group!</p>
        
        <div class="footer">
          <p>This invitation was sent through our Group Shared Expenses app.</p>
          <p>If you don't have an account yet, you'll need to create one first.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send an invitation email to a user when they're added to a group
 */
export const sendGroupInvitationEmail = internalMutation({
  args: {
    recipientEmail: v.string(),
    recipientName: v.optional(v.string()),
    inviterName: v.string(),
    groupName: v.string(),
    groupDescription: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const htmlContent = generateInvitationEmailHTML(
      args.inviterName,
      args.groupName,
      args.groupDescription
    );
    
    await resend.sendEmail(ctx, {
      from: "jfscha@spplitty.com", // Update with your actual domain
      to: args.recipientEmail,
      subject: `You've been invited to join "${args.groupName}" by ${args.inviterName}`,
      html: htmlContent,
    });

    return null;
  },
});
