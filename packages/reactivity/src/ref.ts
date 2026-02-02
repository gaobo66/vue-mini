/*
 * @Author: Mr.G 1271036013@qq.com
 * @Date: 2026-01-23 10:42:35
 * @LastEditors: Mr.G 1271036013@qq.com
 * @LastEditTime: 2026-02-02 10:33:39
 * @FilePath: \vue-mini\packages\reactivity\src\ref.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { hasChanged, isObject } from '@vue/shared';
import { activeSub } from './effect'
import { reactive } from './reactive';
import { Link ,trackRef,triggerRef,Dependency} from './system';
import { ReactiveFlags } from './constants';



class RefImpl  implements Dependency{
  _value;
  /**
   * 存储所有依赖当前 ref 的副作用函数即effect 链表
   * 订阅者链表的头节点，理解为我们将的 head
   */
  subs: Link

  /**
   * 订阅者链表的尾节点，理解为我们讲的 tail
   */
  subsTail: Link
//   标识当前属性是否是 ref 类型
  [ReactiveFlags.IS_REF]= true
  constructor(value) {
    /**
     * 如果 value 是一个对象，那么我们使用 reactive 给它搞成响应式对象
     */
    this._value = isObject(value) ? reactive(value) : value
  }
  get value() {
    // 收集依赖
    if(activeSub){
      trackRef(this)
    }
    return this._value
  }
  set value(newValue) {
    if(hasChanged(this._value,newValue)){
      this._value = isObject(newValue) ? reactive(newValue) : newValue
      // 触发所有依赖当前 ref 的副作用函数(派发更新)
      triggerRef(this)
    }
  }
}

export function ref(value) {
  return new RefImpl(value)
}


/* 
* @description: 判断是否是 ref 类型
* @param {*} value
* @return {*}
*/
export function isRef(value) {
  return !!(value&&value[ReactiveFlags.IS_REF] === true)
}



/**
 * @description 解包 ref 类型的值,如果是 ref 类型,返回 ref.value,否则返回普通值
 * @param value 可以是 ref 类型，也可以是普通值
 * @returns 如果是 ref 类型，返回 ref.value，否则返回普通值
 */
export  function unref(value){
  return isRef(value) ? value.value : value
}


/**
 * 1. toRef
 * 2. toRefs
 * 3. unref
 * 4. proxyRefs
 */


class ObjectRefImpl {
  [ReactiveFlags.IS_REF] = true
  constructor(
    public _object,
    public _key,
  ) {}

  get value() {
    return this._object[this._key]
  }

  set value(newVal) {
    this._object[this._key] = newVal
  }
}


/**
 * @description 将响应式对象的属性转换为 ref 类型的对象
 * @param target 响应式对象
 * @param key 对象的属性名
 * @returns ref 类型的对象
 */
export function toRef(target,key){
  return new  ObjectRefImpl(target, key)
}




/**
 * 
 * @description 将响应式对象的所有属性转换为 ref 类型的对象
 * @param target 响应式对象
 * @returns 包含所有属性的 ref 类型的对象
 */
export function toRefs(target) {
  const res = {}

  for (const key in target) {
    res[key] = new ObjectRefImpl(target, key)
  }

  return res 
}




/**
 * @description 自动解包 ref 类型的对象  模板常用的自动解包 ref 类型的对象
 * @param target 响应式对象
 * @returns 包含所有属性的 ref 类型的对象
 */

export function proxyRefs(target) {
  return new Proxy(target, {
    get(...args) {
      /**
       * 自动解包 ref
       * 如果这个 target[key] 是一个 ref，那就返回 ref.value，否则返回 target[key]
       */

      const res = Reflect.get(...args)

      return unref(res)
    },
    set(target, key, newValue, receiver) {
      const oldValue = target[key]
      /**
       * 如果更新了 state.a 它之前是个 ref，那么会修改原始的 ref.value 的值 等于 newValue
       * 如果 newValue 是一个 ref，那就算了
       */
      if (isRef(oldValue) && !isRef(newValue)) {
        /**
         * const a = ref(0)
         * target = { a }
         * 更新 target.a = 1 ，它就等于更新了 a.value
         * a.value = 1
         */
        oldValue.value = newValue
        return true
      }

      return Reflect.set(target, key, newValue, receiver)
    },
  })
}