
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { EmailDocument } from '../types/email.js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or Key is missing. Check .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);


export async function checkIfEmailExists(
    messageId: string | undefined,
    account: string,
    fallbackUid?: number
  ): Promise<boolean> {
    if (!messageId && (!fallbackUid || fallbackUid <= 0)) {
      return false;
    }
    const uniqueIdentifier = getEmailUniqueIdentifier({ message_id: messageId, account, fallback_uid: fallbackUid });
    const { count, error } = await supabase
      .from('emails')
      .select('id', { count: 'exact', head: true })
      .eq('unique_identifier', uniqueIdentifier);
  
    if (error) {
      console.error(`[Supabase Error] Checking if email exists (${uniqueIdentifier}):`, error.message);
      return false; // Or throw
    }
    return (count ?? 0) > 0;
  }
  
  export const indexEmail = async (emailData: EmailDocument): Promise<void> => {
    // ... your implementation ...
    // Ensure emailData has unique_identifier correctly set before this call,
    // or that this function derives it.
    // const uniqueIdentifier = emailData.unique_identifier || getEmailUniqueIdentifier(emailData);
  
    const { error } = await supabase
      .from('emails')
      .upsert(
        { ...emailData, unique_identifier: emailData.unique_identifier }, // Ensure all fields for your table
        { onConflict: 'unique_identifier', ignoreDuplicates: true }
      );
  
    if (error) {
      if (error.code === '23505') { // Unique violation
        console.log(`[Supabase Info] Email with unique_identifier ${emailData.unique_identifier} already exists. Skipped.`);
        return;
      }
      console.error(`[Supabase Error] Indexing email (${emailData.unique_identifier}):`, error.message);
      throw error;
    }
    console.log(`[Supabase Info] Successfully indexed/upserted email: ${emailData.unique_identifier}`);
  };
  
  // Make sure getEmailUniqueIdentifier is also available if needed by these, or defined within them.
  // It's better to have getEmailUniqueIdentifier in this file too if not exported separately.
  function getEmailUniqueIdentifier(data: { message_id?: string | null; account: string; fallback_uid?: number | null }): string {
      if (data.message_id) {
          return data.message_id;
      }
      if (data.account && data.fallback_uid && data.fallback_uid > 0) {
          return `${data.account}-${data.fallback_uid}`;
      }
      // This should ideally not happen if data is prepared correctly
      console.warn("Could not generate a reliable unique identifier for email from:", data);
      return `${data.account || 'unknown_account'}-malformed-${Date.now()}`;
  }
  