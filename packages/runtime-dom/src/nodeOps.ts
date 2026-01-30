import { create } from 'node:domain'

/**
 * nodeOps 提供了浏览器内置的 DOM 操作 API
 */
export const nodeOps = {
  /**
   * @description 插入节点
   * @param el 要插入的节点
   * @param parent 父节点
   * @param anchor 参考节点
   */

  insert(el, parent, anchor) {
    // insertBefore 如果第二个参数为 null，那它就等于 appendChild
    parent.insertBefore(el, anchor || null)
  },

  /**
   * @description 创建元素
   * @param type 元素类型
   * @returns 元素节点
   */
  createElement(type) {
    return document.createElement(type)
  },

  /**
   * @description 移除元素
   * @param el 要移除的元素
   */
  remove(el) {
    const parentNode = el.parentNode
    if (parentNode) {
      parentNode.removeChild(el)
    }
  },

  /**
   * @description 设置元素的文本内容
   * @param el 要设置文本内容的元素
   * @param text 文本内容
   */
  setElementText(el, text) {
    el.textContent = text
  },

  /**
   * @description 创建文本节点
   * @param text 文本内容
   * @returns 文本节点
   */

  createText(text) {
    return document.createTextNode(text)
  },

  /**
   * @description 设置文本节点的文本内容
   * @param node 要设置文本内容的文本节点
   * @param text 文本内容
   */

  setText(node, text) {
    return (node.nodeValue = text)
  },

  /**
   * @description 获取元素的父节点
   * @param el 要获取父节点的元素
   * @returns 父节点
   */
  parentNode(el) {
    return el.parentNode
  },

  /**
   *
   * @description 获取元素的下一个兄弟节点
   * @param el 要获取下一个兄弟节点的元素
   * @returns 下一个兄弟节点
   */
  nextSibling(el) {
    return el.nextSibling
  },

  /**
   * @description dom 查询
   * @param selector css 选择器
   * @returns 匹配的第一个元素
   */
  querySelector(selector) {
    return document.querySelector(selector)
  },
}
