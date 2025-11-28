import { client } from "./client";

export async function uploadImageToSanity(buffer: Buffer, filename: string, contentType: string) {
  return await client.assets.upload("image", buffer, {
    filename,
    contentType,
  });
}