import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../config/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { Input, Button, Card, Typography, message, Tabs, Form } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { setDoc, doc } from "firebase/firestore";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";

const { Title, Text } = Typography;

const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);

  if (authLoading) {
    return <div>Carregando...</div>;
  }

  if (user) {
    navigate("/dashboard", { replace: true });
  }

  const handleAuth = async (values, isSignup = false) => {
    setLoading(true);
    try {
      if (isSignup) {
        const { email, password, discordId } = values;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email,
          role: "leitor",
          discordId
        })
        message.success("Cadastro realizado com sucesso!");
      } else {
        await signInWithEmailAndPassword(auth, values.email, values.password);
        message.success("Login realizado com sucesso!");
      }
      navigate("/dashboard", { replace: true });
    } catch (error) {
      message.error(`Erro ao autenticar: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <Title level={2} className="auth-title">Bem-vindo</Title>
        <Text type="secondary">Acesse sua conta ou cadastre-se para continuar</Text>

        <Tabs activeKey={activeTab} onChange={setActiveTab} className="auth-tabs">
          <Tabs.TabPane tab="Login" key="login">
            <Form layout="vertical" onFinish={(values) => handleAuth(values, false)}>
              <Form.Item name="email" rules={[{ required: true, message: "Digite seu e-mail" }]}>
                <Input prefix={<MailOutlined />} placeholder="E-mail" />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true, message: "Digite sua senha" }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Senha" />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>Entrar</Button>
            </Form>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Cadastro" key="register">
            <Form layout="vertical" onFinish={(values) => handleAuth(values, true)}>
              <Form.Item name="email" rules={[{ required: true, message: "Digite seu e-mail" }]}>
                <Input prefix={<MailOutlined />} placeholder="E-mail" />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true, message: "Crie uma senha" }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Senha" />
              </Form.Item>
              <Form.Item name="discordId" rules={[{ required: true, message: "Digite seu ID do Discord" }]}>
                <Input placeholder="ID do Discord" />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>Cadastrar</Button>
            </Form>
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default AuthPage;
