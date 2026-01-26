import { activeSub } from "./effect"

/*
 * @Author: Mr.G 1271036013@qq.com
 * @Date: 2026-01-23 11:12:10
 * @LastEditors: Mr.G 1271036013@qq.com
 * @LastEditTime: 2026-01-26 09:45:25
 * @FilePath: \vue-mini\packages\reactivity\src\system.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export interface Link {
  // 订阅者  即当前要关联的 effect
  sub: Function
  // 链表的下一个节点
  nextSub: Link
  // 链表的上一个节点
  prevSub: Link
}


/**
 * 链接链表关系
 * @param dep
 * @param sub
 */
export function link(dep, sub) {
  // 如果 activeSub 有，那就保存起来，等我更新的时候，触发
  const newLink = {
    sub,
    nextSub: undefined,
    prevSub: undefined
  }

  /**
   * 关联链表关系，分两种情况
   * 1. 尾节点有，那就往尾节点后面加
   * 2. 如果尾节点没有，则表示第一次关联，那就往头节点加，头尾相同
   */
  if (dep.subsTail) {
    dep.subsTail.nextSub = newLink
    newLink.prevSub = dep.subsTail
    dep.subsTail = newLink
  } else {
    dep.subs = newLink
    dep.subsTail = newLink
  }
}

/**
 * 收集依赖，建立 ref 和 effect 之间的链表关系
 * @param dep 存放的effect的链表
 */
export function trackRef(dep) {
//   console.log('trackRef收集依赖', dep, activeSub)
  if (activeSub) {
    link(dep, activeSub)
  }
}




/**
 * 传播更新的函数
 * @param subs
 */
export function propagate(subs) {
  let link = subs
  let queuedEffect = []
  while (link) {
    queuedEffect.push(link.sub)
    link = link.nextSub
  }

  queuedEffect.forEach((effect) => effect.notify())
}

/**
 * 派发更新 触发 ref 关联的 effect 重新执行
 * @param dep
 */
export function triggerRef(dep) {
//   console.log('triggerRef 派发更新', dep)
  if (dep.subs) {
    propagate(dep.subs)
  }
}