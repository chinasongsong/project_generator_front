<template>
  <div class="app-chat-view">
    <!-- 顶部栏 -->
    <div class="chat-header">
      <div class="header-left">
        <a-button type="text" @click="handleBack">
          <template #icon>
            <ArrowLeftOutlined/>
          </template>
        </a-button>
        <h2 class="app-title">{{ appInfo?.appName || '未命名应用' }}</h2>
        <a-tag v-if="appInfo?.codeGenType" color="blue" class="code-gen-type-tag">
          {{ formatCodeGenType(appInfo.codeGenType) }}
        </a-tag>
      </div>
      <div class="header-right">
        <a-button type="default" @click="showAppDetail">
          <template #icon>
            <InfoCircleOutlined/>
          </template>
          应用详情
        </a-button>
        <a-button
          type="primary"
          ghost
          @click="downloadCode"
          :loading="downloading"
          :disabled="!isOwner"
        >
          <template #icon>
            <DownloadOutlined/>
          </template>
          下载代码
        </a-button>
        <a-button
          type="primary"
          :loading="deploying"
          :disabled="!websiteUrl"
          @click="handleDeploy"
        >
          <template #icon>
            <CloudUploadOutlined/>
          </template>
          部署
        </a-button>
      </div>
    </div>

    <!-- 核心内容区域 -->
    <div class="chat-content">
      <!-- 左侧对话区域 -->
      <div class="chat-area">
        <!-- 消息区域 -->
        <div class="messages-area" ref="messagesRef">
          <!-- 加载更多按钮 -->
          <div v-if="hasMoreHistory" class="load-more-container">
            <a-button type="link" @click="loadMoreHistory" :loading="loadingHistory">
              加载更多历史消息
            </a-button>
          </div>
          <div
            v-for="(message, index) in messages"
            :key="`${message.id || index}-${message.createTime || index}`"
            :class="['message-item', message.role]"
          >
            <div class="message-content">
              <div class="message-avatar">
                <UserOutlined v-if="message.role === 'user'"/>
                <RobotOutlined v-else/>
              </div>
              <div class="message-text">
                <div v-html="formatMessage(message.content, false)"></div>
              </div>
            </div>
          </div>
          <div v-if="streaming" class="message-item assistant">
            <div class="message-content">
              <div class="message-avatar">
                <RobotOutlined/>
              </div>
              <div class="message-text">
                <div v-html="formatMessage(streamContent, true)"></div>
                <div class="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入框区域 -->
        <div class="input-area">
          <div class="input-wrapper">
            <a-tooltip :title="isOwner ? '' : '无法在别人的作品下对话哦~'" placement="top">
              <a-textarea
                v-model:value="inputMessage"
                :placeholder="getInputPlaceholder()"
                :rows="4"
                :maxlength="1000"
                @keydown.enter.prevent="handleSendMessage"
                :disabled="streaming || !isOwner"
              />
            </a-tooltip>
            <div class="input-actions">
              <a-button
                type="primary"
                @click="handleSendMessage"
                :loading="streaming"
                :disabled="streaming || !isOwner"
              >
                <template #icon>
                  <SendOutlined/>
                </template>
              </a-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧网站展示区域 -->
      <div class="preview-area">
        <div class="preview-container">
          <div class="preview-header">
            <h3>生成后的网页展示</h3>
            <div class="preview-actions">
              <a-button v-if="websiteUrl" type="link" @click="handleOpenInNewTab">
                <template #icon>
                  <ExportOutlined/>
                </template>
                新窗口打开
              </a-button>
            </div>
          </div>
          <div class="preview-content">
            <div v-if="!websiteUrl && !streaming" class="preview-placeholder">
              <div class="placeholder-icon">🌐</div>
              <p>网站文件生成完成后将在这里展示</p>
            </div>
            <div v-else-if="streaming" class="preview-loading">
              <a-spin size="large"/>
              <p>正在生成网站...</p>
            </div>
            <iframe
              v-else
              :src="websiteUrl"
              class="preview-iframe"
              frameborder="0"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
    <AppDetailModal :open="appDetailVisible" :app="appInfo"
                    @update:open="(v:boolean)=> appDetailVisible = v"/>
  </div>
