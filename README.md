# Build My Own Redux

> 리덕스를 직접 만들어보며 상태 관리 라이브러리의 동작원리를 깊이 있게 이해해보기 위한 프로젝트입니다.

## What I Learned

### 리덕스의 첫 번째 원칙

- 리덕스의 한 가지 중요한 원칙은 우리가 만드는 어플리케이션이 복잡하든 단순하든 그것이 다루는 상태를 단 하나의 객체로 표현한다는 것이다. 모든 변경사항이 리덕스에서는 매우 명확하게 표현된다. 때문에 변경 사항을 추적하는 것이 매우 쉽다. 어떤 변경사항이든 항상 하나의 객체에서 저장하고 있다는 것, 이것이 가장 중요한 리덕스의 원칙이다.

> The First principle of Redux which is that everything that changes in your application including the data and the ui state is contained in a single object. we call the state of the state tree.

<br>

### 리덕스의 두 번째 원칙

- state tree는 read only다. 이것을 수정할 수 없다.
- 만약 상태를 변경하고 싶다면, action을 dispatch 해야한다.
- action은 그냥 변경사항을 묘사하는 plain한 object이다. action은 minimal representation of the change in the application state이다.
- action은 type이라는 필수적인 property를 가지고 있어야 한다. 이것은 action의 이름이다.

<br>

### 리덕스의 세 번째 원칙

- 리덕스는 순수함수로 이루어져있다
- 리덕스에서 상태를 변경할 때는 이전의 상태를 그대로 받고, 그것을 기반으로 하여 새로운 상태를 만든다. 그리고 이전의 상태에 대한 참조를 유지한다.
- 이런 순수함수를 우리는 reducer라고 부른다.

### reducer 만들어보기

- reducer는 이전의 상태와 action을 받아서 새로운 상태를 만들어내는 함수이다.
- reducer는 만약 undefined에 해당하는 initial state를 받을 경우 initial state를 반환한다는 원칙을 가지고 있다.

```js
const counter(state = 0, action) => {
  if (action.type === "INCREMENT") {
    return state + 1
  } else if (action.type === "DECREMENT") {
    return state - 1
  } else {
    return state
  }
}
```

<br>

### store의 메서드

- 우리가 store를 만들 때는 reducer를 인자로 넘겨줘야한다. 이 reducer를 통해서 어떻게 상태를 변경할지 정의한다.
- store는 3가지 중요한 메서드를 가지고 있다.
  - getState() : 현재의 상태를 반환한다.
  - dispatch(action) : action을 dispatch한다.
  - subscribe(listener) : 상태가 변경될 때마다 호출되는 listener를 등록한다.

```js
const render = () => {
  document.body.innerText = store.getState()
}

store.subscribe(render)
render()
```

<br>

### make store from scratch

- store를 만들기 위해서는 reducer를 인자로 받아야한다.
- store는 상태를 저장하고 있어야하고, 상태를 변경할 수 있어야한다.
- store는 상태가 변경될 때마다 listener를 호출해야한다.
- store는 상태를 변경할 때마다 새로운 상태를 만들어야한다.
- dispatch를 호출할 때마다 reducer를 호출해야한다.
- reducer는 이전의 상태와 action을 받아서 새로운 상태를 만들어내는 함수이다.

```js
const createStore = reducer => {
  let state
  let listeners = []

  const getState = () => state

  const dispatch = action => {
    state = reducer(state, action)
    listeners.forEach(listener => listener())
  }

  const subscribe = listener => {
    listeners.push(listener)
    return () => {
      listeners = listeners.filter(l => l !== listener)
    }
  }

  dispatch({})

  return { getState, dispatch, subscribe }
}
```
