import { getCloudinarySignature } from '@/src/services/cloudinary.service'
import { getSystemConfig } from '@/src/services/system.service'

export const uploadToCloudinary = async (file: File, folder: string): Promise<string> => {
  // 1. Check file size dynamically against database maxFileSize config
  try {
    const config = await getSystemConfig()
    const maxFileSizeMB = config?.maxFileSize || 10
    const maxFileSizeBytes = maxFileSizeMB * 1024 * 1024
    if (file.size > maxFileSizeBytes) {
      throw new Error(`Dung lượng tệp vượt quá giới hạn tối đa cho phép là ${maxFileSizeMB} MB.`)
    }
  } catch {
    const maxFileSizeMB = 10
    const maxFileSizeBytes = maxFileSizeMB * 1024 * 1024
    if (file.size > maxFileSizeBytes) {
      throw new Error(`Dung lượng tệp vượt quá giới hạn tối đa cho phép là ${maxFileSizeMB} MB.`)
    }
  }

  // 2. Fetch upload signature and parameters from Backend
  const sigData = await getCloudinarySignature(folder)

  // 3. Post directly to Cloudinary using signed parameters
  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', sigData.apiKey)
  formData.append('timestamp', sigData.timestamp.toString())
  formData.append('signature', sigData.signature)
  formData.append('folder', folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error.message)
  }

  const data = await res.json()
  return data.secure_url
}
