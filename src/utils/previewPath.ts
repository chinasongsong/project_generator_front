import {CodeGenTypeEnum} from '@/enums/CodeGenTypeEnum'

/**
 * 根据代码生成类型和 appId 生成预览路径
 * @param codeGenType 代码生成类型
 * @param appId 应用ID
 * @param previewDomain 预览域名，默认为空字符串
 * @returns 完整的预览URL
 */
export function getPreviewPath(
  codeGenType: string | undefined,
  appId: string,
  previewDomain: string = ''
): string {
  if (!codeGenType || !appId) {
    return ''
  }

  // 清理域名，移除末尾的斜杠
  const base = String(previewDomain).replace(/\/$/, '')

  // 基础路径
  const basePath = `${base}/static/${codeGenType}_${appId}`

  // 根据项目类型判断是否需要添加 dist
  // VUE 项目需要在路径后增加 dist
  if (codeGenType === CodeGenTypeEnum.VUE_PROJECT) {
    return `${basePath}/dist/`
  }

  // 其他类型直接返回基础路径
  return `${basePath}/`
}


