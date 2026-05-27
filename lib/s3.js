import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const region = process.env.AWS_REGION || "us-east-1";

// Ensure we don't crash if env vars are missing at build time
const s3Client = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY 
  ? new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  : null;

/**
 * Uploads a file buffer to S3 and returns the public URL.
 * 
 * @param {Buffer} buffer - The file buffer to upload
 * @param {string} filename - The target filename in the bucket
 * @param {string} contentType - The MIME type of the file
 * @returns {Promise<string>} The public URL of the uploaded file
 */
export async function uploadFileToS3(buffer, filename, contentType) {
  if (!s3Client) {
    throw new Error("AWS credentials are not configured.");
  }
  
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("AWS_S3_BUCKET_NAME is not configured.");
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: \`uploads/avatars/\${filename}\`,
    Body: buffer,
    ContentType: contentType,
    // Note: ACL is removed because newer S3 buckets enforce Bucket Owner Enforced by default
    // and rely on bucket policies for public read access. If you need public read ACLs, 
    // uncomment the line below and ensure your bucket allows ACLs.
    // ACL: "public-read",
  });

  await s3Client.send(command);

  // Return the public URL
  return \`https://\${bucketName}.s3.\${region}.amazonaws.com/uploads/avatars/\${filename}\`;
}
