// src/components/AllPatientRecordsModal.js
import React from 'react';
import './AllPatientRecordsModal.css';

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
    timeZone: 'UTC' // Mantém a consistência para datas ISO que são inerentemente UTC.
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
    // Captura erros inesperados durante a formatação da data.
    console.error("Erro ao formatar data:", dateString, e);
    return 'Erro na Data';
  }
};

/**
 * Componente modal para exibir uma lista de todos os prontuários de um paciente específico.
 * Os prontuários são exibidos em modo de apenas leitura.
 * @param {object} props - Propriedades do componente.
 * @param {boolean} props.isOpen - Controla a visibilidade do modal. Não renderiza nada se false.
 * @param {function} props.onClose - Função callback para ser executada quando o modal deve ser fechado.
 * @param {string} [props.patientName='Paciente'] - O nome do paciente cujos prontuários estão sendo exibidos.
 * @param {Array<object>} props.records - Um array de objetos, onde cada objeto representa um prontuário.
 * @param {boolean} props.isLoading - Indica se os dados dos prontuários estão atualmente sendo carregados.
 * @returns {JSX.Element|null} Retorna o elemento JSX do modal ou null se props.isOpen for false.
 */
const AllPatientRecordsModal = ({ isOpen, onClose, patientName, records, isLoading }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay-all-records" onClick={onClose}>
      <div className="modal-content-all-records" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button-all-records" onClick={onClose}>&times;</button>
        <h2>Todos os Prontuários de {patientName || 'Paciente'}</h2>

        {isLoading ? (
          <p className="loading-message-all-records">Carregando prontuários...</p>
        ) : records && records.length > 0 ? (
          <div className="records-list-container">
            {records.map((record) => (
              // Utiliza record.recordId (com fallback para record.recordid) como chave única para cada item da lista.
              <div key={record.recordId || record.recordid} className="record-item">
                <h4>Atendimento de {formatDate(record.data_hora_atendimento, true)}</h4>
                <p><strong>Tipo:</strong> {record.tipo_atendimento || 'N/A'}</p>
                <p><strong>Queixa/Assunto:</strong> {record.queixa_sessao || 'N/A'}</p>
                {/* Os campos abaixo podem ou não existir dependendo da versão do prontuário */}
                {record.observacoes_atendente && <p><strong>Observações do Atendente:</strong> {record.observacoes_atendente}</p>}
                {record.intervencoes_orientacoes && <p><strong>Orientações/Intervenções:</strong> {record.intervencoes_orientacoes}</p>}
                {record.encaminhamentos && <p><strong>Encaminhamentos:</strong> {record.encaminhamentos}</p>}
                {record.plano_proxima_sessao && <p><strong>Plano Próxima Sessão:</strong> {record.plano_proxima_sessao}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-records-message">Nenhum prontuário encontrado para este paciente.</p>
        )}
      </div>
    </div>
  );
};

export default AllPatientRecordsModal;