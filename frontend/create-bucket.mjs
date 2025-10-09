import { S3Client, CreateBucketCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3'
import { config } from 'dotenv'

// Load environment variables from .env file
config()

// Get configuration from environment variables
const S3_ENDPOINT = process.env.VITE_S3_ENDPOINT || 'https://storage.sh3.su'
const S3_ACCESS_KEY = process.env.VITE_S3_ACCESS_KEY
const S3_SECRET_KEY = process.env.VITE_S3_SECRET_KEY
const S3_REGION = process.env.VITE_S3_REGION || 'us-east-1'

// Validate required credentials
if (!S3_ACCESS_KEY || !S3_SECRET_KEY) {
  console.error('ERROR: S3 credentials not configured!')
  console.error('Please create a .env file with:')
  console.error('  VITE_S3_ACCESS_KEY=your_access_key')
  console.error('  VITE_S3_SECRET_KEY=your_secret_key')
  process.exit(1)
}

const s3Client = new S3Client({
  endpoint: S3_ENDPOINT,
  region: S3_REGION,
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_KEY,
  },
  forcePathStyle: true,
})

async function createBucket() {
  try {
    // Создаем bucket
    console.log('Creating bucket: training-diagrams...')
    await s3Client.send(new CreateBucketCommand({
      Bucket: 'training-diagrams',
    }))
    console.log('✓ Bucket created successfully!')

    // Устанавливаем публичную политику для чтения
    console.log('Setting public read policy...')
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: ['arn:aws:s3:::training-diagrams/*'],
        },
      ],
    }

    await s3Client.send(new PutBucketPolicyCommand({
      Bucket: 'training-diagrams',
      Policy: JSON.stringify(policy),
    }))
    console.log('✓ Public read policy set successfully!')
    console.log('\nBucket "training-diagrams" is ready to use!')
  } catch (error) {
    if (error.name === 'BucketAlreadyOwnedByYou' || error.name === 'BucketAlreadyExists') {
      console.log('✓ Bucket already exists!')
    } else {
      console.error('Error:', error)
    }
  }
}

createBucket()
