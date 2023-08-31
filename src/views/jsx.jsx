import { ref, h, resolveComponent } from 'vue'
import { Button } from 'ant-design-vue';

export default {
  props: {
    /* ... */
  },
  setup(props) {
    // 使用全局注册的组件
    const AButton = resolveComponent('AButton')
    const count = ref(1)

    // 返回渲染函数
    return () => [
      h(MyComponent, {value: 2}),
      h('div', count.value),
      h(Button, 
      {
        type: 'primary',
        onClick(events){count.value++}
      },
      // Vue3 推荐使用函数式插槽，以便获得更佳的性能
      () => '+' 
       ),
      h(AButton, 
      {
        type: 'primary',
        onClick(events){count.value--}
      },
      { default: () => '-' }
       ),
      ]
    // 返回jsx
    // return () => (
    //   <>
    //     <MyComponent value={1}/>
    //     <div>{count.value}</div>
    //     <Button type='primary' onClick={() => count.value++}>+</Button>
    //     <AButton type='primary' onClick={() => count.value--}>-</AButton>
    //   </>
    // )
  }
}

// 无状态时
export function MyComponent(props, { slots, emit, attrs }) {
  return '学习使用渲染函数和JSX!' + props.value
}
MyComponent.props = ['value']
MyComponent.emits = ['click']
