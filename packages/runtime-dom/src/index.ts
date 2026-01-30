/*
 * @Author: Mr.G 1271036013@qq.com
 * @Date: 2026-01-30 09:22:09
 * @LastEditors: Mr.G 1271036013@qq.com
 * @LastEditTime: 2026-01-30 09:49:29
 * @FilePath: \vue-mini\packages\runtime-dom\src\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * runtime-dom 的使命就是提供浏览器内置的 DOM 操作 API，
 * 并且它会根据 runtime-core 提供的 createRenderer 函数，创建一个渲染器，
 * 当然这个渲染器需要用到 DOM 操作的 API，
 * 所以只需要调用 createRenderer 将 nodeOps 和 patchProp 传递过去即可
 */

export * from '@vue/runtime-core'

import { createRenderer } from '@vue/runtime-core'

import { nodeOps } from "./nodeOps"
import { patchProp } from "./patchProp"



const renderOptions = { patchProp, ...nodeOps }
const renderer = createRenderer(renderOptions)

export function render(vnode, container) {
  return renderer.render(vnode, container)
}