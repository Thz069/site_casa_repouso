// src/services/api.js
/**
 * @fileoverview Módulo de serviço para interagir com a API do backend.
 * Contém funções para realizar operações CRUD para pacientes e prontuários,
 * além de funções de autenticação (atualmente simulada).
 */

/**
 * URL base para todas as chamadas à API do backend.
 * @type {string}
 */
const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Função auxiliar para tratar erros de resposta da API.
 * Tenta extrair uma mensagem de erro do corpo JSON da resposta,
 * caso contrário, usa o texto de status da resposta.
 * @async
 * @param {Response} response - O objeto de resposta da API (proveniente da função fetch).
 * @returns {Promise<Error>} Uma promessa que rejeita com um objeto Error contendo a mensagem de erro formatada.
 */
const handleApiError = async (response) => {
  let errorMessage = `Erro na API: ${response.status} ${response.statusText}`;
  try {
    // Tenta parsear o corpo da resposta como JSON para obter uma mensagem de erro mais específica.
    const errorData = await response.json();
    errorMessage = errorData.error || errorData.message || errorMessage;
  } catch (e) {
    // Ignora o erro se o corpo da resposta não for JSON ou estiver vazio.
    // A mensagem de erro original baseada no status será usada.
  }
  return new Error(errorMessage);
};

/**
 * Autentica um usuário no backend.
 * Realiza uma chamada POST para o endpoint de login da API.
 * @async
 * @param {object} credentials - Objeto contendo as credenciais do usuário.
 * @param {string} credentials.username - O nome de usuário.
 * @param {string} credentials.password - A senha do usuário.
 * @returns {Promise<object>} Uma promessa que resolve com os dados da resposta do backend
 * (espera-se que contenha `token` e `user`).
 * @throws {Error} Se a requisição à API falhar ou retornar um status de erro.
 */
export const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nome_usuario: credentials.username,
      senha: credentials.password,
    }),
  });

  if (!response.ok) {
    throw await handleApiError(response);
  }

  return response.json();
};

/**
 * Busca todos os pacientes cadastrados no sistema.
 * Faz uma requisição GET para o endpoint `/patients` da API.
 * @async
 * @param {string} token - O token de autenticação JWT do usuário. (Atualmente não enviado na requisição, mas pode ser necessário se o endpoint for protegido).
 * @returns {Promise<Array<object>>} Uma promessa que resolve com um array de objetos de paciente.
 * @throws {Error} Se a requisição à API falhar.
 */
export const fetchPatients = async (token) => {
  const response = await fetch(`${API_BASE_URL}/patients`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`, // Descomentar e usar se o endpoint for protegido.
    },
  });
  if (!response.ok) throw await handleApiError(response);
  return response.json();
};

/**
 * Cadastra um novo paciente no sistema.
 * Faz uma requisição POST para o endpoint `/patients` da API.
 * @async
 * @param {object} patientData - Objeto contendo os dados do paciente a ser cadastrado.
 * @param {string} token - O token de autenticação JWT do usuário.
 * @returns {Promise<object>} Uma promessa que resolve com o objeto do paciente recém-cadastrado (incluindo o ID gerado pelo backend).
 * @throws {Error} Se a requisição à API falhar.
 */
export const registerPatient = async (patientData, token) => {
  const response = await fetch(`${API_BASE_URL}/patients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(patientData),
  });
  if (!response.ok) throw await handleApiError(response);
  return response.json();
};

/**
 * Busca os dados de um paciente específico pelo seu ID.
 * Faz uma requisição GET para o endpoint `/patients/:id` da API.
 * @async
 * @param {string} patientId - O ID do paciente a ser buscado.
 * @param {string} token - O token de autenticação JWT do usuário.
 * @returns {Promise<object|null>} Uma promessa que resolve com o objeto do paciente, ou null se não encontrado.
 * @throws {Error} Se a requisição à API falhar.
 */
export const fetchPatientById = async (patientId, token) => {
  const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw await handleApiError(response);
  return response.json();
};

/**
 * Atualiza os dados de um paciente existente no sistema.
 * Faz uma requisição PUT para o endpoint `/patients/:id` da API.
 * @async
 * @param {string} patientId - O ID do paciente a ser atualizado.
 * @param {object} patientData - Objeto contendo os campos do paciente a serem atualizados.
 * @param {string} token - O token de autenticação JWT do usuário.
 * @returns {Promise<object>} Uma promessa que resolve com o objeto do paciente atualizado.
 * @throws {Error} Se a requisição à API falhar.
 */
