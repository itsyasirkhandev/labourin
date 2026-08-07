import { httpRouter } from "convex/server";
import { httpAction, ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";
const http = httpRouter();

function verifyClerkWebhook(request: Request, payloadString: string): WebhookEvent | Response {
  const svixHeaders = {
    "svix-id": request.headers.get("svix-id")!,
    "svix-timestamp": request.headers.get("svix-timestamp")!,
    "svix-signature": request.headers.get("svix-signature")!,
  };

  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
    return new Response("Missing webhook secret", { status: 500 });
  }

  try {
    const wh = new Webhook(webhookSecret);
    return wh.verify(payloadString, svixHeaders) as WebhookEvent;
  } catch (error) {
    console.error("Error verifying webhook event", error);
    return new Response("Error occurred", { status: 400 });
  }
}

async function dispatchClerkWebhookEvent(ctx: ActionCtx, event: WebhookEvent) {
  switch (event.type) {
    case "user.created":
    case "user.updated": {
      const user = event.data;
      await ctx.runMutation(internal.users.upsertFromClerk, {
        data: {
          id: user.id,
          firstName: user.first_name ?? undefined,
          lastName: user.last_name ?? undefined,
          avatarUrl: user.image_url ?? undefined,
          email: user.email_addresses?.[0]?.email_address ?? undefined,
          phoneNumber: user.phone_numbers?.[0]?.phone_number ?? undefined,
        },
      });
      break;
    }

    case "user.deleted": {
      const clerkUserId = event.data.id;
      if (clerkUserId) {
        await ctx.runMutation(internal.users.deleteFromClerk, { clerkUserId });
      }
      break;
    }

    default:
      console.log("Ignored Clerk webhook event", event.type);
  }
}

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payloadString = await request.text();
    const verified = verifyClerkWebhook(request, payloadString);

    if (verified instanceof Response) {
      return verified;
    }

    if (!verified || !verified.type || !verified.data) {
      return new Response("Invalid webhook payload", { status: 400 });
    }

    await dispatchClerkWebhookEvent(ctx, verified);
    return new Response(null, { status: 200 });
  }),
});

export default http;
