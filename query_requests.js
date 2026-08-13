const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('./.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach((line) => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    let val = parts.slice(1).join('=').trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[key] = val;
  }
});

const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);

async function run() {
  const { data: enq } = await supabase.from('vehicle_enquiries').select('enquiry_id, customer_name, lead_type, test_drive_requested, source');
  console.log('--- vehicle_enquiries table ---');
  console.log(enq);

  const { data: sell } = await supabase.from('sell_requests').select('request_id, owner_name, status');
  console.log('\n--- sell_requests table ---');
  console.log(sell);

  const { data: td } = await supabase.from('test_drive_requests').select('id, customer_name, status');
  console.log('\n--- test_drive_requests table ---');
  console.log(td);
}

run();