export const updatePatient = async (patientId, patientData, token) => {
  const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(patientData),
  });
  if (!response.ok) throw await handleApiError(response);
  return response.json();
};

/**
 * Exclui um paciente do sistema.
 * Faz uma requisição DELETE para o endpoint `/patients/:id` da API.
 * @async
 * @param {string} patientId - O ID do paciente a ser excluído.
 * @param {string} token - O token de autenticação JWT do usuário.
 * @returns {Promise<object>} Uma promessa que resolve com a resposta do backend (geralmente uma mensagem de sucesso).
 * @throws {Error} Se a requisição à API falhar.
 */
export const deletePatient = async (patientId, token) => {
  const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
    method: 'DELETE',
    headers: {
      // 'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw await handleApiError(response);
  return response.json();
};

/**
 * Busca o último prontuário registrado para um paciente específico.
 * Faz uma requisição GET para o endpoint `/patients/:patientId/records` com parâmetros de query.
 * @async
 * @param {string} patientId - O ID do paciente.
 * @param {string} token - O token de autenticação JWT do usuário.
 * @returns {Promise<object|null>} Uma promessa que resolve com o objeto do último prontuário, ou null se nenhum for encontrado.
 * @throws {Error} Se a requisição à API falhar.
 */
export const fetchLastPatientRecord = async (patientId, token) => {
  const response = await fetch(`${API_BASE_URL}/patients/${patientId}/records?limit=1&sort=desc`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw await handleApiError(response);
  const records = await response.json();
  return records.length > 0 ? records[0] : null;
};

/**
 * Busca todos os prontuários registrados para um paciente específico.
 * Faz uma requisição GET para o endpoint `/patients/:patientId/records` da API.
 * @async
 * @param {string} patientId - O ID do paciente.
 * @param {string} token - O token de autenticação JWT do usuário.
 * @returns {Promise<Array<object>>} Uma promessa que resolve com um array de objetos de prontuário.
 * @throws {Error} Se a requisição à API falhar.
 */
export const fetchAllPatientRecords = async (patientId, token) => {
  const response = await fetch(`${API_BASE_URL}/patients/${patientId}/records`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw await handleApiError(response);
  return response.json();
};

/**
 * Adiciona um novo prontuário para um paciente específico.
 * Faz uma requisição POST para o endpoint `/patients/:patientId/records` da API.
 * @async
 * @param {string} patientId - O ID do paciente ao qual o prontuário será associado.
 * @param {object} recordData - Objeto contendo os dados do prontuário a ser adicionado.
 * @param {string} token - O token de autenticação JWT do usuário.
 * @param {string} attendantId - O ID do atendente que está registrando o prontuário.
 * @returns {Promise<object>} Uma promessa que resolve com o objeto do prontuário recém-adicionado.
 * @throws {Error} Se a requisição à API falhar.
 */
export const addPatientRecord = async (patientId, recordData, token, attendantId) => {
  const payload = { ...recordData, id_atendente_fk: attendantId };
  const response = await fetch(`${API_BASE_URL}/patients/${patientId}/records`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw await handleApiError(response);
  return response.json();
};

/**
 * Busca todos os prontuários de todos os pacientes.
 * Faz uma requisição GET para o endpoint `/geral/todos-prontuarios` da API.
 * Este endpoint no backend deve realizar um JOIN para incluir informações do paciente em cada prontuário.
 * @async
 * @param {string} token - O token de autenticação JWT do usuário.
 * @returns {Promise<Array<object>>} Uma promessa que resolve com um array de objetos de prontuário,
 * cada um potencialmente contendo informações do paciente associado (ex: `patientName`).
 * @throws {Error} Se a requisição à API falhar.
 */
export const fetchAllRecordsAcrossAllPatients = async (token) => {
  const response = await fetch(`${API_BASE_URL}/geral/todos-prontuarios`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`, // Adicionar se o endpoint for protegido.
    },
  });
  if (!response.ok) throw await handleApiError(response);
  return response.json();
};

/**
 * Registra um novo atendente no sistema.
 * @async
 * @param {object} userData - Objeto contendo os dados do novo atendente.
 * @param {string} userData.nome_completo_atendente - O nome completo do atendente.
 * @param {string} userData.nome_usuario - O nome de usuário para login.
 * @param {string} userData.senha - A senha para o novo atendente.
 * @returns {Promise<object>} Uma promessa que resolve com a resposta do backend.
 * @throws {Error} Se a requisição à API falhar.
 */
export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw await handleApiError(response);
  }

  return response.json();
};