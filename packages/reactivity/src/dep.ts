import { activeSub } from "./effect";
import { link, Link, propagate } from "./system";






// 目标对象 -> key -> Dep
const targetMap = new WeakMap()

/**
 * @description 收集依赖
 * @param target 目标对象
 * @param key 目标对象的 key
 * 绑定 target 的 key 关联的所有的 Dep
 * obj = { a:0, b:1 }
 * targetMap = {
 *  [obj]:{
 *    a:Dep,
 *    b:Dep
 *  }
 * }
 */
export function track(target, key) {
    if(!activeSub) {
        return
    }

    /**
     * 找到目标对象的 key 关联的所有的 Dep
     * depsMap = {
     *    a:Dep,
     *    b:Dep
     * }
     */
    let depsMap = targetMap.get(target)

    /**
     * 如果不存在，就是之前没有收集过这个对象的任何 key
     * 就创建一个新的 Map 来存储 target 和 Dep 之间的关系
     */
    if (!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }


    /**
     * 找到目标对象的 key 关联的 Dep
     * dep => Dep
     */
    let dep = depsMap.get(key)
    if (!dep) {
        dep = new Dep()
        depsMap.set(key, dep)
    }

    /**
     * 绑定dep和sub之间的关联关系
     */
    link(dep, activeSub)

}


class Dep {

    // 订阅者的链表头节点
    subs:Link

    // 订阅者的链表尾节点
    subsTail:Link

    constructor(){}

}



/**
 * @description 触发更新
 * @param target 目标对象
 * @param key 目标对象的 key
 */

export function trigger(target, key) {
    // console.log('触发更新：trigger', target, key)
  /**
   * 找 depsMap = {
   *    a:Dep,
   *    b:Dep
   *  }
   */
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    /**
     * depsMap 没有，表示这个对象，从来没有任何属性在 sub 中访问过
     */
    return
  }

  const dep = depsMap.get(key)
  if (!dep) {
    /**
     * dep 没有，表示这个属性，从来没有在 sub 中访问过
     */
    return
  }

  /**
   * 找到 dep 的 subs 通知它们重新执行
   */
  propagate(dep.subs)
}