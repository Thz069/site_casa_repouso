// src/components/ViewMedicalRecordModal.js
/**
 * @fileoverview Componente modal para exibir os detalhes completos de um prontuário
 * em modo de apenas leitura.
 */

import React from 'react';
import './ViewMedicalRecordModal.css';

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
 * Função auxiliar para renderizar um campo de informação com um rótulo e seu valor.
 * Exibe 'N/A' se o valor do campo não for fornecido (nulo, indefinido ou string vazia).
 * @param {string} label - O rótulo descritivo para o campo.
 * @param {string|number|null|undefined} value - O valor do campo a ser exibido.
 * @returns {JSX.Element} Um elemento JSX contendo o rótulo e o valor formatado.
 */
const renderField = (label, value) => {
  const displayValue = value || 'N/A';
  return (
    <div className="record-field">
      <strong className="record-field-label">{label}:</strong>
      <span className="record-field-value">{displayValue}</span>
    </div>
  );
};

/**
 * Componente modal para visualizar os detalhes completos de um prontuário em modo de apenas leitura.
 * @param {object} props - Propriedades do componente.
 * @param {boolean} props.isOpen - Controla se o modal está visível ou não. O componente não renderiza se false.
 * @param {function} props.onClose - Função callback a ser executada para fechar o modal.
 * @param {object|null} props.record - Objeto contendo os dados do prontuário a ser exibido. Se null, o modal não é renderizado.
 * @param {string} [props.patientName] - Nome do paciente associado a este prontuário (opcional, para exibição no título).
 * @returns {JSX.Element|null} O elemento JSX do modal ou null se `props.isOpen` for false ou `props.record` for nulo.
 */
const ViewMedicalRecordModal = ({ isOpen, onClose, record, patientName }) => {
  if (!isOpen || !record) {
    return null;
  }

  // Formata o campo 'plano_proxima_sessao' para exibir quebras de linha corretamente.
  const formattedPlanoProximaSessao = record.plano_proxima_sessao
    ? record.plano_proxima_sessao.split('\n').map((line, index) => (
        <React.Fragment key={index}>{line}<br /></React.Fragment>
      ))
    : 'N/A';

  return (
    <div className="modal-overlay-view-record" onClick={onClose}>
      <div className="modal-content-view-record" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button-view-record" onClick={onClose} aria-label="Fechar modal">&times;</button>
        <h2>Detalhes do Prontuário</h2>
        {patientName && <p className="record-patient-name"><strong>Paciente:</strong> {patientName}</p>}
        {/* Exibe o nome do atendente se disponível, caso contrário, o ID do atendente. */}
        <p className="record-attendant-name"><strong>Atendente:</strong> {record.attendantName || record.id_atendente_fk || 'N/A'}</p>

        <div className="record-section">
          {renderField("Data e Hora do Atendimento", formatDate(record.data_hora_atendimento, true))}
          {renderField("Tipo de Atendimento", record.tipo_atendimento)}
          {renderField("Queixa/Assunto da Sessão", record.queixa_sessao)}
        </div>

        {/* Seção para campos que podem existir em prontuários antigos, mas foram removidos do formulário de criação. */}
        {(record.relato_paciente || record.observacoes_atendente) && (
          <div className="record-section">
            <h3>Relatos e Observações (Histórico)</h3>
            {record.relato_paciente && renderField("Relato do Paciente", record.relato_paciente)}
            {record.observacoes_atendente && renderField("Observações do Atendente", record.observacoes_atendente)}
          </div>
        )}

        <div className="record-section">
          <h3>Detalhes do Atendimento</h3>
          {renderField("Intervenções/Orientações Realizadas", record.intervencoes_orientacoes)}
          {renderField("Encaminhamentos", record.encaminhamentos)}
          <div className="record-field">
            <strong className="record-field-label">Plano para Próxima Sessão:</strong>
            {/* A classe 'pre-wrap' no CSS associado a 'record-field-value' pode ser usada para manter as quebras de linha. */}
            <span className="record-field-value pre-wrap">{formattedPlanoProximaSessao}</span>
          </div>
          {/* Exibe a data da próxima sessão definida neste prontuário, se existir. */}
          {record.data_proxima_sessao_prontuario && renderField("Data da Próxima Sessão (definida neste prontuário)", formatDate(record.data_proxima_sessao_prontuario))}
        </div>
        
        <div className="record-section-timestamps">
          {renderField("Prontuário Criado em", formatDate(record.data_criacao_prontuario, true))}
          {renderField("Última Modificação do Prontuário", formatDate(record.data_ultima_modificacao, true))}
        </div>

        <div className="modal-actions-view-record">
          <button onClick={onClose} className="modal-back-button-view-record">
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewMedicalRecordModal;