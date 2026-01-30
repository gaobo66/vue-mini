
/**
 * 
 * @param el 要操作的 DOM 元素
 * @param value 新的类名
 */
export function patchClass(el,value) {
    if(value==undefined){
        el.removeAttribute('class')
    }
    el.className = value
}