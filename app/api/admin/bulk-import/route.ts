import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const { components } = await request.json();

    if (!Array.isArray(components)) {
      return NextResponse.json({ error: 'Components must be an array' }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (const component of components) {
      try {
        // Insert component logic here (similar to seed script)
        const { error } = await supabaseAdmin.from('components').upsert({
          id: component.id,
          component_type: component.type,
          manufacturer_id: component.manufacturer_id,
          model_name: component.model,
          year: component.year,
          weight_grams: component.weight,
          bike_type: component.bikeType,
          msrp_usd: component.msrp
        });

        if (error) {
          errors.push({ component: component.id, error: error.message });
        } else {
          results.push(component.id);
        }
      } catch (error) {
        errors.push({ component: component.id, error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      imported: results.length,
      errors: errors.length,
      errorDetails: errors
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 