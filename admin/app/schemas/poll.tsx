import z from "zod";



const MAX_FILE_SIZE = 2 * 1024 * 1024;// 2mb langs
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const createNomineeSchema = z.object({
  name: z.string().max(30),
  bio: z.string().min(3).max(300),
  avatar: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max image size is 2MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
});