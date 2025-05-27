// // ../types/email.ts
// export interface EmailDocument {
//   subject: string | null;
//   from?: string;
//   to?: string;
//   text?: string;
//   html?: string;
//   date: Date;
//   messageId?: string;
//   account: string;
//   folder: string; 
//   category?: string | null;
// }

// src/types/email.ts
export interface EmailDocument {
  // Fields that map directly to Supabase table columns
  id?: string; // UUID from Supabase, usually not set on creation, returned after insert
  user_id: string; // UUID of the user this email belongs to (maps to Supabase column 'user_id')

  unique_identifier: string; // This IS a column in Supabase. messageId or account-fallbackUid.
  message_id?: string | null; // Maps to Supabase column 'message_id'
  account: string; // The IMAP account user (e.g., user1@example.com) - maps to 'account'
  fallback_uid?: number | null; // The IMAP UID for this email - maps to 'fallback_uid'

  folder?: string | null; // <<<<< ADDED/CONFIRMED. Maps to Supabase column 'folder' (IF YOU ADDED IT)
  category?: string | null; // Maps to Supabase column 'category' (IF YOU ADDED IT)

  subject?: string | null;
  from_address?: string | null;
  to_addresses?: string[] | null;
  cc_addresses?: string[] | null;
  bcc_addresses?: string[] | null;

  sent_at?: string | null; // Store as ISO string for Supabase (TIMESTAMPTZ)
  received_at?: string | null; // Store as ISO string

  body_text?: string | null;
  body_html?: string | null;

  // These are auto-managed by Supabase or triggers, not typically set by client on insert
  // created_at?: string;
  // updated_at?: string;
}