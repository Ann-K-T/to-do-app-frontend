import { useEffect, useState } from "react";
import axios from "axios";

const TodoList = () => {
    const [todos, setTodos] = useState([]);
    const [text, setText] = useState("");
    const [editingTodo, setEditingTodo] = useState(null);

    // Ensure the API URL is defined
    const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000/api/todos";

    useEffect(() => {
        axios.get(API_BASE_URL)
            .then(res => setTodos(res.data))
            .catch(error => console.log("Error fetching todos:", error));
    }, []);

    const addTodo = async () => {
        if (!text.trim() || text.length < 5) {
            alert("Todo must be at least 5 characters long");
            return;
        }
    
        try {
            if (editingTodo) {
                const response = await axios.put(`${API_BASE_URL}/${editingTodo._id}`, 
                    { text }, // ✅ Sending "text" instead of "title"
                    { headers: { 'Content-Type': 'application/json' } }
                );
                setTodos(todos.map(todo => (todo._id === editingTodo._id ? response.data : todo)));
                setEditingTodo(null);
            } else {
                const response = await axios.post(API_BASE_URL, 
                    { text }, // ✅ Sending "text" instead of "title"
                    { headers: { 'Content-Type': 'application/json' } }
                );
                setTodos([...todos, response.data]);
            }
            setText(""); 
        } catch (error) {
            console.log("Error saving todo:", error.response ? error.response.data : error.message);
        }
    };
    
    const editTodo = (todo) => {
        setEditingTodo(todo); 
        setText(todo.text); // ✅ Using "text" instead of "title"
    };

    const deleteTodo = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/${id}`);
            setTodos(todos.filter(todo => todo._id !== id));
        } catch (error) {
            console.log("Error deleting todo:", error);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            addTodo();
        }
    };

    const completeTodo = async (id, currentStatus) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/${id}`, 
                { completed: !currentStatus },
                { headers: { 'Content-Type': 'application/json' } }
            );
    
            setTodos(todos.map(todo => 
                todo._id === id ? { ...todo, completed: response.data.completed } : todo
            ));
        } catch (error) {
            console.log("Error updating todo:", error);
        }
    };

    return (
        <div className="todoListContainer">
            <h1>To-Do List</h1>
            <input 
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                onKeyDown={handleKeyDown} 
            />
            <button className="btn add" onClick={addTodo}>
                {editingTodo ? "Update" : "Add"}
            </button>
            
            <ul>
                {todos.map(todo => (                    
                    <li key={todo._id} className={todo.completed ? "completed" : ""}>
                        <span className="todo-text">{todo.text}</span> 
                        <button className="btn complete" onClick={() => completeTodo(todo._id, todo.completed)}>Complete</button>
                        <button className="btn edit" onClick={() => editTodo(todo)}>Edit</button>
                        <button className="btn delete" onClick={() => deleteTodo(todo._id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TodoList;