</template>

<script setup lang="ts">
import {computed, nextTick, onMounted, reactive, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {message} from 'ant-design-vue'
import {
  ArrowLeftOutlined,
  CloudUploadOutlined,
  DownloadOutlined,
  ExportOutlined,
  InfoCircleOutlined,
  RobotOutlined,
  SendOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'
import {deployApp, downloadFileAsZip, getAppById} from '@/api/appController'
import {getMessages} from '@/api/chatHistoryController'
import {useUserStore} from '@/stores/user'
import request from '@/request'
import {getPreviewPath} from '@/utils/previewPath'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import json from 'highlight.js/lib/languages/json'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import bash from 'highlight.js/lib/languages/bash'
import 'highlight.js/styles/github.css'

// 注册高亮语言
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('html', html)
hljs.registerLanguage('css', css)
hljs.registerLanguage('json', json)
hljs.registerLanguage('python', python)
hljs.registerLanguage('java', java)
hljs.registerLanguage('bash', bash)

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const appId = ref<string>(String(route.params.id))
const appInfo = ref<API.AppVO | null>(null)

// 消息列表
const messages = reactive<Array<{ id?: number; role: 'user' | 'assistant'; content: string; createTime?: string }>>([])

// 输入消息
const inputMessage = ref('')

// 流式输出
const streaming = ref(false)
const streamContent = ref('')
const messagesRef = ref<HTMLElement | null>(null)

// 历史消息相关
const loadingHistory = ref(false)
const hasMoreHistory = ref(false)
const cursorTime = ref<string | undefined>(undefined)
const PAGE_SIZE = 1

// 网站URL
const websiteUrl = ref('')
// 预览域名（用于展示生成的静态站点），优先读取环境变量
const PREVIEW_DOMAIN = ((import.meta as any).env?.VITE_PREVIEW_DOMAIN as string) || (request.defaults.baseURL || '')

// 部署状态
const deploying = ref(false)

// 下载状态
const downloading = ref(false)

// 应用详情弹窗
const appDetailVisible = ref(false)

// 权限计算
const isOwner = computed(() => {
  return appInfo.value?.userId === userStore.loginUser?.id
})

const isAdmin = computed(() => {
  return userStore.loginUser?.userRole === 'admin'
})

// 格式化消息内容，检测并高亮代码块（支持流式输出）
const formatMessage = (content: string, isStreaming: boolean = false): string => {
  if (!content) return ''

  // 检测代码块，格式为 ```语言\n代码\n```
  const codeBlocks: Array<{ start: number; end: number; lang: string; code: string; highlighted: string; isComplete: boolean }> = []

  // 查找所有代码块
  let index = 0

  while (index < content.length) {
    const codeBlockStart = content.indexOf('```', index)

    if (codeBlockStart === -1) {
      // 没有更多代码块
      break
    }

    // 检查是否在代码块标记中的语言部分
    const afterStart = content.substring(codeBlockStart + 3)
    const langMatch = afterStart.match(/^(\w+)?\n/)

    if (!langMatch) {
      index = codeBlockStart + 3
      continue
    }

    const lang = langMatch[1] || 'text'
    const codeStart = codeBlockStart + 3 + langMatch[0].length

    // 查找代码块结束标记
    const codeBlockEnd = content.indexOf('```', codeStart)

    if (codeBlockEnd === -1) {
      // 代码块未完成（流式输出）
      if (isStreaming) {
        const code = content.substring(codeStart)
        let highlightedCode = ''

        try {
          if (lang && hljs.getLanguage(lang)) {
            highlightedCode = hljs.highlight(code, {language: lang}).value
          } else {
            highlightedCode = escapeHtml(code)
          }
        } catch (e) {
          highlightedCode = escapeHtml(code)
        }

        codeBlocks.push({
          start: codeBlockStart,
          end: content.length,
          lang,
          code,
          highlighted: highlightedCode,
          isComplete: false
        })
      }
      break
    } else {
      // 代码块完整
      const code = content.substring(codeStart, codeBlockEnd)
      let highlightedCode = ''

      try {
        if (lang && hljs.getLanguage(lang)) {
          highlightedCode = hljs.highlight(code, {language: lang}).value
        } else if (lang !== '') {
          const autoDetected = hljs.highlightAuto(code)
          highlightedCode = autoDetected.value
        } else {
          highlightedCode = escapeHtml(code)
        }
      } catch (e) {
        highlightedCode = escapeHtml(code)
      }

      codeBlocks.push({
        start: codeBlockStart,
        end: codeBlockEnd + 3,
        lang,
        code,
        highlighted: highlightedCode,
        isComplete: true
      })

      index = codeBlockEnd + 3
    }
  }

  // 构建结果HTML
  if (codeBlocks.length > 0) {
    let result = ''
    let textStart = 0

    codeBlocks.forEach((block) => {
      // 添加代码块之前的普通文本
      const textBefore = content.substring(textStart, block.start).trim()
      if (textBefore) {
        result += `<div class="text-content">${escapeHtml(textBefore).replace(/\n/g, '<br>')}</div>`
      }

      // 添加代码块容器
      const completeIndicator = block.isComplete ? '' : '<span class="streaming-indicator">▋</span>'
      const langDisplay = block.lang || 'plain text'

      result += `<div class="code-block-wrapper ${block.isComplete ? '' : 'code-block-streaming'}">
        <div class="code-block-header">
          <span class="code-lang">${langDisplay}${completeIndicator}</span>
          ${block.isComplete ? `<button class="copy-btn" onclick="copyCode(this)" data-code="${escapeHtml(block.code.replace(/"/g, '&quot;'))}">复制</button>` : ''}
        </div>
        <pre class="code-block"><code class="hljs language-${block.lang}">${block.highlighted}</code></pre>
      </div>`

      textStart = block.end
    })

    // 添加最后一个代码块之后的普通文本
    const textAfter = content.substring(textStart).trim()
    if (textAfter) {
      result += `<div class="text-content">${escapeHtml(textAfter).replace(/\n/g, '<br>')}</div>`
    }

    return result
  } else {
    // 没有代码块，直接转义HTML
    return `<div class="text-content">${escapeHtml(content).replace(/\n/g, '<br>')}</div>`
  }
}

// 转义HTML字符
const escapeHtml = (text: string): string => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// 复制代码到剪贴板
const copyCode = (btn: HTMLElement) => {
  const code = btn.getAttribute('data-code')
  if (code) {
    navigator.clipboard.writeText(code).then(() => {
      const originalText = btn.textContent
      btn.textContent = '已复制！'
      setTimeout(() => {
        btn.textContent = originalText
      }, 2000)
    })
  }
}

// 加载对话历史消息
const loadChatHistory = async (isLoadMore: boolean = false) => {
  try {
    loadingHistory.value = true
    const params: API.getMessagesParams = {
      appId: appId.value,
      pageSize: PAGE_SIZE,
    }

    // 如果是要加载更多，传入游标时间
    if (isLoadMore && cursorTime.value) {
      params.cursorTime = cursorTime.value
    }

    const {data} = await getMessages(params)

    if (data?.code === 0 && data.data?.records) {
      const historyMessages = data.data.records

      // 将历史消息转换为前端格式，并按时间升序排序
      const formattedMessages = historyMessages
        .filter((msg) => msg.message && msg.messageType)
        .map((msg) => ({
          id: msg.id,
          role: (msg.messageType === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: msg.message || null,
          createTime: msg.createTime,
        }))
        .sort((a, b) => {
          // 按创建时间升序排序
          const timeA = a.createTime ? new Date(a.createTime).getTime() : 0
          const timeB = b.createTime ? new Date(b.createTime).getTime() : 0
          return timeA - timeB
        })

      if (isLoadMore) {
        // 加载更多：插入到列表前面
        messages.unshift(...formattedMessages)
      } else {
        // 首次加载：清空并添加
        messages.length = 0
        messages.push(...formattedMessages)
      }

      // 更新游标：使用当前消息列表中最早的消息创建时间作为下次查询的游标
      // 首次加载或加载更多后，都使用当前列表中最早的消息时间作为游标
      if (formattedMessages.length > 0) {
        const earliestTime = formattedMessages[0].createTime
        if (earliestTime) {
          // 如果是加载更多，消息已经插入到列表前面，所以需要找到当前列表中最早的消息时间
          if (isLoadMore) {
            // 查找当前messages列表中最小的createTime
            const allMessages = [...messages]
            const earliestMsg = allMessages.reduce((earliest, msg) => {
              if (!msg.createTime) return earliest
              if (!earliest || !earliest.createTime) return msg
              const msgTime = new Date(msg.createTime).getTime()
              const earliestTime = new Date(earliest.createTime).getTime()
              return msgTime < earliestTime ? msg : earliest
            }, allMessages[0])
            cursorTime.value = earliestMsg?.createTime || earliestTime
          } else {
            cursorTime.value = earliestTime
          }
        }
      }

      // 判断是否还有更多消息：如果返回的消息数量等于页大小，可能还有更多
      hasMoreHistory.value = historyMessages.length >= PAGE_SIZE

      // 如果不是加载更多，滚动到底部
      if (!isLoadMore) {
        nextTick(() => {
          scrollToBottom()
        })
      }
    }
  } catch (e) {
    message.error('加载历史消息失败，请检查网络连接')
  } finally {
    loadingHistory.value = false
  }
}

// 加载更多历史消息
const loadMoreHistory = async () => {
  // 记录当前滚动位置
  const scrollContainer = messagesRef.value
  const previousScrollHeight = scrollContainer?.scrollHeight || 0

  await loadChatHistory(true)

  // 加载完成后，恢复滚动位置（保持在加载前的位置）
  nextTick(() => {
    if (scrollContainer) {
      const newScrollHeight = scrollContainer.scrollHeight
      const scrollDiff = newScrollHeight - previousScrollHeight
      scrollContainer.scrollTop = scrollDiff
    }
  })
}

// 获取应用信息
const fetchAppInfo = async () => {

  const {data} = await getAppById({id: appId.value})
  if (data?.code === 0) {
    appInfo.value = data.data

    // 加载对话历史
    await loadChatHistory(false)

    // 检查是否需要自动发送初始消息
    // 只有是自己的app且没有对话历史时，才自动发送initPrompt
    if (isOwner.value && appInfo.value?.initPrompt && messages.length === 0) {
      await handleSendInitialMessage()
    }

    // 如果app有代码生成类型（说明已经生成过代码），且存在对话历史，则展示对应的网站
    // 只要有对话历史就尝试显示预览，不限制消息数量
    if (appInfo.value?.codeGenType && messages.length > 0) {
      websiteUrl.value = getPreviewPath(appInfo.value.codeGenType, appId.value, PREVIEW_DOMAIN)
    }
  } else {
    message.error(data?.message || '获取应用信息失败')
  }

}

// 发送初始消息
const handleSendInitialMessage = async () => {
  if (!appInfo.value?.initPrompt) return

  const userMessage = {
    role: 'user' as const,
    content: appInfo.value.initPrompt,
  }
  messages.push(userMessage)

  // 调用AI对话接口
  await sendMessageToAI(appInfo.value.initPrompt)
}

// 发送消息
const handleSendMessage = async () => {
  if (!inputMessage.value.trim() || streaming.value) return

  const userMsg = inputMessage.value.trim()
  const userMessage = {
    role: 'user' as const,
    content: userMsg,
  }
  messages.push(userMessage)
  inputMessage.value = ''

  scrollToBottom()

  // 调用AI对话接口
  await sendMessageToAI(userMsg)
}

// 发送消息到AI - 使用EventSource处理SSE流式数据
const sendMessageToAI = async (userMsg: string) => {
  let eventSource: EventSource | null = null
  let streamCompleted = false
  let fullContent = ''

  try {
    streaming.value = true
    streamContent.value = ''

    // 构建SSE URL
    const baseURL = request.defaults.baseURL || 'http://localhost:8123/api'
    const params = new URLSearchParams({
      appId: appId.value || '',
      userMessage: userMsg,
    })
    const url = `${baseURL}/app/chat/gen/code?${params.toString()}`

    console.log('SSE URL:', url)

    // 创建EventSource连接
    eventSource = new EventSource(url, {
      withCredentials: true,
    })

    // 处理接收到的消息
    eventSource.onmessage = function (event) {
      if (streamCompleted) return

      try {
        // 解析JSON包装的数据
        const parsed = JSON.parse(event.data)
        const content = parsed.content || parsed.d || parsed.data

        // 拼接内容
        if (content !== undefined && content !== null) {
          fullContent += content
          streamContent.value = fullContent

          // 立即滚动到底部
          nextTick(() => {
            scrollToBottom()
          })
        }
      } catch (error) {
        console.error('解析消息失败:', error)
        // 如果不是JSON，尝试直接使用原始数据
        if (event.data) {
          fullContent += event.data
          streamContent.value = fullContent
          nextTick(() => {
            scrollToBottom()
          })
        }
      }
    }

    // 处理done事件
    eventSource.addEventListener('done', function () {
      if (streamCompleted) return

      streamCompleted = true
      streaming.value = false
      eventSource?.close()

      // 将流式内容添加到消息列表
      if (fullContent.trim()) {
        messages.push({
          role: 'assistant',
          content: fullContent,
        })
      }

      // 更新预览URL
      if (appInfo.value?.codeGenType) {
        websiteUrl.value = getPreviewPath(appInfo.value.codeGenType, appId.value, PREVIEW_DOMAIN)
      }

      // 更新hasMoreHistory标志，因为新增了消息，可能还有更多历史消息
      hasMoreHistory.value = true

      // 清空流式内容
      streamContent.value = ''
    })

    // 处理business-error事件（后端限流等错误）
    eventSource.addEventListener('business-error', function (event: MessageEvent) {
      if (streamCompleted) return

      try {
        const errorData = JSON.parse(event.data)
        console.error('SSE业务错误事件:', errorData)

        const errorMessage = errorData.message || '生成过程中出现错误'
        if (fullContent) {
          messages.push({
            role: 'assistant',
            content: fullContent + `\n\n❌ ${errorMessage}`,
          })
        } else {
          messages.push({
            role: 'assistant',
            content: `❌ ${errorMessage}`,
          })
        }

        message.error(errorMessage)

        streamCompleted = true
        streaming.value = false
        eventSource?.close()
        streamContent.value = ''
      } catch (parseError) {
        console.error('解析错误事件失败:', parseError, '原始数据:', event.data)
        handleError(new Error('服务器返回错误'))
      }
    })

    // 处理错误
    eventSource.onerror = function () {
      if (streamCompleted || !streaming.value) return

      // 检查是否是正常的连接关闭
      if (eventSource?.readyState === EventSource.CONNECTING || eventSource?.readyState === EventSource.CLOSED) {
        // 连接已关闭，可能已经完成
        if (!streamCompleted && fullContent.trim()) {
          streamCompleted = true
          streaming.value = false

          // 保存消息
          messages.push({
            role: 'assistant',
            content: fullContent,
          })

          // 更新预览
          if (appInfo.value?.codeGenType) {
            websiteUrl.value = getPreviewPath(appInfo.value.codeGenType, appId.value, PREVIEW_DOMAIN)
          }

          // 更新hasMoreHistory标志
          hasMoreHistory.value = true

          streamContent.value = ''
        }
      } else {
        // 真正的错误
        handleError(new Error('SSE连接错误'))
      }
    }
  } catch (error) {
    console.error('创建 EventSource 失败：', error)
    handleError(error)
  }
}

// 错误处理函数
const handleError = (error: unknown) => {
  console.error('生成代码失败：', error)
  streaming.value = false
  streamContent.value = ''

  // 添加错误消息
  messages.push({
    role: 'assistant',
    content: '抱歉，生成过程中出现了错误，请重试。',
  })

  message.error('生成失败，请重试')
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

// 部署应用
const handleDeploy = async () => {
  try {
    deploying.value = true
    const {data} = await deployApp({
      appId: appId.value,
    })

    if (data?.code === 0 && data.data) {
      message.success(`部署成功！访问地址：${data.data}`)
      // 可以选择打开新窗口
      window.open(data.data, '_blank')
    } else {
      message.error(data?.message || '部署失败')
    }
  } catch (e) {
    message.error('部署失败，请检查网络连接')
  } finally {
    deploying.value = false
  }
}

// 在新窗口打开网站
const handleOpenInNewTab = () => {
  if (websiteUrl.value) {
    window.open(websiteUrl.value, '_blank')
  }
}

// 格式化代码生成类型
const formatCodeGenType = (type?: string) => {
  const typeMap: Record<string, string> = {
    html: 'HTML',
    vue: 'Vue',
    react: 'React',
    angular: 'Angular',
    nextjs: 'Next.js',
    nuxtjs: 'Nuxt.js',
  }
  return type ? typeMap[type] || type.toUpperCase() : ''
}

// 显示应用详情
const showAppDetail = () => {
  appDetailVisible.value = true
}

// 下载代码
const downloadCode = async () => {
  if (!appId.value) {
    message.error('应用ID不存在')
    return
  }
  downloading.value = true
  try {
    // 使用 API 接口下载文件，配置 responseType 为 blob 以处理二进制数据
    const response = await downloadFileAsZip(
      { appId: appId.value },
      {
        responseType: 'blob',
      }
    )

    // 从响应头中获取文件名
    // axios 响应头键名通常是小写的
    const headers = response.headers || {}
    const contentDisposition = headers['content-disposition'] || headers['Content-Disposition'] || ''
    let fileName = `app-${appId.value}.zip`

    if (contentDisposition) {
      // 解析 Content-Disposition 头，格式：attachment; filename="xxx.zip"
      // 支持两种格式：filename="xxx.zip" 或 filename=xxx.zip
      const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (fileNameMatch && fileNameMatch[1]) {
        // 移除引号（支持单引号和双引号）
        fileName = fileNameMatch[1].replace(/^['"]|['"]$/g, '')
      }
    }

    // 获取 blob 数据
    const blob = response.data instanceof Blob ? response.data : new Blob([response.data])

    // 创建下载链接并触发下载
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // 清理 URL 对象
    URL.revokeObjectURL(downloadUrl)
    message.success('代码下载成功')
  } catch (error: any) {
    console.error('下载失败：', error)
    // 如果是 blob 响应但包含错误信息，尝试解析
    if (error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text()
        const errorData = JSON.parse(text)
        message.error(errorData?.message || '下载失败，请重试')
      } catch {
        message.error('下载失败，请重试')
      }
    } else {
      message.error(error?.response?.data?.message || error?.message || '下载失败，请重试')
    }
  } finally {
    downloading.value = false
  }
}

// 获取输入框占位符
const getInputPlaceholder = () => {
  return '请描述你想生成的网站，越详细效果越好哦'
}

const handleBack = () => {
  router.back()
}

// 监听流式内容变化，自动滚动
watch(streamContent, () => {
  scrollToBottom()
})

// 将 copyCode 函数暴露到全局，以便在模板中使用
;(window as any).copyCode = copyCode

onMounted(() => {
  fetchAppInfo()
})
</script>

<script lang="ts">
export default {
  components: {
    AppDetailModal: () => import('@/components/AppDetailModal.vue'),
  },
}
</script>

<style scoped>
.app-chat-view {
  height: calc(100vh - 134px);
  display: flex;
  flex-direction: column;
  background: #fff;
}

.chat-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  position: sticky;
  top: 64px;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.chat-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.chat-area {
  flex: 0 0 40%; /* 左侧 2 */
  max-width: 40%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e8e8e8;
  overflow: hidden;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 12px; /* 收紧间距 */
  background: #f7f8fa;
}

.message-item {
  margin-bottom: 12px; /* 收紧间距 */
}

.message-item.user {
  display: flex;
  justify-content: flex-end;
}

.message-item.assistant {
  display: flex;
  justify-content: flex-start;
}

.message-content {
  max-width: 78%;
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.message-item.user .message-content {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #1890ff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-item.user .message-avatar {
  background: #52c41a;
}

.message-text {
  flex: 1;
  background: #fff;
  padding: 10px 14px;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  word-wrap: break-word;
  word-break: break-word;
}

:deep(.text-content) {
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
  margin: 8px 0;
}

.message-pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
  animation: fadeIn 0.1s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 代码块样式 */
:deep(.code-block-wrapper) {
  margin: 12px 0;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  background: #f6f8fa;
  overflow: hidden;
}

:deep(.code-block-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f1f3f5;
  border-bottom: 1px solid #e1e4e8;
  font-size: 12px;
  font-weight: 600;
  color: #586069;
}

:deep(.code-lang) {
  text-transform: uppercase;
}

:deep(.copy-btn) {
  background: #fff;
  border: 1px solid #d1d5da;
  border-radius: 4px;
  padding: 4px 12px;
  cursor: pointer;
  font-size: 12px;
  color: #0366d6;
  transition: all 0.2s;
}

:deep(.copy-btn:hover) {
  background: #f3f4f6;
  border-color: #0366d6;
}

:deep(.copy-btn:active) {
  transform: scale(0.95);
}

:deep(.code-block) {
  margin: 0;
  padding: 16px;
  background: #fff;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
  font-size: 13px;
  line-height: 1.45;
  color: #24292e;
}

:deep(.code-block code) {
  display: block;
  padding: 0;
  margin: 0;
  background: transparent;
  border: none;
  border-radius: 0;
  word-wrap: normal;
  white-space: pre;
}

/* 流式输出中的代码块 */
:deep(.code-block-streaming) {
  border-color: #1890ff;
  background: #f0f9ff;
}

:deep(.code-block-streaming .code-block-header) {
  background: #e6f7ff;
  border-bottom-color: #91d5ff;
}

:deep(.streaming-indicator) {
  display: inline-block;
  margin-left: 6px;
  color: #1890ff;
  animation: blink 1s infinite;
  font-weight: bold;
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0.3;
  }
}

.typing-indicator {
  display: inline-flex;
  gap: 4px;
  margin-left: 8px;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  background: #999;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.input-area {
  padding: 12px; /* 收紧间距 */
  background: #fff;
  border-top: 1px solid #e8e8e8;
}

.preview-area {
  flex: 0 0 60%; /* 右侧 3 */
  max-width: 60%;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.preview-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.preview-header {
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
}

.preview-loading p {
  margin-top: 16px;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.code-gen-type-tag {
  font-size: 12px;
}

.header-right {
  display: flex;
  gap: 12px;
}

.input-wrapper {
  position: relative;
}

.input-wrapper .ant-input {
  padding-right: 50px;
}

.input-actions {
  position: absolute;
  bottom: 8px;
  right: 8px;
}

/* 滚动条样式 */
.messages-area::-webkit-scrollbar {
  width: 6px;
}

.messages-area::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.messages-area::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.messages-area::-webkit-scrollbar-thumb:hover {
  background: #555;
}


.load-more-container {
  display: flex;
  justify-content: center;
  align-items: center; /* 垂直居中，避免文字偏移 */
  padding: 16px 12px; /* 上下内边距稍大，提升点击区域 */
  background: transparent; /* 完全透明底色 */
  cursor: pointer; /* 点击指针，提示可交互 */
}


/* hover 轻微反馈（可选，提升体验） */
.load-more-container:hover {
  color: #096dd9; /* hover时加深颜色 */
}


@media (max-width: 768px) {
  .chat-content {
    flex-direction: column;
  }

  .preview-area {
    width: 100%;
    height: 50%;
  }

  .chat-area {
    border-right: none;
    border-bottom: 1px solid #e8e8e8;
  }
}
</style>
