// src/actions/cart-actions.js

export const ADD_TODO = 'ADD_TODO';
export const DELETE_TODO = 'DELETE_TODO';

let todoId = 1;
export function addTodo(text) {
  return {
    type: ADD_TODO,
    payload:{
      text,
      todoId: todoId++
    }    
  }
}

export function deleteTodo(todoId) {
  return {
    type: DELETE_TODO,
    payload:{     
      todoId
    }    
  }
}
