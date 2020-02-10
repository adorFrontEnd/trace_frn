// src/reducers/cart-reducer.js

import { ADD_TODO, DELETE_TODO } from '../actions/todo-actions';

const initialState = {
  todos: []
}

export default function (state = initialState, action) {
  switch (action.type) {
    case ADD_TODO: {
      return {
        ...state,
        todos: [...state.todos, action.payload]
      }
    }

    case DELETE_TODO: {
      return {
        ...state,
        todos: state.todos.filter(item => item.todoId !== action.payload.todoId)
      }
    }

    default:
      return state;
  }
}