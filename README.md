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
