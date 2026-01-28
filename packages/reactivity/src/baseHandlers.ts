import { get } from "node:http";
import { track, trigger } from "./dep";
import { isRef } from "./ref";
import { hasChanged } from "@vue/shared";

export const mutableHandlers = {
    get(target, key, receiver) {


        /**
         * target = { a: { b: 2 } }
         * 收集依赖:绑定target 中的某一个key 和sub的关系
         */
        track(target, key)
        return Reflect.get(target, key, receiver)
    
    },
    set(target, key, newValue, receiver) {
        const oldValue = target[key];
        
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



        return res
    }
}


