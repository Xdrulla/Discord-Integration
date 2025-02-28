import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { Input, Button, Card, Typography, message } from "antd";

const { Title } = Typography;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      message.success("Login realizado com sucesso!");
      navigate("/dashboard");
    } catch (error) {
      message.error("Erro ao fazer login. Verifique suas credenciais.", error);
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <Title level={2}>Login</Title>
        <Input
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input.Password
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="primary" onClick={handleLogin} loading={loading}>
          Entrar
        </Button>
      </Card>
    </div>
  );
};

export default Login;
