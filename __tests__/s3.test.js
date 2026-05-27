import { uploadFileToS3 } from "@/lib/s3"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

// Mock the AWS SDK
jest.mock("@aws-sdk/client-s3", () => {
  const mS3Client = {
    send: jest.fn().mockResolvedValue({}),
  }
  return {
    S3Client: jest.fn(() => mS3Client),
    PutObjectCommand: jest.fn((args) => args),
  }
})

describe("S3 Utility", () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    process.env = { ...originalEnv }
    
    // Set required environment variables for the test
    process.env.AWS_REGION = "us-east-1"
    process.env.AWS_ACCESS_KEY_ID = "mock-access-key"
    process.env.AWS_SECRET_ACCESS_KEY = "mock-secret-key"
    process.env.AWS_S3_BUCKET_NAME = "mock-bucket"
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it("should upload a file and return the public S3 URL", async () => {
    // Re-import the module to pick up the new environment variables
    const { uploadFileToS3 } = await import("@/lib/s3")
    
    const buffer = Buffer.from("mock-file-content")
    const filename = "avatar.png"
    const contentType = "image/png"

    const url = await uploadFileToS3(buffer, filename, contentType)

    // Check if the client's send method was called with the correct command (which is just the args due to our mock)
    const { S3Client } = await import("@aws-sdk/client-s3")
    const mS3ClientInstance = new S3Client()
    
    expect(mS3ClientInstance.send).toHaveBeenCalledTimes(1)
    expect(mS3ClientInstance.send).toHaveBeenCalledWith({
      Bucket: "mock-bucket",
      Key: "uploads/avatars/avatar.png",
      Body: buffer,
      ContentType: contentType,
    })

    // Check if the URL is formatted correctly
    expect(url).toBe("https://mock-bucket.s3.us-east-1.amazonaws.com/uploads/avatars/avatar.png")
  })

  it("should throw an error if AWS_S3_BUCKET_NAME is not configured", async () => {
    delete process.env.AWS_S3_BUCKET_NAME
    
    const { uploadFileToS3 } = await import("@/lib/s3")
    
    const buffer = Buffer.from("mock-file-content")
    
    await expect(uploadFileToS3(buffer, "test.png", "image/png")).rejects.toThrow(
      "AWS_S3_BUCKET_NAME is not configured."
    )
  })

  it("should throw an error if AWS credentials are not configured", async () => {
    delete process.env.AWS_ACCESS_KEY_ID
    delete process.env.AWS_SECRET_ACCESS_KEY
    
    const { uploadFileToS3 } = await import("@/lib/s3")
    
    const buffer = Buffer.from("mock-file-content")
    
    await expect(uploadFileToS3(buffer, "test.png", "image/png")).rejects.toThrow(
      "AWS credentials are not configured."
    )
  })
})
