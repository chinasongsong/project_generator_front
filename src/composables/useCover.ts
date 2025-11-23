import {computed, type Ref} from 'vue'

/**
 * 处理 GitHub URL，转换为 raw 格式
 */
export function getCoverUrl(url?: string): string {
  if (!url) return ''
  let u = url.trim()
  if (u.includes('github.com') && !u.includes('raw.githubusercontent.com')) {
    if (u.includes('/blob/')) {
      u = u
        .replace('https://github.com/', 'https://raw.githubusercontent.com/')
        .replace('http://github.com/', 'https://raw.githubusercontent.com/')
        .replace('/blob/', '/')
      return u
    }
    if (!/[?&]raw=1\b/.test(u)) {
      u += (u.includes('?') ? '&' : '?') + 'raw=1'
    }
  }
  return u
}

/**
 * 处理图片加载错误，回退到默认图片
 */
export function onImgError(e: Event) {
  const img = e.target as HTMLImageElement
  if (!img) return
  img.onerror = null
  img.src = '/logo.png'
}

/**
 * 封面图片相关的组合函数
 * @param cover - 封面 URL（可以是字符串或 ref）
 * @returns 标准化后的封面 URL
 */
export function useCover(cover: string | Ref<string | undefined>) {
  const normalizedCover = computed(() => {
    const coverValue = typeof cover === 'string' ? cover : cover.value
    return getCoverUrl(coverValue)
  })

  return {
    normalizedCover,
    onImgError,
  }
}

