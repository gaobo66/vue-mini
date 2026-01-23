import { activeSub } from './effect'

enum RefImplFlag {
  IS_REF = '__v_isRef',
}
class RefImpl {
  _value;
  // 存储所有依赖当前 ref 的副作用函数
  subs
//   标识当前属性是否是 ref 类型
  [RefImplFlag.IS_REF]: true
  constructor(value) {
    this._value = value
  }
  get value() {
    console.log('get 触发了')
    // 收集依赖
    if(activeSub){
      this.subs = activeSub
    }
    return this._value
  }
  set value(newValue) {
    console.log('set 触发了', newValue)
    this._value = newValue
    // 触发所有依赖当前 ref 的副作用函数(派发更新)
    this.subs?.()
  }
}

export function ref(value) {
  return new RefImpl(value)
}
