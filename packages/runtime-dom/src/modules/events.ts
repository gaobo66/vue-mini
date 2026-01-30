function createInvoker(fn) {
  /**
   * 创建一个事件处理函数，内部调用 invoker.value
   * 如果需要更新事件，那后面直接修改 invoker.value 就可以完成事件换绑
   * @param e
   */
  const invoker = e => {
    invoker.value(e)
  }
  invoker.value = fn
  return invoker
}

const veiKey = Symbol('_vei')

export function patchEvent(el, rawName, prevValue, nextValue) {
  const eventName = rawName.slice(2).toLowerCase()
  // 这样写会有性能问题，每次更新属性都要判断是否有事件处理函数，频繁解绑和绑定事件
  // 处理方案：搞一个函数，在函数上搞一个变量，用来存储事件处理函数，这样每次就只需要更换事件函数就OK了
  //   if(nextValue){
  //     el.addEventListener(eventName,nextValue)
  // }
  // if(prevValue){
  //     el.removeEventListener(eventName,prevValue)
  // }

  /**
   * const fn1 = ()=>{ console.log('更新之前的') }
   * const fn2 = ()=>{ console.log('更新之后的') }
   * click el.addEventListener('click',(e)=> { fn2(e) })
   */

  const invokers = (el[veiKey] ??= {}) // 等于 el._vei = el._vei ?? {}

  // 拿到之前绑定的 invoker
  const existingInvoker = invokers[eventName]
  if (nextValue) {
    // 如果之前绑定了，那就更新 invoker.value 完成事件换绑
    if (existingInvoker) {
      existingInvoker.value = nextValue
      return
    }

    // 创建一个新的 invoker
    const invoker = createInvoker(nextValue)
    // 放到 invokers 里面去，就是 el._vei 对象
    invokers[rawName] = invoker
    // 绑定事件，事件处理函数是 invoker
    el.addEventListener(eventName, invoker)
  } else {
    /**
     * 如果没有新事件处理函数，就移除之前绑定的事件处理函数
     */
    if (existingInvoker) {
      el.removeEventListener(eventName, existingInvoker)
      invokers[eventName] = null
    }
  }
}
