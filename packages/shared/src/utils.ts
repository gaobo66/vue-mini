/*
 * @Author: Mr.G 1271036013@qq.com
 * @Date: 2026-01-27 10:59:50
 * @LastEditors: Mr.G 1271036013@qq.com
 * @LastEditTime: 2026-01-29 15:20:59
 * @FilePath: \vue-mini\packages\shared\src\utils.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

export function isObject(value) {
  return typeof value === 'object' && value !== null
}


/**
 * 看一下值有没有变
 * @param newValue
 * @param oldValue
 */
export function hasChanged(newValue, oldValue) {
  return !Object.is(newValue, oldValue)
}


/**
 * @description: 判断是否是函数
 * @param value 
 * @returns Boolean
 */
export function isFunction(value) {
  return typeof value === 'function'
}




/**
 * 
 */

export function isArray(value){
  return !!Array.isArray(value)
}