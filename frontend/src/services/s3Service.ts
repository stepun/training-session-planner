import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

interface S3Config {
  endpoint: string
  bucket: string
  accessKey: string
  secretKey: string
  region: string
}

export class S3Service {
  private config: S3Config
  private s3Client: S3Client

  constructor(config: S3Config) {
    this.config = config

    // Инициализируем S3 клиент для MinIO
    this.s3Client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey,
      },
      forcePathStyle: true, // Важно для MinIO
    })
  }

  async uploadFile(file: File, fileName: string): Promise<string> {
    try {
      // Генерируем уникальное имя файла
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(7)
      const uniqueFileName = `${timestamp}-${randomStr}-${fileName}`

      console.log('Uploading to MinIO:', uniqueFileName)

      // Конвертируем File в ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = new Uint8Array(arrayBuffer)

      // Загружаем файл в MinIO
      const command = new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: uniqueFileName,
        Body: buffer,
        ContentType: file.type,
      })

      await this.s3Client.send(command)

      // Возвращаем публичный URL файла
      const publicUrl = `${this.config.endpoint}/${this.config.bucket}/${uniqueFileName}`
      console.log('File uploaded successfully:', publicUrl)

      return publicUrl
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    }
  }

  async uploadFileBase64(file: File, _fileName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        // Возвращаем data URL для предварительного просмотра
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
}

// Инициализация сервиса с конфигурацией
let s3Service: S3Service | null = null

export const getS3Service = (): S3Service => {
  if (!s3Service) {
    const config: S3Config = {
      endpoint: import.meta.env.VITE_S3_ENDPOINT || "https://storage.sh3.su",
      bucket: import.meta.env.VITE_S3_BUCKET || "training-diagrams",
      accessKey: import.meta.env.VITE_S3_ACCESS_KEY || "",
      secretKey: import.meta.env.VITE_S3_SECRET_KEY || "",
      region: import.meta.env.VITE_S3_REGION || "us-east-1"
    }

    if (!config.accessKey || !config.secretKey) {
      console.warn('S3 credentials not configured. Will use base64 fallback.')
      throw new Error('S3_NOT_CONFIGURED')
    }

    s3Service = new S3Service(config)
  }
  return s3Service
}