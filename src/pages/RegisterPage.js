import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import './RegisterPage.css';

function RegisterPage() {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!nomeCompleto || !nomeUsuario || !senha) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    try {
      await registerUser({
        nome_completo_atendente: nomeCompleto,
        nome_usuario: nomeUsuario,
        senha: senha,
      });
      setSuccess('Cadastro realizado com sucesso! Redirecionando para o login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Erro ao realizar o cadastro.');
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2>Página de Cadastro</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="nomeCompleto">Nome Completo</label>
            <input
              type="text"
              id="nomeCompleto"
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="nomeUsuario">Nome de Usuário</label>
            <input
              type="text"
              id="nomeUsuario"
              value={nomeUsuario}
              onChange={(e) => setNomeUsuario(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="register-button">Cadastrar</button>
        </form>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </div>
    </div>
  );
}

export default RegisterPage;
