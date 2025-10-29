// src/pages/AllRecordsListPage.js
/**
 * @fileoverview Componente de página para listar todos os prontuários de todos os pacientes
 * registrados no sistema. Permite a visualização detalhada de cada prontuário.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchAllRecordsAcrossAllPatients } from '../services/api';
import ViewMedicalRecordModal from '../components/ViewMedicalRecordModal';
import './AllRecordsListPage.css';

/**
 * Formata uma string de data para o padrão brasileiro (dd/mm/aaaa) e, opcionalmente, inclui a hora.
 * Utiliza 'UTC' como fuso horário base para a formatação para manter consistência com datas ISO.
 * @param {string | null | undefined} dateString - A string da data a ser formatada.
 * @param {boolean} [includeTime=false] - Se true, inclui a hora (hh:mm) na formatação.
 * @returns {string} A data formatada, 'N/A' se a data de entrada for nula/indefinida,
 * 'Data Inválida' se a string não puder ser convertida em uma data válida, ou 'Erro na Data'
 * para outras exceções de formatação.
 */
const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return 'N/A';
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC'
  };
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  try {
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) { // Verifica se a conversão resultou em uma data válida.
      return 'Data Inválida';
    }
    return dateObj.toLocaleDateString('pt-BR', options);
  } catch (e) {
    // Em um ambiente de produção, este erro também poderia ser logado em um serviço de monitoramento.
    return 'Erro na Data';
  }
};

/**
 * Componente de página que busca e exibe uma lista de todos os prontuários
 * de todos os pacientes. Oferece a funcionalidade de visualizar os detalhes
 * de um prontuário selecionado em um modal.
 * @returns {JSX.Element} O elemento JSX que representa a página de listagem de todos os prontuários.
 */
const AllRecordsListPage = () => {
  /** @type {{user: import('../contexts/AuthContext').User|null}} */
  const { user } = useAuth(); // Hook para acessar o token do usuário para chamadas de API.

  /** @type {[Array<object>, function(Array<object>): void]} Estado para armazenar a lista de todos os prontuários. */
  const [records, setRecords] = useState([]);
  /** @type {[boolean, function(boolean): void]} Estado para indicar se os prontuários estão sendo carregados. */
  const [isLoading, setIsLoading] = useState(false);
  /** @type {[string|null, function(string|null): void]} Estado para armazenar mensagens de erro do carregamento. */
  const [error, setError] = useState(null);

  /** @type {[boolean, function(boolean): void]} Estado para controlar a visibilidade do modal de visualização de prontuário. */
  const [isViewRecordModalOpen, setIsViewRecordModalOpen] = useState(false);
  /** @type {[object|null, function(object|null): void]} Estado para armazenar os dados do prontuário selecionado para visualização. */
  const [selectedRecordForView, setSelectedRecordForView] = useState(null);

  /**
   * Função assíncrona para carregar todos os prontuários do backend.
   * Utiliza `useCallback` para memoização, evitando recriações desnecessárias
   * se as dependências (como `user.token`) não mudarem.
   * Atualiza os estados `isLoading`, `error`, e `records`.
   */
  const loadAllRecords = useCallback(async () => {
    if (!user?.token) {
      // Se não houver token, não prossegue com a chamada à API.
      //setError("Autenticação necessária para carregar prontuários."); // Opcional: definir erro
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAllRecordsAcrossAllPatients(user.token);
      setRecords(data);
    } catch (err) {
      const errorMessage = err.message || 'Falha ao carregar todos os prontuários.';
      setError(errorMessage);
      // Em produção, erros seriam enviados a um sistema de logging.
    } finally {
      setIsLoading(false);
    }
  }, [user?.token]); // A função é recriada se user.token mudar.

  /**
   * Efeito para carregar os prontuários quando o componente é montado
   * ou quando a função `loadAllRecords` (e consequentemente suas dependências) mudar.
   */
  useEffect(() => {
    loadAllRecords();
  }, [loadAllRecords]);

  /**
   * Manipulador para abrir o modal de visualização de um prontuário específico.
   * Define o prontuário selecionado e torna o modal visível.
   * @param {object} record - O objeto do prontuário cujos detalhes serão visualizados.
   */
  const handleOpenViewRecordModal = (record) => {
    setSelectedRecordForView(record);
    setIsViewRecordModalOpen(true);
  };

  /**
   * Manipulador para fechar o modal de visualização de prontuário.
   * Limpa o prontuário selecionado e esconde o modal.
   */
  const handleCloseViewRecordModal = () => {
    setIsViewRecordModalOpen(false);
    setSelectedRecordForView(null);
  };

  if (isLoading) return <div className="page-loading">Carregando todos os prontuários...</div>;
  if (error) return <div className="page-error">Erro ao carregar prontuários: {error}</div>;

  return (
    <div className="all-records-list-page-container">
      <h2>Todos os Prontuários Registrados</h2>

      {/* TODO: Implementar filtros para a lista de prontuários (ex: por data, paciente, atendente). */}
      {/* <div className="filters-container"> ... </div> */}

      {records.length === 0 ? (
        <p className="no-records-message">Nenhum prontuário encontrado no sistema.</p>
      ) : (
        <table className="all-records-table">
          <thead>
            <tr>
              <th>Data Atendimento</th>
              <th>Paciente</th>
              <th>Tipo Atendimento</th>
              <th>Queixa/Assunto Principal</th>
              <th>Atendente</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {records.map(record => (
              // Utiliza record.recordId como chave. Fallback para record.recordid caso haja inconsistência no backend.
              <tr key={record.recordId || record.recordid}>
                <td>{formatDate(record.data_hora_atendimento, true)}</td>
                <td>{record.patientName || record.patientId}</td>
                <td>{record.tipo_atendimento || 'N/A'}</td>
                <td>{record.queixa_sessao || 'N/A'}</td>
                <td>{record.attendantName || record.id_atendente_fk || 'N/A'}</td>
                <td>
                  <button
                    className="action-button view-record-details"
                    onClick={() => handleOpenViewRecordModal(record)}
                    title="Ver detalhes completos deste prontuário"
                  >
                    Ver Detalhes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal para visualizar os detalhes de um prontuário selecionado. */}
      {selectedRecordForView && (
        <ViewMedicalRecordModal
          isOpen={isViewRecordModalOpen}
          onClose={handleCloseViewRecordModal}
          record={selectedRecordForView}
          // Passa o nome do paciente para o modal, que já deve estar no objeto 'record' vindo da API.
          patientName={selectedRecordForView.patientName}
        />
      )}
    </div>
  );
};

export default AllRecordsListPage;