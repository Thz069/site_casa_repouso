// src/contexts/AuthContext.js
/**
 * @fileoverview Define o contexto de autenticação para a aplicação.
 * Este módulo provê o AuthProvider e o hook useAuth para gerenciar
 * o estado de autenticação do usuário, incluindo login, logout, e
 * persistência do estado de autenticação usando localStorage.
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Hook para navegação programática
import { loginUser as apiLogin } from '../services/api';

/**
 * @typedef {object} User Representa os dados do usuário autenticado.
 * @property {string} id - O identificador único do usuário.
 * @property {string} name - O nome do usuário.
 * @property {string} token - O token de autenticação JWT do usuário.
 * @property {string} [email] - O email do usuário (opcional, dependendo da API).
 */

/**
 * @typedef {object} AuthContextValue Define a forma do valor fornecido pelo AuthContext.
 * @property {User|null} user - O objeto do usuário autenticado ou null se não estiver logado.
 * @property {boolean} isAuthenticated - Verdadeiro se o usuário estiver autenticado, falso caso contrário.
 * @property {function(string, string): Promise<boolean>} login - Função para realizar o login do usuário,
 * recebendo nome de usuário e senha, e retornando uma promessa que resolve para true em caso de sucesso.
 * @property {function(): void} logout - Função para realizar o logout do usuário.
 * @property {boolean} isLoadingAuth - Verdadeiro se uma operação de autenticação (login, carregamento inicial)
 * estiver em progresso. É o nome preferido para indicar o estado de carregamento da autenticação.
 * @property {string|null} authError - Mensagem de erro relacionada à autenticação, ou null se não houver erro.
 * @property {boolean} loading - @deprecated Usar `isLoadingAuth` para maior clareza. Alias para `isLoadingAuth`.
 */

/**
 * Contexto React para o estado de autenticação.
 * Consumidores deste contexto receberão um objeto do tipo AuthContextValue.
 * @type {React.Context<AuthContextValue|null>}
 */
const AuthContext = createContext(null);

/**
 * Provedor do contexto de autenticação.
 * Envolve a aplicação ou partes dela para fornecer acesso ao estado de autenticação
 * e funções relacionadas a todos os componentes descendentes.
 * @param {object} props - As props do componente.
 * @param {React.ReactNode} props.children - Os componentes filhos que terão acesso ao contexto.
 * @returns {JSX.Element} O componente provedor que disponibiliza o AuthContext.
 */
export const AuthProvider = ({ children }) => {
  /** @type {[User|null, function(User|null): void]} Estado que armazena os dados do usuário autenticado. */
  const [user, setUser] = useState(null);
  /** @type {[boolean, function(boolean): void]} Estado que indica se o processo de autenticação (login ou carregamento inicial) está ativo. */
  const [loading, setLoading] = useState(true); // `loading` é o estado original, `isLoadingAuth` é o alias exposto.
  /** @type {[string|null, function(string|null): void]} Estado para armazenar mensagens de erro de autenticação. */
  const [error, setError] = useState(null);

  const navigate = useNavigate(); // Hook do react-router-dom para navegação programática.

  /**
   * Efeito colateral executado uma vez após a montagem inicial do AuthProvider.
   * Tenta carregar o estado de autenticação do usuário a partir do localStorage
   * para manter o usuário logado entre sessões do navegador.
   */
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUserName = localStorage.getItem('userName');
    const storedUserId = localStorage.getItem('userId');

    if (storedToken && storedUserName && storedUserId) {
      // Reconstrói o objeto 'user' com os dados armazenados.
      setUser({ id: storedUserId, name: storedUserName, token: storedToken });
    }
    setLoading(false); // Finaliza o estado de carregamento inicial.
  }, []); // O array de dependências vazio garante que este efeito execute apenas uma vez.

  /**
   * Tenta autenticar o usuário chamando a API de login.
   * Se bem-sucedido, atualiza o estado `user` e armazena as informações
   * de autenticação no localStorage.
   * @async
   * @param {string} username - O nome de usuário fornecido.
   * @param {string} password - A senha fornecida.
   * @returns {Promise<boolean>} Uma promessa que resolve para `true` se o login for bem-sucedido,
   * ou `false` caso contrário.
   */
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiLogin({ username, password }); // Chama a função de login da API.
      if (response.success && response.user && response.token) {
        const userData = { ...response.user, token: response.token }; // Combina o token com os dados do usuário.
        setUser(userData); // Atualiza o estado do usuário.
        // Armazena informações no localStorage para persistência da sessão.
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userName', response.user.name);
        localStorage.setItem('userId', response.user.id);
        // O redirecionamento pode ser feito aqui ou no componente que chamou o login.
        // Ex: navigate('/dashboard');
      } else {
        // Lança um erro se a resposta da API não for como esperado.
        throw new Error(response.message || 'Resposta de login inválida da API.');
      }
      setLoading(false);
      return true; // Login bem-sucedido.
    } catch (err) {
      setError(err.message || 'Ocorreu um erro ao tentar fazer login.');
      setUser(null); // Limpa o usuário em caso de erro.
      // Remove informações do localStorage em caso de falha.
      localStorage.removeItem('authToken');
      localStorage.removeItem('userName');
      localStorage.removeItem('userId');
      setLoading(false);
      return false; // Login falhou.
    }
  };

  /**
   * Realiza o logout do usuário.
   * Limpa o estado do usuário, remove as informações de autenticação do localStorage
   * e redireciona o usuário para a página de login.
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    // console.log("Utilizador deslogado"); // Removido
    navigate('/login'); // Redireciona para a página de login.
  };

  /**
   * Valor do contexto a ser fornecido aos componentes consumidores.
   * @type {AuthContextValue}
   */
  const value = {
    user,
    isAuthenticated: !!user, // Converte 'user' para booleano para fácil verificação.
    login,
    logout,
    isLoadingAuth: loading, // Expõe 'loading' como 'isLoadingAuth' para maior clareza.
    authError: error,
    loading, // Mantido por compatibilidade ou se ainda usado, mas marcado como deprecated.
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personalizado para consumir o AuthContext.
 * Fornece uma maneira fácil para os componentes acessarem o estado de autenticação.
 * Lança um erro se não for usado dentro de um `AuthProvider`.
 * @returns {AuthContextValue} O valor atual do AuthContext.
 * @throws {Error} Se o hook for usado fora de um `AuthProvider`.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};