export interface ShopItem {
  id: number
  description: string
  image_url: string
  image_key: string
  created_at: string
  deleted_at: string | null
}

export const MAX_SHOP_IMAGE_BYTES = 4 * 1024 * 1024

export function shopImageError(file: Pick<File, 'type' | 'size'>): string | null {
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
    return 'Choose a JPEG, PNG, WebP or GIF image.'
  }
  if (file.size === 0 || file.size > MAX_SHOP_IMAGE_BYTES) {
    return 'Choose an image smaller than 4 MB.'
  }
  return null
}
