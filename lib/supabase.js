import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pljgnlfdtvvbifukwiks.supabase.co";
const supabaseKey = "sb_publishable_4tkxzLwbolJRZFWdTCgWgg_yNUmS-z5";

export const supabase = createClient(supabaseUrl, supabaseKey);