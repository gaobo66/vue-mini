import { activeSub } from "./effect"

/*
 * @Author: Mr.G 1271036013@qq.com
 * @Date: 2026-01-23 11:12:10
 * @LastEditors: Mr.G 1271036013@qq.com
 * @LastEditTime: 2026-01-27 10:02:40
 * @FilePath: \vue-mini\packages\reactivity\src\system.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

/**
 * 表示依赖的链表节点（ref）
 */
export interface Dependency {
  // 订阅者链表的头节点
  subs: Link | undefined
  // 订阅者链表的尾节点
  subsTail: Link | undefined
}


/**
 * 表示订阅者的链表节点,即存放我们的 effect 函数
 */
export interface Sub {
  deps:Link | undefined // 依赖的链表头节点（关联的ref链表）
  // 依赖项链表的尾节点
  depsTail: Link | undefined
}


export interface Link {
  // 订阅者  即当前要关联的 effect
  sub: Sub
  // 链表的下一个节点
  nextSub: Link
  // 链表的上一个节点
  prevSub: Link
  // 依赖项 即当前关联的 ref
  dep:Dependency
  // 链表的下一个节点
  nextDep: Link
}


/**
 * 链接链表关系
 * @param dep
 * @param sub
 */
export function link(dep, sub) {
  //region 尝试复用链表节点
  const currentDep = sub.depsTail
  /**
   * 分两种情况：
   * 1. 如果头节点有，尾节点没有，那么尝试着复用头节点
   * 2. 如果尾节点还有 nextDep，尝试复用尾节点的 nextDep
   */
  const nextDep = currentDep === undefined ? sub.deps : currentDep.nextDep
  // 1. 确保待复用的节点存在
  // 2. 确保待复用节点的依赖项与当前依赖项相同
  if (nextDep && nextDep.dep === dep) {
    sub.depsTail = nextDep
    return
  }
  //endregion

  // 如果 activeSub 有，那就保存起来，等我更新的时候，触发
  const newLink = {
    // 订阅者：即关联的 effect
    sub,
    nextSub: undefined,
    prevSub: undefined,
    // 依赖项：即关联的 ref
    dep,
    nextDep: undefined,
  }

  //region 将链表节点和 dep 建立关联关系
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
  //endregion

  //region 将链表节点和 sub 建立关联关系
  /**
   * 关联链表关系，分两种情况
   * 1. 尾节点有，那就往尾节点后面加
   * 2. 如果尾节点没有，则表示第一次关联，那就往头节点加，头尾相同
   */
  if (sub.depsTail) {
    sub.depsTail.nextDep = newLink
    sub.depsTail = newLink
  } else {
    sub.deps = newLink
    sub.depsTail = newLink
  }
  //endregion
}

/**
 * 收集依赖，建立 ref 和 effect 之间的链表关系
 * @param dep 存放的effect的链表
 */
export function trackRef(dep) {
  // console.log('trackRef收集依赖', dep, activeSub)
  if (activeSub) {
    link(dep, activeSub)
  }
}


/**
 * 开始追踪依赖，将depsTail，尾节点设置成 undefined
 * @param sub
 */
export function startTrack(sub) {
  sub.depsTail = undefined
}

/**
 * 结束追踪，找到需要清理的依赖，断开关联关系
 * @param sub
 */
export function endTrack(sub) {
  const depsTail = sub.depsTail

  /**
   * depsTail 有，并且 depsTail 还有 nextDep ，我们应该把它们的依赖关系清理掉
   * depsTail 没有，并且头节点有，那就把所有的都清理掉
   */
  if (depsTail) {
     // 如果 depsTail 还有 nextDep，说明后面的依赖需要清理
    if (depsTail.nextDep) {
      clearTracking(depsTail.nextDep)
      depsTail.nextDep = undefined
    }
     // 如果 depsTail 为空但 deps 存在，说明这次执行没有收集到任何依赖
  } else if (sub.deps) {
    clearTracking(sub.deps)
    sub.deps = undefined
  }
}


/**
 * @description: 清理依赖关系
 * @param link 
 */
function clearTracking(link: Link) {
  while (link) {
    const { prevSub, nextSub, nextDep, dep } = link

    /**
     * 如果 prevSub 有，那就把 prevSub 的下一个节点，指向当前节点的下一个
     * 如果没有，那就是头节点，那就把 dep.subs 指向当前节点的下一个
     */

    if (prevSub) {
      prevSub.nextSub = nextSub
      link.nextSub = undefined
    } else {
      dep.subs = nextSub
    }

    /**
     * 如果下一个有，那就把 nextSub 的上一个节点，指向当前节点的上一个节点
     * 如果下一个没有，那它就是尾节点，把 dep.depsTail 只想上一个节点
     */
    if (nextSub) {
      nextSub.prevSub = prevSub
      link.prevSub = undefined
    } else {
      dep.subsTail = prevSub
    }

    link.dep = link.sub = undefined
    link.nextDep = undefined
    link = nextDep
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


