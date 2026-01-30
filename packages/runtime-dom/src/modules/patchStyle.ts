/*
 * @Author: Mr.G 1271036013@qq.com
 * @Date: 2026-01-30 10:19:27
 * @LastEditors: Mr.G 1271036013@qq.com
 * @LastEditTime: 2026-01-30 10:25:01
 * @FilePath: \vue-mini\packages\runtime-dom\src\modules\patchStyle.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

/**
 * @description: 用于更新 DOM 元素的样式
 * @param el 要操作的 DOM 元素
 * @param prevValue 旧样式对象
 * @param nextValue 新样式对象
 */
export function patchStyle(el,prevValue,nextValue) {
    const style = el.style
  if (nextValue) {
    /**
     * 把新的样式全部生效，设置到 style 中
     */
    for (const key in nextValue) {
      style[key] = nextValue[key]
    }
  }

  if (prevValue) {
    /**
     * 把之前有的，但是现在没有的，给它删掉
     * 之前是 { background:'red' } => { color:'red' } 就要把 backgroundColor 删掉，把 color 应用上
     */
    for (const key in prevValue) {
      if (nextValue?.[key] == null) {
        style[key] = null
      }
    }
  }
    

  /**
   * 为啥要先挂载新样式，再卸载旧样式？
   * 因为如果先卸载旧样式，再挂载新样式，性能可能略差：即使某些样式没有变化，也会先被删除再重新设置
   * 可能导致不必要的重绘/回流：清空样式会触发一次重绘，设置新样式可能触发多次
   */

}