// src/components/PatientList.js
/**
 * @fileoverview Componente para exibir uma lista de pacientes em formato de tabela.
 * Inclui funcionalidades para calcular a idade, formatar datas e apresentar ações
 * como ver detalhes, editar, excluir, ver prontuários e adicionar novo prontuário.
 */

import React from 'react';
import './PatientList.css';

/**
 * Calcula a idade a partir de uma string de data de nascimento.
 * @param {string | null | undefined} dateString - A data de nascimento no formato 'YYYY-MM-DD' ou
 * compatível com `new Date()`.
 * @returns {number | string} A idade calculada em anos. Retorna 'N/A' se a data não for fornecida,
 * 'Inválida' se a data fornecida não puder ser convertida para uma data válida ou for uma data
 * futura ou muito antiga (anterior a 1900), ou 'Erro' em caso de exceções inesperadas.
 */
const calculateAge = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const birthDate = new Date(dateString);
    // Garante que a data é válida e dentro de um intervalo razoável.
    if (isNaN(birthDate.getTime()) || birthDate.getFullYear() < 1900) {
      return 'Inválida';
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    // Retorna 'Inválida' se a idade calculada for negativa (data de nascimento no futuro).
    return age >= 0 ? age : 'Inválida';
  } catch (e) {
    // Em um ambiente de produção, este erro seria logado em um serviço de monitoramento.
    return 'Erro';
  }
};

/**
 * Formata uma string de data para o padrão brasileiro (dd/mm/aaaa).
 * @param {string | null | undefined} dateString - A string da data a ser formatada.
 * @returns {string} A data formatada no padrão dd/mm/aaaa. Retorna 'N/A' se a data não for fornecida,
 * 'Inválida' se a string de data não puder ser convertida para uma data válida, ou 'Erro'
 * em caso de exceções inesperadas.
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) { // Verifica se a conversão resultou em uma data válida.
      return 'Inválida';
    }
    // timeZone: 'UTC' é importante para consistência se as datas são armazenadas como YYYY-MM-DD
    // e podem ser interpretadas incorretamente com base no fuso horário do navegador.
    return dateObj.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  } catch (e) {
    // Em um ambiente de produção, este erro seria logado.
    return 'Erro';
  }
};

/**
 * Componente funcional PatientList.
 * Renderiza uma tabela com a lista de pacientes e botões de ação para cada um.
 *
 * @param {object} props - Propriedades do componente.
 * @param {Array<object>} props.patients - Array de objetos de paciente. Espera-se que cada objeto
 * contenha pelo menos `id`, `nomeCompleto`, `dataNascimento`, `telefonePrincipal`,
 * e opcionalmente `data_proxima_consulta`.
 * @param {boolean} props.isLoading - Indica se os dados dos pacientes estão em processo de carregamento.
 * @param {string|null} props.error - Mensagem de erro a ser exibida se o carregamento falhar.
 * @param {function(string): void} props.onSelectPatient - Callback executado ao clicar no botão "Detalhes" de um paciente, passando o ID do paciente.
 * @param {function(string): void} props.onEditPatient - Callback executado ao clicar no botão "Editar Paciente", passando o ID do paciente.
 * @param {function(string): void} props.onDeletePatient - Callback executado ao clicar no botão "Excluir Paciente", passando o ID do paciente.
 * @param {function(string): void} props.onViewRecords - Callback executado ao clicar no botão "Prontuários", passando o ID do paciente.
 * @param {function(string): void} props.onAddNewRecord - Callback executado ao clicar no botão "Novo Prontuário", passando o ID do paciente.
 * @returns {JSX.Element} O elemento JSX que representa a lista de pacientes.
 */
const PatientList = ({
  patients,
  isLoading,
  error,
  onSelectPatient,
  onEditPatient,
  onDeletePatient,
  onViewRecords,
  onAddNewRecord
}) => {
  if (isLoading) {
    return <p className="list-message">Carregando pacientes...</p>;
  }

  if (error) {
    return <p className="list-message error">Erro ao carregar pacientes: {error}</p>;
  }

  if (!patients || patients.length === 0) {
    return <p className="list-message">Nenhum paciente cadastrado.</p>;
  }

  return (
    <div className="patient-list-container">
      <h3>Pacientes Cadastrados</h3>
      <table className="patient-table">
        <thead>
          <tr>
            <th>Nome Completo</th>
            <th>Idade</th>
            <th>Telefone</th>
            <th>Próxima Consulta</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {patients.map(patient => (
            <tr key={patient.id}>
              <td>{patient.nomeCompleto || 'N/A'}</td>
              <td>{calculateAge(patient.dataNascimento)}</td>
              <td>{patient.telefonePrincipal || 'N/A'}</td>
              <td>
                {/* Exibe a data da próxima consulta do paciente, se disponível. */}
                {formatDate(patient.data_proxima_consulta) || 'N/A'}
              </td>
              <td className="actions-cell">
                <button
                  onClick={() => onSelectPatient(patient.id)}
                  className="action-button view-details"
                  title="Ver Detalhes do Paciente"
                >
                  Detalhes
                </button>
                <button
                  onClick={() => onEditPatient(patient.id)}
                  className="action-button edit-patient"
                  title="Editar Paciente"
                >
                  Editar
                </button>
                <button
                  onClick={() => onViewRecords(patient.id)}
                  className="action-button view-all-records-list"
                  title="Ver Prontuários"
                >
                  Prontuários
                </button>
                <button
                  onClick={() => onAddNewRecord(patient.id)}
                  className="action-button add-new-record-list"
                  title="Adicionar Novo Prontuário"
                >
                  Novo Prontuário
                </button>
                <button
                  onClick={() => onDeletePatient(patient.id)}
                  className="action-button delete-patient"
                  title="Excluir Paciente"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientList;