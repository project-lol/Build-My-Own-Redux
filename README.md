# Build My Own State Management Library

> 상태관리 라이브러리를 직접 만들어보며 동작원리를 깊이 있게 이해해보기 위한 프로젝트입니다.

## What I Learned

<br>

### Publish / Subscribe Pattern

- 이벤트를 발생시키는 객체와 이벤트를 처리하는 객체가 서로를 모르는 상태에서도 이벤트를 처리할 수 있도록 하는 패턴
- 이 패턴을 이해하기 위해 일상생활의 예로 들면, 레스토랑에 갔을 때 요리사는 손님을 모른다. 그런데 손님이 주문을 하면 알 수 있는 이유는 손님이 주문을 했다는 알림을 받을 수 있기 때문이다. 이것이 바로 Publish / Subscribe 패턴이다.
- Pub/Sub 패턴은 모든 구독자를 순회한 다면 그들이 보낸 payload와 함께 콜백을 호출한다. 이렇게 함으로써 우아하고 반응적인 흐름을 만들 수 있다.

```js
export default class PubSub {
  constructor() {
    this.events = {}
  }
}
```

- 이벤트를 저장할 events 객체를 생성한다.

```js
  subscribe(event, callback) {
    let self = this
    if (!self.events.hasOwnProperty(event)) {
      self.events[event] = []
    }

    return self.events[event].push(callback)
  }
```

- subscribe 메서드는 이벤트를 구독하는 메서드이다. 이벤트가 없다면 빈 배열을 생성하고, 이벤트가 있다면 해당 이벤트에 콜백을 추가한다.

```js
  publish(event, data = {}) {
    let self = this
    if (!self.events.hasOwnProperty(event)) {
      return []
    }

    return self.events[event].map(callback => callback(data))
  }
```

- publish 메서드는 이벤트를 발생시키는 메서드이다. 이벤트가 없다면 빈 배열을 반환하고, 이벤트가 있다면 해당 이벤트에 콜백을 실행한다.

<br>

### Store

- Store는 애플리케이션의 상태를 저장하고, 상태를 변경하는 방법을 제공한다.

```js
export default class Store {
  constructor(params) {
    let self = this
    selt.action = {}
    self.mutations = {}
    self.state = {}
    self.status = "resting"
    self.events = new PubSub()

    if (params.hasOwnProperty("actions")) {
      self.actions = params.actions
    }

    if (params.hasOwnProperty("mutations")) {
      self.mutations = params.mutations
    }
  }
}
```

- Store는 action, mutation, state, status, events를 가지고 있다.

<br>

### [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 란 무엇인가

- Proxy는 ES6에서 추가된 기능으로, 객체의 기본 동작을 재정의할 수 있게 해준다.
- Proxy는 2개의 인자를 받는데, 첫 번째 인자는 target 객체이고, 두 번째 인자는 handler 객체이다. handler 객체는 target 객체의 기본 동작을 재정의할 수 있는 메서드를 가지고 있다.

```js
const target = {
  name: "Lee",
  age: 20,
}

const handler = {
  get(target, prop) {
    console.log(`Accessed property : ${[prop]}`)
    return targer[prop]
  },
}

const myProxy = new Proxy(target, handler)
console.log(myProxy.name)
// Accessed property : Lee
// Lee
```

- 우리는 이 Proxy를 이용해서, store객체가 변경사항을 추적할 수 있도록 할 것이다.
- Proxy는 state 객체를 대신해서 특정한 역할을 수행할 것이다. get trap을 넣어서, 매번 state 객체에 데이터가 요청될 때마다 이것을 모니터링 할 것이다.
- 마찬가지로 set trap을 넣어서, state 객체에 데이터가 변경될 때마다 이것을 모니터링 할 것이다.

```js
self.state = new Proxy(params.state || {}, {
  set: function (state, key, value) {
    state[key] = value

    console.log(`stateChange: ${key}: ${value}`)

    self.events.publish("stateChange", self.state)

    if (self.status !== "mutation") {
      console.warn(`You should use a mutation to set ${key}`)
    }

    self.status = "resting"

    return true
  },
})
```

- 이 set이 의미하는 것은 `state.name = "Foo"`와 같은 일이 일어날 때마다, 이 trap이 이런 행위를 캐치할 수 있고, 이런 동작과 함께 무언가를 실행할 수 있게 해준다는 것이다.
- 우리의 코드의 경우에는 state를 변경시키고 그것을 로깅하고 있다. 그리고 우리가 만든 PubSub 객체를 이용해서, stateChange 이벤트를 발생시키고 있다. 아마 이벤트를 구독하는 모든 구독자들이 이 stateChange 이벤트를 받아서, 그것을 처리할 것이다.
- 그 다음으로 status를 확인하는데, 만약 status가 mutation이 아니라면, 우리는 이것을 경고하고 있다. 만약 status가 mutation이 아니라면, state가 수동으로 업데이트 되고 있는 중일 것이다. 그래서 우리는 이것을 경고하고 있다.

<br>

### Dispatch and commit

- dispatch와 commit은 store 객체의 메서드이다. dispatch는 action을 실행시키는 메서드이고, commit은 mutation을 실행시키는 메서드이다.

```js
  dispatch(actionKey, payload) {
    let self = this

    if (typeof self.actions[actionKey] !== "function") {
      console.error(`Action "${actionKey} doesn't exist`)
      return false
    }

    console.groupCollapsed(`ACTION: ${actionKey}`)

    self.status = "action"

    self.actions[actionKey](self, payload)

    console.groupEnd()

    return true
  }
```

- dispatch는 actionKey와 payload를 인자로 받는다. 만약 actionKey에 해당하는 action이 없다면, 에러를 발생시키고 false를 반환한다. 그렇지 않다면, action을 실행시키는 동시에 로그를 출력하고, status를 action으로 변경한다.

```js
  commit(mutationKey, payload) {
    let self = this

    if (typeof self.mutations[mutationKey] !== "function") {
      console.log(`Mutation "${mutationKey}" doesn't exist`)
      return false
    }

    self.status = "mutation"

    let newState = self.mutations[mutationKey](self.state, payload)

    self.state = Object.assign(self.state, newState)

    return true
  }
```

- commit은 mutationKey와 payload를 인자로 받는다. 만약 mutationKey에 해당하는 mutation이 없다면, 에러를 발생시키고 false를 반환한다. 그렇지 않다면 status를 mutation으로 변경한다. 그리고 mutation이 반환하는 새로운 state를 기존의 state와 합쳐서 새로운 state를 만든다.

<br>

### Component 만들기

- 이제 우리는 store를 만들었고, store를 이용해서 state를 관리할 수 있게 되었다. 이제 우리는 이 state를 화면에 렌더링할 수 있는 컴포넌트를 만들어야 한다.

```js
class Component {
  constructor(props = {}) {
    let self = this

    self.render = self.render || function () {}

    if (props.store instanceof Store) {
      props.store.events.subscribe("stateChange", () => self.render())
    }

    if (props.hasOwnProperty("element")) {
      self.element = props.element
    }
  }
}
```

- Component는 store를 구독하고 있다. 그리고 store의 state가 변경되면, render 메서드를 실행시킨다. 그리고 render 메서드는 각각의 컴포넌트에서 정의할 것이다.

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
