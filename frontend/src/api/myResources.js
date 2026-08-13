import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export const endPoints = {
    "portfolio": "https://paz252.github.io/my-portfolio/",
    "gitHubSource": "https://github.com/paz252/doc-hive"
};

export async function fetchStorageStats() {
    const { data, error } = await supabase.rpc(
        "get_storage_stats"
    );

    if (error) {
        console.error("Failed to fetch storage stats:", error);
        return { doc_count: 0, chunk_count: 0, total_size_mb: 0 };
    }
    
    return data; // { doc_count, chunk_count, total_size_mb }
}