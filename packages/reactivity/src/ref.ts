/*
 * @Author: Mr.G 1271036013@qq.com
 * @Date: 2026-01-23 10:42:35
 * @LastEditors: Mr.G 1271036013@qq.com
 * @LastEditTime: 2026-01-28 14:40:45
 * @FilePath: \vue-mini\packages\reactivity\src\ref.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { isObject } from '@vue/shared';
import { activeSub } from './effect'
import { reactive } from './reactive';
import { Link ,trackRef,triggerRef,Dependency} from './system';


export enum ReactiveFlags {
  IS_REF = '__v_isRef',
}
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
    this._value = isObject(newValue) ? reactive(newValue) : newValue
    // 触发所有依赖当前 ref 的副作用函数(派发更新)
    triggerRef(this)
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