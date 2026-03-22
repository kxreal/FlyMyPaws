import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1"

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY'); // User needs to provide this

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  try {
    // 1. Fetch profiles that haven't received a reminder in the last 6 hours
    // Or never received one.
    const now = new Date();
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

    const { data: profiles, error: pError } = await supabase
      .from('profiles')
      .select('id, username, last_reminder_sent_at')
      .or(`last_reminder_sent_at.is.null,last_reminder_sent_at.lt.${sixHoursAgo.toISOString()}`);

    if (pError) throw pError;

    const results = [];

    for (const profile of profiles) {
      // 2. Find unread messages for this user that are:
      // - Older than 6 hours (from now)
      // - Created AFTER the last reminder we sent (to avoid duplicates)
      const lastReminder = profile.last_reminder_sent_at ? new Date(profile.last_reminder_sent_at) : new Date(0);
      
      const { data: unreadMsg, error: mError } = await supabase
        .from('messages')
        .select('id, content, sender:sender_id(username)')
        .eq('receiver_id', profile.id)
        .eq('is_read', false)
        .lt('created_at', sixHoursAgo.toISOString())
        .gt('created_at', lastReminder.toISOString());

      if (mError) continue;

      if (unreadMsg && unreadMsg.length > 0) {
        // 3. Group and Send Email (Mocked or using Resend if API key exists)
        console.log(`Sending reminder to ${profile.username} for ${unreadMsg.length} messages.`);
        
        if (resendApiKey) {
          // Actual email sending logic would go here
          // For now we log and update the timestamp
        }

        // 4. Update last_reminder_sent_at
        await supabase
          .from('profiles')
          .update({ last_reminder_sent_at: now.toISOString() })
          .eq('id', profile.id);
          
        results.push({ user: profile.username, count: unreadMsg.length });
      }
    }

    return new Response(JSON.stringify({ success: true, processed: results }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
})
