// src/pages/PatientManagementPage.js
/**
 * @fileoverview Componente de página para o gerenciamento completo de pacientes.
 * Permite listar, buscar, cadastrar, editar e excluir pacientes. Também coordena
 * a exibição de modais para detalhes do paciente (incluindo último prontuário)
 * e para a lista de todos os prontuários de um paciente específico.
 * Adicionalmente, permite a navegação para a página de criação de novo prontuário.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  fetchPatients,
  fetchLastPatientRecord,
  fetchAllPatientRecords,
  deletePatient
} from '../services/api';
import PatientForm from '../components/PatientForm';
import PatientList from '../components/PatientList';
import PatientDetailModal from '../components/PatientDetailModal';
import AllPatientRecordsModal from '../components/AllPatientRecordsModal';
import './PatientManagementPage.css';

/**
 * Componente PatientManagementPage.
 * Orquestra as funcionalidades de gerenciamento de pacientes, incluindo
 * listagem, busca, adição, edição, exclusão e visualização de detalhes
 * e prontuários através de modais e navegação.
 * @returns {JSX.Element} O elemento JSX da página de gerenciamento de pacientes.
 */
const PatientManagementPage = () => {
  /**
   * Hook para acessar o contexto de autenticação, fornecendo dados do usuário e token.
   * @type {{user: import('../contexts/AuthContext').User|null}}
   */
  const { user } = useAuth();
  /** Hook do react-router-dom para navegação programática. */
  const navigate = useNavigate();

  /** @type {[Array<object>, function(Array<object>): void]} Estado para a lista completa de pacientes. */
  const [patients, setPatients] = useState([]);
  /** @type {[boolean, function(boolean): void]} Estado para indicar se a lista de pacientes está sendo carregada. */
  const [isLoading, setIsLoading] = useState(false);
  /** @type {[string|null, function(string|null): void]} Estado para armazenar mensagens de erro relacionadas ao carregamento de pacientes. */
  const [error, setError] = useState(null);

  /** @type {[boolean, function(boolean): void]} Estado para controlar a visibilidade do formulário de cadastro/edição de paciente. */
  const [showForm, setShowForm] = useState(false);
  /** @type {[object|null, function(object|null): void]} Estado para armazenar os dados do paciente atualmente em edição. Se null, o formulário opera em modo de novo cadastro. */
  const [editingPatient, setEditingPatient] = useState(null);

  /** @type {[boolean, function(boolean): void]} Estado para controlar a visibilidade do modal de detalhes do paciente. */
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  /** @type {[object|null, function(object|null): void]} Estado para armazenar os dados do paciente selecionado para visualização no modal de detalhes. */
  const [selectedPatientForDetailModal, setSelectedPatientForDetailModal] = useState(null);
  /** @type {[object|null, function(object|null): void]} Estado para armazenar o último prontuário do paciente selecionado. */
  const [lastRecord, setLastRecord] = useState(null);
  /** @type {[boolean, function(boolean): void]} Estado para indicar se o último prontuário está sendo carregado. */
  const [isLoadingLastRecord, setIsLoadingLastRecord] = useState(false);

  /** @type {[boolean, function(boolean): void]} Estado para controlar a visibilidade do modal de todos os prontuários de um paciente. */
  const [isAllRecordsModalOpen, setIsAllRecordsModalOpen] = useState(false);
  /** @type {[Array<object>, function(Array<object>): void]} Estado para armazenar a lista de todos os prontuários do paciente selecionado. */
  const [allRecordsForSelectedPatient, setAllRecordsForSelectedPatient] = useState([]);
  /** @type {[boolean, function(boolean): void]} Estado para indicar se todos os prontuários de um paciente estão sendo carregados. */
  const [isLoadingAllRecords, setIsLoadingAllRecords] = useState(false);
  /** @type {[string, function(string): void]} Estado para armazenar o nome do paciente a ser exibido no título do modal de todos os prontuários. */
  const [patientNameForAllRecordsModal, setPatientNameForAllRecordsModal] = useState('');

  /** @type {[string, function(string): void]} Estado para o termo de busca usado para filtrar pacientes por nome. */
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Função assíncrona para carregar a lista de pacientes do backend.
   * Utiliza `useCallback` para memoização, otimizando performance ao evitar
   * recriações desnecessárias da função se suas dependências não mudarem.
   * Atualiza os estados `isLoading`, `error`, e `patients`.
   */
  const loadPatients = useCallback(async () => {
    if (!user?.token) return; // Requer autenticação (token) para prosseguir.
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchPatients(user.token);
      setPatients(data);
    } catch (err) {
      setError(err.message || 'Falha ao carregar pacientes.');
      // Em um ambiente de produção, erros seriam logados em um sistema de monitoramento.
    } finally {
      setIsLoading(false);
    }
  }, [user?.token]); // A função é recriada se user.token mudar.

  /**
   * Efeito para executar `loadPatients` quando o componente é montado pela primeira vez
   * ou quando a referência da função `loadPatients` (e, por consequência, suas dependências) mudar.
   */
  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  /**
   * Manipulador de callback executado após o formulário de paciente (`PatientForm`)
   * ser submetido com sucesso (seja para criação ou edição).
   * Recarrega a lista de pacientes, esconde o formulário e limpa o estado de edição.
   */
  const handleFormSuccess = () => {
    loadPatients();
    setShowForm(false);
    setEditingPatient(null);
  };

  /**
   * Abre o modal de detalhes para um paciente específico e inicia a busca do seu último prontuário.
   * @async
   * @param {string} patientId - O ID do paciente cujos detalhes serão visualizados.
   */
  const handleOpenPatientDetails = async (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient || !user?.token) return; // Verifica se o paciente existe e se há token.

    setSelectedPatientForDetailModal(patient);
    setIsDetailModalOpen(true);
    setIsLoadingLastRecord(true);
    setLastRecord(null); // Limpa dados de prontuário anteriores.

    try {
      const record = await fetchLastPatientRecord(patientId, user.token);
      setLastRecord(record);
    } catch (err) {
      // Em produção, este erro seria logado.
      // Define lastRecord como null para indicar que não foi possível carregar.
      setLastRecord(null);
    } finally {
      setIsLoadingLastRecord(false);
    }
  };

  /**
   * Fecha o modal de detalhes do paciente, limpando os estados relacionados.
   */
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedPatientForDetailModal(null);
    setLastRecord(null);
  };

  /**
   * Abre o modal que lista todos os prontuários de um paciente específico.
   * @async
   * @param {string} patientId - O ID do paciente cujos prontuários serão listados.
   */
  const handleOpenAllRecordsModal = async (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient || !user?.token) return;

    setPatientNameForAllRecordsModal(patient.nomeCompleto);
    setIsAllRecordsModalOpen(true);
    setIsLoadingAllRecords(true);
    setAllRecordsForSelectedPatient([]); // Limpa dados anteriores.

    try {
      const records = await fetchAllPatientRecords(patientId, user.token);
      setAllRecordsForSelectedPatient(records);
    } catch (err) {
      // Em produção, este erro seria logado.
      setAllRecordsForSelectedPatient([]); // Garante que a lista esteja vazia em caso de erro.
    } finally {
      setIsLoadingAllRecords(false);
    }
  };

  /**
   * Fecha o modal de listagem de todos os prontuários, limpando os estados relacionados.
   */
  const handleCloseAllRecordsModal = () => {
    setIsAllRecordsModalOpen(false);
    setAllRecordsForSelectedPatient([]);
    setPatientNameForAllRecordsModal('');
  };

  /**
   * Prepara o formulário para editar os dados de um paciente existente.
   * Define o paciente para edição, exibe o formulário e rola a página para o topo
   * para melhor experiência do usuário.
   * @param {string} patientId - O ID do paciente a ser editado.
   */
  const handleEditPatient = (patientId) => {
    const patientToEdit = patients.find(p => p.id === patientId);
    if (patientToEdit) {
      setEditingPatient(patientToEdit);
      setShowForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * Manipulador para excluir um paciente após confirmação do usuário.
   * Chama a API para excluir o paciente e, em caso de sucesso, recarrega a lista de pacientes.
   * @async
   * @param {string} patientId - O ID do paciente a ser excluído.
   */
  const handleDeletePatient = async (patientId) => {
    const patientToDelete = patients.find(p => p.id === patientId);
    if (!patientToDelete) {
        alert("Paciente não encontrado para exclusão."); // Feedback para o usuário.
        return;
    }
    
    // Utiliza a confirmação nativa do navegador. Pode ser substituída por um modal customizado.
    if (window.confirm(`Tem certeza de que deseja excluir o paciente ${patientToDelete.nomeCompleto}? Esta ação não pode ser desfeita e excluirá também todos os seus prontuários.`)) {
      if (!user?.token) {
        alert("Erro de autenticação. Por favor, faça login novamente.");
        return;
      }
      try {
        const response = await deletePatient(patientId, user.token);
        alert(response.detail || response.message || `Paciente ${patientToDelete.nomeCompleto} excluído com sucesso.`);
        loadPatients(); // Recarrega a lista para refletir a exclusão.
      } catch (err) {
        // Em produção, este erro seria logado.
        alert(err.message || "Falha ao excluir paciente.");
      }
    }
  };

  /**
   * Alterna a visibilidade do formulário de cadastro/edição de paciente.
   * Se o formulário estiver sendo fechado enquanto em modo de edição, cancela a edição.
   */
  const handleToggleForm = () => {
    if (showForm && editingPatient) {
      setEditingPatient(null); // Cancela o modo de edição.
    }
    setShowForm(prevShowForm => !prevShowForm);
  };

  /**
   * Navega para a página de criação de um novo prontuário para o paciente especificado.
   * @param {string} patientId - O ID do paciente para o qual o novo prontuário será criado.
   */
  const handleNavigateToAddNewRecord = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      navigate(`/paciente/${patient.id}/novo-prontuario`);
    } else {
      alert("Paciente não encontrado."); // Feedback para o usuário.
    }
  };

  /**
   * Lista de pacientes filtrada com base no `searchTerm`.
   * A filtragem é case-insensitive e verifica se o nome completo do paciente inclui o termo de busca.
   * @type {Array<object>}
   */
  const filteredPatients = patients.filter(patient =>
    patient.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="patient-management-page">
      <h2>Gerenciamento de Pacientes</h2>

      <button
        onClick={handleToggleForm}
        className="toggle-form-button"
      >
        {showForm ? (editingPatient ? 'Cancelar Edição' : 'Ocultar Formulário de Cadastro') : 'Cadastrar Novo Paciente'}
      </button>

      {showForm && (
        <PatientForm
          // A 'key' é importante para forçar a remontagem do PatientForm ao alternar
          // entre "novo cadastro" e "edição", ou ao editar pacientes diferentes,
          // garantindo que o estado interno do formulário seja reiniciado corretamente.
          key={editingPatient ? editingPatient.id : 'new-patient-form'}
          onFormSubmitSuccess={handleFormSuccess}
          initialData={editingPatient}
        />
      )}

      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar paciente por nome..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <PatientList
        patients={filteredPatients}
        isLoading={isLoading}
        error={error}
        onSelectPatient={handleOpenPatientDetails}
        onEditPatient={handleEditPatient}
        onDeletePatient={handleDeletePatient}
        onViewRecords={handleOpenAllRecordsModal}
        onAddNewRecord={handleNavigateToAddNewRecord}
      />

      {/* Modal para exibir detalhes de um paciente e seu último prontuário. */}
      {selectedPatientForDetailModal && (
        <PatientDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          patient={selectedPatientForDetailModal}
          lastRecord={lastRecord}
          isLoadingRecord={isLoadingLastRecord}
          // A prop onOpenAllRecords foi movida para PatientList,
          // pois o PatientDetailModal foi simplificado para ter apenas o botão "Voltar".
        />
      )}

      {/* Modal para exibir todos os prontuários de um paciente. */}
      <AllPatientRecordsModal
        isOpen={isAllRecordsModalOpen}
        onClose={handleCloseAllRecordsModal}
        patientName={patientNameForAllRecordsModal}
        records={allRecordsForSelectedPatient}
        isLoading={isLoadingAllRecords}
      />
    </div>
  );
};

export default PatientManagementPage;
