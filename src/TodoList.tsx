import React, { useState, useEffect } from "react";

type UserType = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  number: string;
};

const TodoList: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [formState, setFormState] = useState<Omit<UserType, 'id'>>({
    first_name: "",
    last_name: "",
    email: "",
    number: "",
  });
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:3000/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleAddOrUpdateUser = async () => {
    const { first_name, last_name, email, number } = formState;
    if (first_name.trim() && last_name.trim() && email.trim() && number.trim()) {
      try {
        if (editingUserId === null) {
          const response = await fetch("http://localhost:3000/users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formState),
          });

          const addedUser = await response.json();
          setUsers([...users, addedUser]);
        } else {
          await fetch(`http://localhost:3000/users/${editingUserId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formState),
          });

          const updatedUsers = users.map(user =>
            user.id === editingUserId ? { ...user, ...formState, id: editingUserId } : user
          );
          setUsers(updatedUsers);
          setEditingUserId(null);
        }

        setFormState({
          first_name: "",
          last_name: "",
          email: "",
          number: "",
        });
      } catch (error) {
        console.error("Error adding/updating user:", error);
      }
    }
  };

  const handleEditUser = (user: UserType) => {
    setEditingUserId(user.id);
    setFormState({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      number: user.number,
    });
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await fetch(`http://localhost:3000/users/${id}`, {
        method: "DELETE",
      });

      const updatedUsers = users.filter((user) => user.id !== id);
      setUsers(updatedUsers);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <div>
      <input
        type="text"
        name="first_name"
        value={formState.first_name}
        onChange={handleInputChange}
        placeholder="First Name"
      />
      <input
        type="text"
        name="last_name"
        value={formState.last_name}
        onChange={handleInputChange}
        placeholder="Last Name"
      />
      <input
        type="text"
        name="email"
        value={formState.email}
        onChange={handleInputChange}
        placeholder="Email"
      />
      <input
        type="text"
        name="number"
        value={formState.number}
        onChange={handleInputChange}
        placeholder="Phone Number"
      />
      <button onClick={handleAddOrUpdateUser}>
        {editingUserId === null ? "Add User" : "Update User"}
      </button>

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.first_name} {user.last_name} ({user.email}) - {user.number}
            <button onClick={() => handleEditUser(user)}>Edit</button>
            <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
