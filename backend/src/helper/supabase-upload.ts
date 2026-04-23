import path from "path";
import { supabase } from "../config/supabase-config";

export const uploadToSupabase = async (file: Express.Multer.File): Promise<string> => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    
    const { data, error } = await supabase.storage
        .from('Nominees') 
        .upload(uniqueName, file.buffer, {
            contentType: file.mimetype,
            upsert: false
        });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from('Nominees')
        .getPublicUrl(data.path);

    return publicUrl;
};