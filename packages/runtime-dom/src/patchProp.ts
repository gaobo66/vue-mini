/*
 * @Author: Mr.G 1271036013@qq.com
 * @Date: 2026-01-30 09:45:37
 * @LastEditors: Mr.G 1271036013@qq.com
 * @LastEditTime: 2026-01-30 16:37:58
 * @FilePath: \vue-mini\packages\runtime-dom\src\patchProp.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import { isOn } from '@vue/shared'
import { patchClass } from './modules/patchClass'
import { patchStyle } from './modules/patchStyle'
import { patchEvent } from './modules/events'

/**
 * @description: 用于更新 DOM 元素的属性
 * 1. class
 * 2. style
 * 3. event
 * 4. attr
 * @param el 要操作的 DOM 元素
 * @param key 属性名
 * @param prevValue 旧属性值
 * @param nextValue 新属性值
 */
export function patchProp(el, key, prevValue, nextValue) {
  if (key === 'class') {
    return patchClass(el, nextValue)
  }

  if (key === 'style') {
    return patchStyle(el, prevValue, nextValue)
  }
  //   事件处理
  if (isOn(key)) {
    return patchEvent(el, key, prevValue, nextValue)
  }
}
