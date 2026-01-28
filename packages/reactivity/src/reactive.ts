import {isObject} from "@vue/shared"
import { mutableHandlers } from "./baseHandlers"




export function reactive(target) {

    return createReactiveObject(target)
}



/**
 * 保存 target 和 响应式对象之间的关联关系 即存储代理对象
 * target => proxy
 */
const reactiveMap = new WeakMap()

/**
 * 保存所有使用 reactive 创建出来的响应式对象
 */
const reactiveSet = new WeakSet()

function createReactiveObject(target) {
    /**
    * reactive 必须接受一个对象
    */
    if (!isObject(target)) return target


    /**
     * 看一下这个 target 在不在 reactiveSet 里面，如果在，就证明 target 是响应式的，直接返回
     */     
    if(reactiveSet.has(target)){
        return target
    }

    /**
     * 获取到之前这个 target 创建的代理对象
     * 如果这个对象已经被代理过了，就直接返回代理对象
     */
    const existingProxy = reactiveMap.get(target)
    if (existingProxy) {
        return existingProxy
    }

    /**
     * 创建代理对象
     */

   const proxy =  new Proxy(target, mutableHandlers)

   /**
    * 保存 target 和 proxy 之间的映射关系
    */
   reactiveMap.set(target, proxy)

   /**
    * 把 proxy 放到 reactiveSet 里面，表示它是一个响应式对象
    */
   reactiveSet.add(proxy)

   return proxy
}


/**
 * 
 * @description: 判断target是不是响应式对象
 * @param value 
 * @returns 
 */
export function isReactive(value) {
    return reactiveSet.has(value)
}