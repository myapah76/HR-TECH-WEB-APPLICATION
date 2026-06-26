const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dy45rrkhf'
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'hrtech_preset'

export const uploadToCloudinary = async (file: File, folder: string): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
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
