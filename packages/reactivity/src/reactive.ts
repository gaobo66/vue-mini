import {isObject} from "@vue/shared"
import { mutableHandlers, shallowReactiveHandlers } from "./baseHandlers"



/**
 * 保存 target 和 响应式对象之间的关联关系 即存储代理对象
 * target => proxy
 */
const reactiveMap = new WeakMap()


/**
 * 保存所有使用 shallowReactive 创建出来的响应式对象
 */
const shallowReactiveMap =  new WeakMap()


/**
 * 保存所有使用 reactive 创建出来的响应式对象
 */
const reactiveSet = new WeakSet()


// v版本；考虑到后续需要 shallowReactive 功能，所以这里先注释掉
// function createReactiveObject(target) {
//     /**
//     * reactive 必须接受一个对象
//     */
//     if (!isObject(target)) return target


//     /**
//      * 看一下这个 target 在不在 reactiveSet 里面，如果在，就证明 target 是响应式的，直接返回
//      */     
//     if(reactiveSet.has(target)){
//         return target
//     }

//     /**
//      * 获取到之前这个 target 创建的代理对象
//      * 如果这个对象已经被代理过了，就直接返回代理对象
//      */
//     const existingProxy = reactiveMap.get(target)
//     if (existingProxy) {
//         return existingProxy
//     }

//     /**
//      * 创建代理对象
//      */

//    const proxy =  new Proxy(target, mutableHandlers)

//    /**
//     * 保存 target 和 proxy 之间的映射关系
//     */
//    reactiveMap.set(target, proxy)

//    /**
//     * 把 proxy 放到 reactiveSet 里面，表示它是一个响应式对象
//     */
//    reactiveSet.add(proxy)

//    return proxy
// }


function createReactiveObject(target,handlers,proxyMap) {
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
    const existingProxy = proxyMap.get(target)
    if (existingProxy) {
        return existingProxy
    }

    /**
     * 创建代理对象
     */

   const proxy =  new Proxy(target, handlers)

   /**
    * 保存 target 和 proxy 之间的映射关系
    */
   proxyMap.set(target, proxy)

   /**
    * 把 proxy 放到 reactiveSet 里面，表示它是一个响应式对象
    */
   reactiveSet.add(proxy)

   return proxy
}




/**
 * @description: 创建一个响应式对象
 * @param target 要代理的目标对象
 * @returns 代理对象
 */
export function reactive(target) {

    return createReactiveObject(target,mutableHandlers,reactiveMap)
}



export function shallowReactive(target) {

    return createReactiveObject(target,shallowReactiveHandlers,shallowReactiveMap)
}

/**
 * 
 * @description: 判断target是不是响应式对象
 * vu源码是在proxy的get中加了一个标识位__v_isReactive
 * @param value 
 * @returns 
 */
export function isReactive(value) {
    return reactiveSet.has(value)
}