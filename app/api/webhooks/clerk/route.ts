// app/api/webhooks/clerk/route.ts
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

// Helper function to map Clerk roles to Prisma UserRole
function mapClerkRoleToPrisma(clerkRole?: string): UserRole {
  switch (clerkRole) {
    case 'uni_admin':
      return 'ADMIN';
    case 'prof':
      return 'PROFESSOR';
    case 'member':
    default:
      return 'STUDENT';
  }
}

interface UserJSON {
  id: string;
  first_name: string;
  last_name: string;
  email_addresses: { id: string; email_address: string }[];
  primary_email_address_id: string;
  public_metadata?: {
    role?: string;
  };
}

type WebhookEvent = {
  data: UserJSON;
  object: 'event';
  type: string;
};

const getEmail = (user: UserJSON) => {
  // Add null/undefined check
  if (!user.email_addresses || !Array.isArray(user.email_addresses)) {
    console.log("No email_addresses array found in user data");
    return null;
  }
  
  const primaryEmailId = user.primary_email_address_id;
  const emailObject = user.email_addresses.find(
    email => email.id === primaryEmailId
  );
  return emailObject?.email_address;
};

export async function POST(request: Request) {
  console.log("Webhook received");
  
  // Get the request body
  let payload;
  try {
    payload = await request.json();
    console.log("Received webhook data");
  } catch (error) {
    console.error("Error parsing request body", error);
    return new NextResponse('Error parsing request body', { status: 400 });
  }
  
  // Get the Svix headers for verification
  const svix_id = request.headers.get('svix-id') || '';
  const svix_timestamp = request.headers.get('svix-timestamp') || '';
  const svix_signature = request.headers.get('svix-signature') || '';
  
  console.log("Headers received:", !!svix_id, !!svix_timestamp, !!svix_signature);
  
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing Svix headers");
    return new NextResponse('Error: Missing Svix headers', { status: 400 });
  }

  // Get the webhook secret
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
    return new NextResponse('Error: Missing webhook secret', { status: 500 });
  }
  
  console.log("Verifying webhook signature");
  
  // Verify the webhook signature
  let evt: WebhookEvent;
  try {
    const wh = new Webhook(webhookSecret);
    const rawBody = JSON.stringify(payload);
    
    evt = wh.verify(
      rawBody,
      {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }
    ) as WebhookEvent;
    
    console.log("Webhook verified successfully");
  } catch (err) {
    console.error("Error verifying webhook", err);
    return new NextResponse('Error verifying webhook', { status: 400 });
  }

  // Extract the event data
  const eventType = evt.type;
  console.log("Event type:", eventType);
  
  // Skip if not a user event
  if (!eventType.startsWith('user.')) {
    return new NextResponse('Not a user event', { status: 200 });
  }
  
  const { id, first_name, last_name, public_metadata } = evt.data;
  const email = getEmail(evt.data);
  
  if (!email) {
    console.error("No email found in user data");
    return new NextResponse('No email found in user data', { status: 400 });
  }

  console.log(`Processing ${eventType} for user ${id} (${email})`);

  // Map Clerk role to Prisma role
  const role = mapClerkRoleToPrisma(public_metadata?.role);
  
  // Handle the event based on type
  try {
    switch (eventType) {
      case 'user.created': {
        console.log(`Creating user in database: ${id}, ${email}, ${role}`);
        
        try {
          // Test connection first
          const userCount = await prisma.user.count();
          console.log("Database connection OK, user count:", userCount);
          
          // Create user with simple Prisma call
          await prisma.user.upsert({
            where: { id },
            update: {
              email,
              firstName: first_name || '',
              lastName: last_name || '',
              role
            },
            create: {
              id,
              email,
              firstName: first_name || '',
              lastName: last_name || '',
              role
            }
          });
          
          console.log(`User ${id} created/updated successfully`);
        } catch (dbError) {
          console.error("Database operation failed:", dbError);
          return new NextResponse(`Database error: ${dbError instanceof Error ? dbError.message : String(dbError)}`, {
            status: 500
          });
        }
        break;
      }
      
      case 'user.updated': {
        console.log(`Updating user: ${id}`);
        try {
          await prisma.user.update({
            where: { id },
            data: {
              email,
              firstName: first_name || '',
              lastName: last_name || '',
              role
            },
          });
          console.log(`User ${id} updated successfully`);
        } catch (dbError) {
          console.error("Update operation failed:", dbError);
          return new NextResponse(`Update failed: ${dbError instanceof Error ? dbError.message : String(dbError)}`, {
            status: 500
          });
        }
        break;
      }
      
      case 'user.deleted': {
        console.log(`Deleting user: ${id}`);
        try {
          await prisma.user.delete({
            where: { id },
          });
          console.log(`User ${id} deleted successfully`);
        } catch (dbError) {
          console.error("Delete operation failed:", dbError);
          return new NextResponse(`Delete failed: ${dbError instanceof Error ? dbError.message : String(dbError)}`, {
            status: 500
          });
        }
        break;
      }
      
      default: {
        console.log(`Unhandled user event: ${eventType}`);
        return new NextResponse(`Unhandled event type: ${eventType}`, { status: 200 });
      }
    }
    
    return new NextResponse('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new NextResponse(
      `Error processing webhook: ${error instanceof Error ? error.message : 'Unknown error'}`, 
      { status: 500 }
    );
  }
}
