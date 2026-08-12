import React, { useState, useEffect } from 'react';

function App() {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ========== API CALLS ==========
    const API_URL = import.meta.env.VITE_API_URL || '';

    const fetchTodos = async () => {
        try {
            const response = await fetch(`${API_URL}/api/todos`);
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setTodos(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching todos:', err);
        } finally {
            setLoading(false);
        }
    };

    const createTodo = async (title) => {
        try {
            const response = await fetch(`${API_URL}/api/todos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title })
            });
            if (!response.ok) throw new Error('Failed to create');
            const newTodo = await response.json();
            setTodos(prev => [newTodo, ...prev]);
        } catch (err) {
            console.error('Error creating todo:', err);
            setError(err.message);
        }
    };

    const toggleTodo = async (id, completed) => {
        try {
            const response = await fetch(`${API_URL}/api/todos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: !completed })
            });
            if (!response.ok) throw new Error('Failed to update');
            const updated = await response.json();
            setTodos(prev => prev.map(t => t.id === id ? updated : t));
        } catch (err) {
            console.error('Error updating todo:', err);
            setError(err.message);
        }
    };

    const deleteTodo = async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/todos/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete');
            setTodos(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            console.error('Error deleting todo:', err);
            setError(err.message);
        }
    };

    // ========== HANDLERS ==========
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newTodo.trim()) return;
        createTodo(newTodo.trim());
        setNewTodo('');
    };

    // ========== EFFECTS ==========
    useEffect(() => {
        fetchTodos();
    }, []);

    // ========== RENDER ==========
    if (loading) return <div className="loading">Загрузка...</div>;
    if (error) return <div className="error">Ошибка: {error}</div>;

    return (
        <div className="app">
            <h1>📋 Мои Задачи</h1>
            
            <form onSubmit={handleSubmit} className="todo-form">
                <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="Добавить задачу..."
                    className="todo-input"
                />
                <button type="submit" className="todo-button">Добавить</button>
            </form>

            <ul className="todo-list">
                {todos.length === 0 ? (
                    <li className="empty">Нет задач</li>
                ) : (
                    todos.map(todo => (
                        <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                            <span className="todo-title" onClick={() => toggleTodo(todo.id, todo.completed)}>
                                {todo.title}
                            </span>
                            <button className="delete-button" onClick={() => deleteTodo(todo.id)}>
                                ✕
                            </button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}

export default App;