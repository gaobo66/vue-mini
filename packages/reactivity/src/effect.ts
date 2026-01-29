/*
 * @Author: Mr.G 1271036013@qq.com
 * @Date: 2026-01-23 10:42:35
 * @LastEditors: Mr.G 1271036013@qq.com
 * @LastEditTime: 2026-01-29 08:54:18
 * @FilePath: \vue-mini\packages\reactivity\src\effect.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import { endTrack, Link, startTrack, Sub } from "./system"

// 当前正在收集的副作用函数，在模块中导出变量，这个时候当我执行 effect 的时候，
// 我就把当前正在执行的函数，放到 activeSub 中，
// 当然这么做只是为了我们在收集依赖的时候能找到它，
// 如果你还是不理解，那你就把他想象成一个全局变量，
// 这个时候如果执行 effect 那全局变量上就有一个正在执行的函数，就是 activeSub
export let activeSub

export function setActiveSub(sub) {
  activeSub = sub
}

export class ReactiveEffect implements Sub {
  // 表示这个 effect 是否激活
  active = true

  // effect 的标识 ，表示这个 effect 是否正在收集依赖
  tracking = false


  // 表示当前 effect 是否是脏的，第一次执行effect 设置是脏的，因为一上来就会执行一次 run 方法
  dirty = false
  /**
   * 依赖项链表的头节点
   */
  deps: Link | undefined

  /**
   * 依赖项链表的尾节点
   */
  depsTail: Link | undefined
  constructor(public fn) {}

  run() {
    if (!this.active) {
      return this.fn()
    }

    /*
     * 保存上一个 activeSub 的值，防止嵌套 effect 时丢失
     */
    const prevSub = activeSub

    // 设置当前活跃的副作用函数，方便在 get 中收集依赖
    setActiveSub(this)
    startTrack(this)
    try {
      return this.fn()
    } finally {
      endTrack(this)
      // 执行完成后，恢l复之前的 effect
      setActiveSub(prevSub)
    }
  }

  /**
   * 通知更新的方法，如果依赖的数据发生了变化，会调用这个函数（多写这个函数时因为scheduler方法可能被重写）
   * 1.在收集依赖时默认调用 一次run 方法
   * 2.在派发更新时，有用户决定，如果传了就调用用户的 scheduler 方法，没有就调用默认的 run 方法
   */
  notify() {
    this.scheduler()
  }

  /**
   * 默认调用 run，如果用户传了，那以用户的为主，实例方法覆盖原型方法，（实例属性的优先级，由于原型属性）
   */
  scheduler() {
    this.run()
  }
}

// effect 函数用于注册副作用函数
// 执行传入的函数，并在执行期间自动收集依赖
export function effect(fn,options?: {scheduler?:Function}) {
  const _effect = new ReactiveEffect(fn)
  // console.log(_effect,'当前活跃的副作用函数')
  Object.assign(_effect,options)
  _effect.run()


  /**
   * 绑定函数的 this
   */
  // const runner = ()=>_effect.run()
  const runner = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}
