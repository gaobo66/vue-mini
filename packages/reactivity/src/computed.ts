import { hasChanged, isFunction } from '@vue/shared'
import { Dependency, endTrack, link, Link, startTrack, Sub } from './system'

import { ReactiveFlags } from "./ref"
import { get } from 'node:http'
import { activeSub, setActiveSub } from './effect'




class ComputedRefImpl implements Dependency, Sub {
  // computed 也是一个 ref，通过 isRef 也返回 true
  [ReactiveFlags.IS_REF] = true

  // 存储计算属性fn的返回值，缓存一份
  _value
  //region 作为 dep，要关联 subs，等值更新了，我要通知它们(subs)重新执行
  /**
   * 订阅者链表的头节点，理解为我们将的 head
   */
  subs: Link

  /**
   * 订阅者链表的尾节点，理解为我们讲的 tail
   */
  subsTail: Link
  //endregion

  //region 作为 sub，我要知道哪些 dep，被我收集了
  /**
   * 依赖项链表的头节点
   */
  deps: Link | undefined

  /**
   * 依赖项链表的尾节点
   */
  depsTail: Link | undefined

  tracking = false
  //endregion

  /**
   * 标识当前计算属性是否是脏的，默认是脏的，因为一上来就会执行一次计算属性的函数
   * 计算属性，脏不脏，如果 dirty 为 true，表示计算属性是脏的，get value 的时候，需要执行 update
   */
  dirty = true

  constructor(
    public fn, //getter
    private setter,
  ) {}

  get value() {
    if (this.dirty) {
      this.update()
    }

    /**
     * 作为 dep 要和 sub 做关联关系
     */
    // 收集依赖
    if (activeSub) {
      link(this, activeSub)
    }
    return this._value
  }

  set value(newValue) {
    if (this.setter) {
      this.setter(newValue)
    } else {
      console.warn('当前计算属性没有 setter 方法，只能读不能写')
    }
  }

  update() {
    /**
     * 实现 sub 的功能，为了在 执行 fn 期间，收集 fn 执行过程中访问到的响应式数据
     * 建立 dep 和 sub 之间的关联关系
     */

    // 先将当前的 effect 保存起来，用来处理嵌套的逻辑
    const prevSub = activeSub

    // 每次执行 fn 之前，把 this 放到 activeSub 上面
    setActiveSub(this)
    startTrack(this)
    try {
      // 拿到老值
      const oldValue = this._value
      // 拿到新的值
      this._value = this.fn()
      // 如果值发生了变化，就返回 true，否则就是 false
        //   当计算结果没有变化时，不会触发订阅者的更新。
      return hasChanged(this._value, oldValue)
    } finally {
      endTrack(this)
      // 执行完成后，恢复之前的 effect
      setActiveSub(prevSub)
    }
  }
}





/**
 * @description: 计算属性
 * 可能是是一个函数，也可能是一个对象，对象中包含 get 和 set 方法
 * @param getterOrOptions
 */

export function computed(getterOrOptions) {
  let getter
  let setter

  if (isFunction(getterOrOptions)) {
    /**
     *  const a = computed(() => {  })
     */
    getter = getterOrOptions
  } else {
    /**
     * const c = computed({
     *   get(){},
     *   set(){}
     * })
     */
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }

  return new ComputedRefImpl(getter, setter)
}