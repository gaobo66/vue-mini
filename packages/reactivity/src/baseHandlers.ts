import { get } from "node:http";
import { track, trigger } from "./dep";
import { isRef } from "./ref";
import { hasChanged, isArray, isObject } from "@vue/shared";
import { reactive } from "./reactive";




/**
 * 创建一个 getter 工厂函数
 * @param hasShallow 是否是浅响应式
 */
function createGetter(hasShallow = false) {
    return function get(target:object, key:string|symbol, receiver:object):any {
       /**
         * target = { a: { b: 2 } }
         * 收集依赖:绑定target 中的某一个key 和sub的关系
         */
        track(target, key)
        const res = Reflect.get(target, key, receiver)
        /**
         * 如果是ref类型，就返回它的值
         */
        if (isRef(res)) {
          return res.value
        }
        if (isObject(res)) {
          /**
           * 如果 res 是一个对象，那么我就给它包装成 reactive,解决嵌套对象不是响应式的问题
           */
          return hasShallow ? res : reactive(res)
        }
        return res 
    }
}

//  官方是 用类实现的工厂函数，这里用函数实现
// class BaseGetter implements ProxyHandler<any> {
//     constructor(
//          protected readonly hasShallow = false
//     ){}
//     get(target, key, receiver) {
        
//         /**
//          * target = { a: { b: 2 } }
//          * 收集依赖:绑定target 中的某一个key 和sub的关系
//          */
//         track(target, key)
//         const res = Reflect.get(target, key, receiver)
//         /**
//          * 如果是ref类型，就返回它的值
//          */
//         if (isRef(res)) {
//           return res.value
//         }
//         if (isObject(res)) {
//           /**
//            * 如果 res 是一个对象，那么我就给它包装成 reactive,解决嵌套对象不是响应式的问题
//            */
//           return this.hasShallow ? res : reactive(res)
//         }
//         return res
    
//     }
// }







/**
 * @description 创建一个 setter 工厂函数
 * @param hasShallow 是否是浅响应式
 */
function createSetter() {
    return function set(target:object, key:string|symbol, newValue:any, receiver:object):boolean {
        const oldValue = target[key];

        //region 为了处理隐式更新数组的 length
        const targetIsArray = isArray(target)
        const oldLength = targetIsArray ? target.length : 0
        //endregion
        
        /**
         * 如果oldValue是ref类型，就取它的值
         * 且newValue是ref类型，那就算了
         */
        if(isRef(oldValue) && !isRef(newValue)) {
            /**​
45       * const a = ref(0)​
46       * target = { a }​
47       * 更新 target.a = 1 ，它就等于更新了 a.value​
48       * a.value = 1​
49       */
            oldValue.value = newValue
            return true
        }

        /**
         * 如果新值和旧值不相等，就触发更新
         * 先set再触发更新即sub重新执行
        */
        const res = Reflect.set(target, key, newValue, receiver)
        if (hasChanged(newValue, oldValue)) {
        trigger(target, key)
        }

        //region 处理隐式更新数组的 length
        /**
         * 隐式更新 length
         * 更新前：length = 4 => ['a', 'b', 'c', 'd']
         * 更新后：length = 5 => ['a', 'b', 'c', 'd', 'e']
         * 更新动作，以 push 为例，追加了一个 e
         * 隐式更新 length 的方法：push pop shift unshift
         *
         * 如何知道 隐式更新了 length
         */
        const newLength = targetIsArray ? target.length : 0
        if (targetIsArray && newLength !== oldLength && key !== 'length') {
            // console.log('隐式更新了 length',key)
            trigger(target, 'length')
        }
        //endregion
        return res 
    }

}



/**
 * @description 深度响应式处理函数
 */
export const mutableHandlers :ProxyHandler<object> = {

    get: createGetter(false),
    set: createSetter(),

//     get(target, key, receiver) {
    
//         /**
//          * target = { a: { b: 2 } }
//          * 收集依赖:绑定target 中的某一个key 和sub的关系
//          */
//         track(target, key)
//         const res = Reflect.get(target, key, receiver)
//         /**
//          * 如果是ref类型，就返回它的值
//          */
//         if (isRef(res)) {
//           return res.value
//         }
//         if (isObject(res)) {
//           /**
//            * 如果 res 是一个对象，那么我就给它包装成 reactive,解决嵌套对象不是响应式的问题
//            */
//           return reactive(res)
//         }
//         return res
    
//     },
//     set(target, key, newValue, receiver) {
//         const oldValue = target[key];

//         //region 为了处理隐式更新数组的 length
//         const targetIsArray = isArray(target)
//         const oldLength = targetIsArray ? target.length : 0
//         //endregion
        
//         /**
//          * 如果oldValue是ref类型，就取它的值
//          * 且newValue是ref类型，那就算了
//          */
//         if(isRef(oldValue) && !isRef(newValue)) {
//             /**​
// 45       * const a = ref(0)​
// 46       * target = { a }​
// 47       * 更新 target.a = 1 ，它就等于更新了 a.value​
// 48       * a.value = 1​
// 49       */
//             oldValue.value = newValue
//             return true
//         }

//         /**
//          * 如果新值和旧值不相等，就触发更新
//          * 先set再触发更新即sub重新执行
//         */
//         const res = Reflect.set(target, key, newValue, receiver)
//         if (hasChanged(newValue, oldValue)) {
//         trigger(target, key)
//         }

//         //region 处理隐式更新数组的 length
//         /**
//          * 隐式更新 length
//          * 更新前：length = 4 => ['a', 'b', 'c', 'd']
//          * 更新后：length = 5 => ['a', 'b', 'c', 'd', 'e']
//          * 更新动作，以 push 为例，追加了一个 e
//          * 隐式更新 length 的方法：push pop shift unshift
//          *
//          * 如何知道 隐式更新了 length
//          */
//         const newLength = targetIsArray ? target.length : 0
//         if (targetIsArray && newLength !== oldLength && key !== 'length') {
//             // console.log('隐式更新了 length',key)
//             trigger(target, 'length')
//         }
//         //endregion
//         return res
//     }
}

/**
 * @description 浅层响应式处理函数
 */
export const shallowReactiveHandlers :ProxyHandler<object> = {
    get: createGetter(true),
    set: createSetter(),
}


