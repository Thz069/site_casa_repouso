// src/components/LoginPage.js
/**
 * @fileoverview Componente de página de login para atendentes.
 * Permite que os usuários insiram suas credenciais (nome de usuário e senha)
 * para acessar o sistema. Utiliza o AuthContext para gerenciar o estado de
 * autenticação e realizar a tentativa de login.
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css'; // Arquivo de estilos para a página de login

/**
 * Componente funcional LoginPage.
 * Renderiza um formulário para que o atendente possa realizar o login no sistema.
 * Utiliza o hook `useAuth` para acessar a função de login e os estados
 * de carregamento e erro do contexto de autenticação.
 * @returns {JSX.Element} O JSX para a página de login.
 */
const LoginPage = () => {
  /** @type {[string, function(string): void]} Estado para o nome de usuário inserido no formulário. */
  const [username, setUsername] = useState('');
  /** @type {[string, function(string): void]} Estado para a senha inserida no formulário. */
  const [password, setPassword] = useState('');
  /**
   * Obtém a função de login, o estado de carregamento da autenticação
   * e mensagens de erro do AuthContext.
   * @type {{login: function(string, string): Promise<boolean>, isLoadingAuth: boolean, authError: string|null}}
   */
  const { login, isLoadingAuth, authError } = useAuth();

  /**
   * Manipulador para o evento de submissão do formulário de login.
   * Previne o comportamento padrão do formulário, valida as entradas
   * e chama a função `login` do AuthContext.
   * @param {React.FormEvent<HTMLFormElement>} event - O evento de submissão do formulário.
   */
  const handleSubmit = async (event) => {
    event.preventDefault(); // Previne o comportamento padrão do formulário
    if (!username || !password) {
        alert("Por favor, preencha usuário e senha."); // Alerta simples, poderia ser um estado de erro no formulário.
        return;
    }
    const success = await login(username, password);
    if (success) {
      // Login bem-sucedido.
      // O redirecionamento após o login geralmente é tratado por um componente de
      // nível superior (como App.js ou um componente de layout que observa o
      // estado de autenticação) ou dentro do próprio AuthContext.
    } else {
      // Falha no login.
      // A mensagem de erro específica (authError) já será exibida no formulário.
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login do Atendente</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Usuário:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoadingAuth} // Desabilita o campo durante o carregamento
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Senha:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoadingAuth} // Desabilita o campo durante o carregamento
              required
            />
          </div>
          <button type="submit" className="login-button" disabled={isLoadingAuth}>
            {isLoadingAuth ? 'Entrando...' : 'Entrar'}
          </button>
          {/* Exibe mensagens de erro de autenticação provenientes do AuthContext */}
          {authError && <p className="error-message">{authError}</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;