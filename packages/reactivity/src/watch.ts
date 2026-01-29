/*
 * @Author: Mr.G 1271036013@qq.com
 * @Date: 2026-01-29 08:56:29
 * @LastEditors: Mr.G 1271036013@qq.com
 * @LastEditTime: 2026-01-29 09:37:53
 * @FilePath: \vue-mini\packages\reactivity\src\watch.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AEst
 */

import { ReactiveEffect } from "./effect"
import { isReactive } from "./reactive"
import { isRef } from "./ref"
import { isFunction } from "@vue/shared"

/**
 * @description 定义watch
 * @param source 响应式数据
 * @param cb 回调函数
 * @param options 选项
 */
interface WatchOptions {
  /**
   * 是否立即执行回调函数
   */
  immediate?: boolean
  /**
   * 是否深度监听
   */
  deep?: boolean | Number
  /**
   * 是否只监听一次
   */
  once?: boolean
  /**
   * 调度器函数，用于自定义更新逻辑
   */
  scheduler?: (job: () => void) => void
}

/**
 * @description 监听响应式数据的变化
 * @param source 响应式数据
 * @param cb 回调函数
 * @param options 选项
 */

export function watch(source, cb, options: WatchOptions) {
  const { immediate, deep, once } = options || {}

  // 1. 创建一个 getter 函数，用于获取监听源的值
  let getter
  /**
   * 把用户传递的 source 转换为一个函数，因为 effect 需要依赖一个函数来收集依赖
   */
  if (isRef(source)) {
    getter = () => source.value
  } else if (isReactive(source)) {
    getter = () => source
  } else if (isFunction(source)) {
    getter = source
  }

  let oldValue
  // 2. 创建 effect 实例
  const effect = new ReactiveEffect(getter)
  // 3. 设置调度器，当依赖变化时触发回调
    function job() {
    const newValue = effect.run()
    cb(newValue, oldValue)
    oldValue = newValue
  }
  effect.scheduler = job
  // 4. 先执行一次，收集依赖
  oldValue = effect.run()





}
