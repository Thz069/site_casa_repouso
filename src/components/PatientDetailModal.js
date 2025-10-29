// src/components/PatientDetailModal.js
/**
 * @fileoverview Componente modal para exibir detalhes completos de um paciente e seu último prontuário.
 * Apresenta as informações em modo de apenas leitura e inclui um botão para fechar o modal.
 */

import React from 'react';
import './PatientDetailModal.css';

/**
 * Formata uma string de data para o padrão brasileiro (dd/mm/aaaa) e, opcionalmente, inclui a hora.
 * @param {string} dateString - A string da data a ser formatada (espera-se formato ISO ou compatível com new Date()).
 * @param {boolean} [includeTime=false] - Se true, inclui a hora (hh:mm) na formatação.
 * @returns {string} A data formatada, 'N/A' se a data fornecida for nula/indefinida, ou 'Data Inválida'/'Erro na Data' em caso de problemas.
 */
const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return 'N/A';
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC' // Assume que as datas do backend são UTC (ISOString) para consistência.
  };
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  try {
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) { // Verifica se a data é válida
      return 'Data Inválida';
    }
    return dateObj.toLocaleDateString('pt-BR', options);
  } catch (e) {
    // Em caso de erro inesperado na formatação, retorna uma mensagem de erro.
    // Em um ambiente de produção, este erro também poderia ser logado em um serviço de monitoramento.
    return 'Erro na Data';
  }
};

/**
 * Função auxiliar para renderizar um campo de informação com rótulo e valor.
 * Exibe 'N/A' se o valor não for fornecido.
 * @param {string} label - O rótulo descritivo do campo.
 * @param {string|number|null|undefined} value - O valor do campo a ser exibido.
 * @returns {JSX.Element} Um elemento <p> contendo o rótulo e o valor formatado.
 */
const renderField = (label, value) => {
  const displayValue = value || 'N/A'; // Garante que 'N/A' seja exibido para valores nulos ou indefinidos.
  return <p><strong>{label}:</strong> {displayValue}</p>;
};

/**
 * Componente modal para exibir detalhes completos de um paciente e seu último prontuário.
 * O modal é apenas para leitura e contém um botão "Voltar" para fechá-lo.
 * @param {object} props - Propriedades do componente.
 * @param {boolean} props.isOpen - Controla a visibilidade do modal. O componente não renderiza nada se false.
 * @param {function} props.onClose - Função callback para ser executada quando o modal deve ser fechado.
 * @param {object|null} props.patient - Objeto contendo os dados do paciente. Se null, o modal não é renderizado.
 * @param {object|null} props.lastRecord - Objeto contendo os dados do último prontuário do paciente.
 * @param {boolean} props.isLoadingRecord - Indica se os dados do último prontuário estão atualmente sendo carregados.
 * @returns {JSX.Element|null} O componente do modal ou null se não estiver visível ou se os dados do paciente não forem fornecidos.
 */
const PatientDetailModal = ({ isOpen, onClose, patient, lastRecord, isLoadingRecord }) => {
  if (!isOpen || !patient) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}> {/* Permite fechar clicando fora do conteúdo do modal */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* Impede que o clique dentro do modal o feche */}
        <button className="modal-close-button" onClick={onClose} aria-label="Fechar modal">&times;</button>
        <h2>Detalhes do Paciente: {patient.nomeCompleto || 'N/A'}</h2>

        {/* Seção de Dados Pessoais e de Contato */}
        <div className="patient-info-section">
          <h3>Dados Pessoais e Contato</h3>
          {renderField("Nome Completo", patient.nomeCompleto)}
          {renderField("Data de Nascimento", formatDate(patient.dataNascimento))}
          {renderField("Gênero", patient.genero)}
          {/* {renderField("CPF", patient.cpf)} // Campo CPF oculto conforme solicitado anteriormente */}
          {renderField("Telefone Principal", patient.telefonePrincipal)}
          {/* {renderField("Email", patient.email)} // Campo Email oculto conforme solicitado anteriormente */}
          {renderField("Data de Cadastro", formatDate(patient.dataCadastro))}
          {/* {renderField("Próxima Consulta", formatDate(patient.data_proxima_consulta))} // Campo Próxima Consulta do Paciente oculto, pois essa informação é gerenciada no prontuário */}
        </div>

        {/* Seção de Endereço */}
        <div className="patient-info-section">
          <h3>Endereço</h3>
          {renderField("CEP", patient.cep)}
          {renderField("Logradouro", patient.logradouro)}
          {renderField("Número", patient.numeroEndereco)}
          {renderField("Complemento", patient.complemento)}
          {renderField("Bairro", patient.bairro)}
          {renderField("Cidade", patient.cidade)}
          {renderField("Estado", patient.estado)}
        </div>

        {/* Seção de Outras Informações */}
        <div className="patient-info-section">
          <h3>Outras Informações</h3>
          {renderField("Como Conheceu a Casa?", patient.comoConheceu)}
          {renderField("Motivo Inicial da Busca", patient.motivoInicialBusca)}
        </div>

        {/* Seção do Último Prontuário */}
        <div className="last-record-section">
          <h3>Último Prontuário</h3>
          {isLoadingRecord ? (
            <p>Carregando último prontuário...</p>
          ) : lastRecord ? (
            <>
              {renderField("Data do Atendimento", formatDate(lastRecord.data_hora_atendimento, true))}
              {renderField("Tipo de Atendimento", lastRecord.tipo_atendimento)}
              {renderField("Queixa/Assunto", lastRecord.queixa_sessao)}
              {/* Campos de observações e orientações do prontuário */}
              {lastRecord.observacoes_atendente && renderField("Observações do Atendente (Prontuário)", lastRecord.observacoes_atendente)}
              {lastRecord.intervencoes_orientacoes && renderField("Orientações/Intervenções (Prontuário)", lastRecord.intervencoes_orientacoes)}
              {lastRecord.encaminhamentos && renderField("Encaminhamentos (Prontuário)", lastRecord.encaminhamentos)}
              {lastRecord.plano_proxima_sessao && renderField("Plano Próxima Sessão (Prontuário)", lastRecord.plano_proxima_sessao)}
            </>
          ) : (
            <p>Nenhum prontuário registrado para este paciente.</p>
          )}
        </div>

        {/* Botão de Voltar */}
        <div className="modal-actions single-button-container">
          <button
            onClick={onClose} // O botão "Voltar" utiliza a função onClose para fechar o modal
            className="modal-back-button"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailModal;