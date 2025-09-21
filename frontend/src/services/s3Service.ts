interface S3Config {
  url: string
  accessKey: string
  secretKey: string
  api: string
  path: string
}

export class S3Service {
  private config: S3Config

  constructor(config: S3Config) {
    this.config = config
  }

  async uploadFile(file: File, fileName: string): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)

    try {
      // Используем прямую загрузку через API
      const response = await fetch(`${this.config.url}/upload`, {
        method: 'POST',
        headers: {
          'X-Access-Key': this.config.accessKey,
          'X-Secret-Key': this.config.secretKey,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      return result.url || result.location
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    }
  }

  async uploadFileBase64(file: File, fileName: string): Promise<string> {
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
      url: import.meta.env.VITE_S3_URL || "https://web-storage.sh3.su/api/v1/service-account-credentials",
      accessKey: import.meta.env.VITE_S3_ACCESS_KEY || "",
      secretKey: import.meta.env.VITE_S3_SECRET_KEY || "",
      api: import.meta.env.VITE_S3_API || "s3v4",
      path: import.meta.env.VITE_S3_PATH || "auto"
    }

    if (!config.accessKey || !config.secretKey) {
      throw new Error('S3 credentials not configured. Please set VITE_S3_ACCESS_KEY and VITE_S3_SECRET_KEY environment variables.')
    }

    s3Service = new S3Service(config)
  }
  return s3Service
}