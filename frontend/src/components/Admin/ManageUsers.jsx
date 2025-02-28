import { useEffect, useState } from "react";
import { db } from "../../firebaseConfig"; 
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { Table, Select, message } from "antd";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(userData);
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: newRole });
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
      );
      message.success("Permissão alterada com sucesso!");
    } catch (error) {
      message.error("Erro ao alterar permissão.", error);
    }
  };

  const columns = [
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Permissão",
      dataIndex: "role",
      key: "role",
      render: (role, record) => (
        <Select value={role} onChange={(value) => handleRoleChange(record.id, value)}>
          <Select.Option value="admin">Admin</Select.Option>
          <Select.Option value="leitor">Leitor</Select.Option>
        </Select>
      ),
    },
  ];

  return <Table dataSource={users} columns={columns} rowKey="id" />;
};

export default ManageUsers;
