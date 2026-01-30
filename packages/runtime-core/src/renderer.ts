export function createRenderer(options) {
  // todo
  // 将虚拟节点vnode渲染到容器container中
  const render = (vnode,container) => {
    console.log(vnode,container)
  }

  return {
    render
  } 
}
