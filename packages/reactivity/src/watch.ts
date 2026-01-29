/*
 * @Author: Mr.G 1271036013@qq.com
 * @Date: 2026-01-29 08:56:29
 * @LastEditors: Mr.G 1271036013@qq.com
 * @LastEditTime: 2026-01-29 14:25:04
 * @FilePath: \vue-mini\packages\reactivity\src\watch.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AEst
 */

import { ReactiveEffect } from './effect'
import { isReactive } from './reactive'
import { isRef } from './ref'
import { isFunction, isObject } from '@vue/shared'

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
  deep?: boolean | number
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
  let { immediate, deep, once } = options || {}

  // 1. 创建一个 getter 函数，用于获取监听源的值
  let getter
  /**
   * 把用户传递的 source 转换为一个函数，因为 effect 需要依赖一个函数来收集依赖
   */
  if (isRef(source)) {
    getter = () => source.value
  } else if (isReactive(source)) {
    // 当source 是响应式对象时，默认开启深度监听
    // 如果用户没有设置 deep 为 true，默认开启深度监听
    if (!deep) {
      deep = true
    }
    getter = () => source
  } else if (isFunction(source)) {
    getter = source
  }

  /**
   * @description 处理 once 选项；如果用户设置了 once 为 true，那么回调函数只会执行一次
   */
  if (once) {
    const onceFn = cb
    cb = (...args) => {
      onceFn(...args)
      stop()
    }
  }

  /**
   * @description 处理 deep 选项；如果用户设置了 deep 为 true，那么会深度监听响应式对象的所有属性
   * 如果deep为number类型，那么会深度监听响应式对象的属性，且监听的深度为deep层
   */
  if (deep) {
    const depth = deep === true ? Infinity : deep
    const baseGetter = getter
    getter = () => traverse(baseGetter(),depth)
  }

  let oldValue

  let cleanup = null

  function onCleanup(cb) {
    cleanup = cb
  }

  // 2. 创建 effect 实例
  const effect = new ReactiveEffect(getter)

  // 3. 设置调度器，当依赖变化时触发回调
  function job() {

     if (cleanup) {
      // 看一下需要不需要清理上一次的副作用，如果有，就执行，执行完了置空
      cleanup()
      cleanup = null
    }


     // 执行 effect.run 拿到 getter 的返回值，不能直接执行 getter，因为要收集依赖
    const newValue = effect.run()
    // 执行用户的回调函数
    cb(newValue, oldValue,onCleanup)
    oldValue = newValue
  }

  effect.scheduler = job

  /**
   * @description 处理 immediate 选项；如果用户设置了 immediate 为 true，那么回调函数会立即执行一次
   */
  if (immediate) {
    job()
  } else {
    // 4. 先执行一次，收集依赖
    oldValue = effect.run()
  }

  /**
   * @description 停止监听
   */
  function stop() {
    effect.stop()
  }

  return stop
}

function traverse(value, depth = Infinity, seen = new Set()) {
  // value如果不是一个对象 或者监听的层级到了，直接返回value
  if (!isObject(value) || depth <= 0) {
    return value
  }

  /**
   * 
   */
  // 如果value已经被访问过了，直接返回value，防止递归循环栈溢出
  if (seen.has(value)) {
    return value
  }
  seen.add(value)
  depth--
  for (const key in value) {
    traverse(value[key], depth, seen)
  }
  return value
}