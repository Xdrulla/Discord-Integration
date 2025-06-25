import { useEffect, useState } from "react";
import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useAuth } from "../../context/useAuth";
import { db } from "../../config/firebaseConfig";
import { doc, getDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";

const UserProfile = () => {
  const [displayName, setDisplayName] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDisplayName = async () => {
      if (!user?.uid) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) return;

        const { discordId } = userSnap.data();
        if (!discordId) return;

        const registrosRef = collection(db, "registros");
        const q = query(
          registrosRef,
          where("discordId", "==", discordId),
          orderBy("data", "desc")
        );
        const registrosSnap = await getDocs(q);

        if (!registrosSnap.empty) {
          const registro = registrosSnap.docs[0].data();
          if (registro?.usuario) {
            setDisplayName(registro.usuario);
            return;
          }
        }
      } catch (error) {
        console.error("Erro ao buscar nome do usuário:", error);
      }

      setDisplayName(user?.email.split("@")[0] || "Usuário");
    };

    fetchDisplayName();
  }, [user]);

  return (
    <div className="user-profile compact">
      <span className="user-name">{displayName}</span>
      <Avatar icon={<UserOutlined />} className="user-avatar" />
    </div>
  );
};

export default UserProfile;
