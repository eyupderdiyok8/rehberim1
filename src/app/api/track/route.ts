import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper to disable caching for this API route
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firm_id, type, referrer_source } = body;

    if (!firm_id || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Determine which field to increment
    let field = '';
    if (type === 'page_view') field = 'page_views';
    else if (type === 'contact_click') field = 'contact_clicks';
    else return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

    // Use RPC to efficiently increment the stat
    const { error } = await supabase.rpc('increment_stat', {
      p_firm_id: firm_id,
      p_field: field
    });

    if (error) {
      console.error('Error tracking stat:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If referrer_source is provided (e.g. 'organic', 'direct', 'social'), log it
    // This helps identify where traffic comes from
    if (referrer_source && type === 'page_view') {
      try {
        const today = new Date().toISOString().split('T')[0];
        await supabase
          .from('firm_stats')
          .upsert(
            {
              firm_id,
              date: today,
              page_views: 0, // don't double-count
              contact_clicks: 0,
              referrer_source,
            },
            { onConflict: 'firm_id,date' }
          );
      } catch (e) {
        // Non-critical, ignore
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
