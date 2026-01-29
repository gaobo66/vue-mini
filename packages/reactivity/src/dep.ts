import { activeSub } from "./effect";
import { link, Link, propagate } from "./system";


import { isArray} from  "@vue/shared"






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



  /** 
   * 处理数组的隐式更新
   */
    const targetIsArray = isArray(target)

    if(targetIsArray&&key==='length'){
        /**
         * 更新数组的 length
         * 更新前：length = 4 => ['a', 'b', 'c', 'd']
         * 更新后：length = 2 => ['a', 'b']
         * 得出结论：要通知 访问了 c 和 d 的 effect 重新执行，就是访问了大于等于 length 的索引
         * depsMap = {
         *   0:Dep,
         *   1:Dep,
         *   2:Dep,
         *   3:Dep
         *   length:Dep
         * }
         */
        const len = target.length            
        depsMap.forEach((dep,depKey) => {
            /**
             * 通知访问了大于等于 length 的 effect 重新执行
             * 和 访问了 length 的 effect 重新执行
             */
            if(depKey>=len || depKey === 'length'){
                propagate(dep.subs)
            }
        });        
    }else{
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

 
}