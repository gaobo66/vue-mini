/*
 * @Author: Mr.G 1271036013@qq.com
 * @Date: 2026-01-23 10:42:35
 * @LastEditors: Mr.G 1271036013@qq.com
 * @LastEditTime: 2026-01-23 14:43:08
 * @FilePath: \vue-mini\packages\reactivity\src\effect.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// 当前正在收集的副作用函数，在模块中导出变量，这个时候当我执行 effect 的时候，
// 我就把当前正在执行的函数，放到 activeSub 中，
// 当然这么做只是为了我们在收集依赖的时候能找到它，
// 如果你还是不理解，那你就把他想象成一个全局变量，
// 这个时候如果执行 effect 那全局变量上就有一个正在执行的函数，就是 activeSub
export let activeSub



class ReactiveEffect {
  // 表示这个 effect 是否激活
  active = true
  constructor(public fn) {}

  run() {
    if (!this.active) {
      return this.fn()
    }


    /* 
    * 保存上一个 activeSub 的值，防止嵌套 effect 时丢失
    * 例如：
    * effect(() => {
    *   console.log(count.value, 'effect1')
    *   effect(() => {
    *     console.log(count.value, 'effect2')
    *   })
    * })
    * 
    *不保存上一个activeSub，输出：
    * 0 effect1
    * 0 effect2
    * 1 effect2
    */
    const prevSub = activeSub

      // 设置当前活跃的副作用函数，方便在 get 中收集依赖
    activeSub  =this
    try {
      return this.fn()
    } finally {
      // 清空当前活跃的副作用函数
      activeSub = prevSub
    }
  }
}



// effect 函数用于注册副作用函数
// 执行传入的函数，并在执行期间自动收集依赖
export function effect(fn) {
  const _effect = new ReactiveEffect(fn)
  // console.log(_effect,'当前活跃的副作用函数')
  _effect.run()
}