// src/pages/NewMedicalRecordPage.js
/**
 * @fileoverview Componente de página para criação de um novo prontuário para um paciente específico.
 * Permite registrar os detalhes do atendimento, definir um plano para a próxima sessão
 * e atualizar a data da próxima consulta geral do paciente.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchPatientById, addPatientRecord, updatePatient } from '../services/api';
import './NewMedicalRecordPage.css';

/**
 * Opções predefinidas para sugestões da próxima sessão, usadas nos checkboxes.
 * @type {Array<string>}
 */
const predefinedNextSessionOptions = [
  "Cromoterapia",
  "Cirurgia Espiritual",
  "Energização",
  "Oncologia Espiritual"
];

/**
 * Componente NewMedicalRecordPage.
 * Permite ao atendente criar um novo registro de prontuário para um paciente.
 * Após salvar o prontuário, também pode atualizar a data da próxima consulta do paciente.
 * @returns {JSX.Element} O elemento JSX da página de novo prontuário.
 */
const NewMedicalRecordPage = () => {
  const { patientId } = useParams(); // Hook para extrair 'patientId' dos parâmetros da URL.
  const { user } = useAuth(); // Hook para acessar dados do usuário autenticado (token, id, nome).
  const navigate = useNavigate(); // Hook para navegação programática.

  /** @type {[object|null, function(object|null): void]} Estado para armazenar os dados do paciente. */
  const [patient, setPatient] = useState(null);
  /** @type {[boolean, function(boolean): void]} Estado para indicar o carregamento dos dados do paciente. */
  const [isLoadingPatient, setIsLoadingPatient] = useState(true);
  /** @type {[string, function(string): void]} Estado para mensagens de erro ao carregar dados do paciente. */
  const [errorPatient, setErrorPatient] = useState('');

  /**
   * Estado para os dados do formulário do prontuário.
   * @type {[object, function(object): void]}
   */
  const [formData, setFormData] = useState({
    data_hora_atendimento: new Date().toISOString().slice(0, 16), // Formato 'YYYY-MM-DDTHH:mm' para input datetime-local
    tipo_atendimento: '',
    queixa_sessao: '',
    intervencoes_orientacoes: '',
    encaminhamentos: '',
    plano_proxima_sessao_texto_livre: '', // Campo para o texto livre do plano
  });

  /** @type {[string, function(string): void]} Estado para a data da próxima consulta do paciente (a ser atualizada na ficha do paciente). */
  const [nextSessionDateForPatient, setNextSessionDateForPatient] = useState('');
  /** @type {[Array<string>, function(Array<string>): void]} Estado para as opções selecionadas nos checkboxes do plano da próxima sessão. */
  const [selectedPlanoOptions, setSelectedPlanoOptions] = useState([]);

  /** @type {[boolean, function(boolean): void]} Estado para indicar se o formulário está sendo submetido. */
  const [isSubmitting, setIsSubmitting] = useState(false);
  /** @type {[{type: string, text: string}, function({type: string, text: string}): void]} Estado para mensagens de feedback (sucesso/erro) da submissão. */
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

  /**
   * Efeito para buscar os dados do paciente quando o componente é montado ou
   * quando `patientId` ou `user.token` mudam.
   * Também pré-preenche o campo `nextSessionDateForPatient` se o paciente já tiver uma `data_proxima_consulta`.
   */
  useEffect(() => {
    if (patientId && user?.token) {
      setIsLoadingPatient(true);
      fetchPatientById(patientId, user.token)
        .then(data => {
          setPatient(data);
          if (data && data.data_proxima_consulta) {
            const dateObj = new Date(data.data_proxima_consulta);
            if (!isNaN(dateObj.getTime())) {
              // Formata a data para YYYY-MM-DD, adequado para input type="date".
              // Se data.data_proxima_consulta já vier do backend como YYYY-MM-DD, a conversão pode ser mais direta.
              // A lógica abaixo tenta ser robusta para datas ISO completas ou apenas data.
              if (typeof data.data_proxima_consulta === 'string' && data.data_proxima_consulta.match(/^\d{4}-\d{2}-\d{2}$/)) {
                setNextSessionDateForPatient(data.data_proxima_consulta);
              } else {
                setNextSessionDateForPatient(dateObj.toISOString().split('T')[0]);
              }
            } else {
              setNextSessionDateForPatient(''); // Data inválida do backend
            }
          } else {
            setNextSessionDateForPatient(''); // Sem data prévia
          }
          setErrorPatient('');
        })
        .catch(err => {
          setErrorPatient(err.message || "Falha ao carregar dados do paciente.");
          setPatient(null);
        })
        .finally(() => setIsLoadingPatient(false));
    } else {
      setErrorPatient("ID do paciente ou token não fornecido.");
      setIsLoadingPatient(false);
    }
  }, [patientId, user?.token]);

  /**
   * Manipulador genérico para atualizar o estado `formData` quando
   * o valor de um campo do formulário de prontuário muda.
   * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>} e - O evento de mudança.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Manipulador para atualizar o estado `selectedPlanoOptions` quando
   * uma opção de checkbox para o plano da próxima sessão é marcada/desmarcada.
   * @param {string} option - A opção que foi alterada.
   */
  const handlePlanoOptionChange = (option) => {
    setSelectedPlanoOptions(prev =>
      prev.includes(option)
        ? prev.filter(item => item !== option) // Desmarca se já selecionado
        : [...prev, option] // Marca se não selecionado
    );
  };

  /**
   * Manipulador para atualizar o estado `nextSessionDateForPatient` quando
   * o valor do input de data da próxima sessão do paciente muda.
   * @param {React.ChangeEvent<HTMLInputElement>} e - O evento de mudança do input de data.
   */
  const handleNextSessionDateChange = (e) => {
    setNextSessionDateForPatient(e.target.value);
  };

  /**
   * Manipulador para a submissão do formulário de novo prontuário.
   * Constrói os dados do prontuário, chama a API para adicioná-lo e, se uma data
   * para a próxima consulta do paciente for fornecida, chama a API para atualizar o paciente.
   * @async
   * @param {React.FormEvent<HTMLFormElement>} e - O evento de submissão do formulário.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.token || !user.id || !patientId) {
      setSubmitMessage({ type: 'error', text: 'Erro de autenticação ou dados do paciente em falta.' });
      return;
    }
    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });

    // Constrói o campo plano_proxima_sessao final concatenando texto livre e opções selecionadas.
    let planoFinal = formData.plano_proxima_sessao_texto_livre || '';
    if (selectedPlanoOptions.length > 0) {
      const suggestions = selectedPlanoOptions.join(', ');
      planoFinal = planoFinal ? `${planoFinal}\nSugestões: ${suggestions}` : `Sugestões: ${suggestions}`;
    }

    const recordDataToSend = {
      data_hora_atendimento: new Date(formData.data_hora_atendimento).toISOString(),
      tipo_atendimento: formData.tipo_atendimento,
      queixa_sessao: formData.queixa_sessao,
      intervencoes_orientacoes: formData.intervencoes_orientacoes,
      encaminhamentos: formData.encaminhamentos,
      plano_proxima_sessao: planoFinal,
    };

    try {
      await addPatientRecord(patientId, recordDataToSend, user.token, user.id);
      let currentSubmitMessage = 'Prontuário salvo com sucesso!';

      // Se uma data para a próxima consulta do paciente foi informada E é válida, tenta atualizar o paciente.
      if (nextSessionDateForPatient && nextSessionDateForPatient.trim() !== '') {
        const dateObjForPatientUpdate = new Date(nextSessionDateForPatient);
        if (!isNaN(dateObjForPatientUpdate.getTime())) { // Verifica se a data é válida.
          try {
            // O input type="date" fornece a data no formato YYYY-MM-DD, que é adequado para
            // uma coluna TEXT no SQLite ou para ser processado pelo backend.
            const patientUpdateData = { data_proxima_consulta: nextSessionDateForPatient };
            await updatePatient(patientId, patientUpdateData, user.token);
            // Formata a data para exibição na mensagem de sucesso.
            const displayDate = new Date(nextSessionDateForPatient + 'T00:00:00Z').toLocaleDateString('pt-BR', {timeZone: 'UTC'});
            currentSubmitMessage += ` Data da próxima consulta do paciente atualizada para ${displayDate}.`;
          } catch (updateError) {
            currentSubmitMessage += ` (Atenção: Falha ao atualizar a data da próxima consulta do paciente: ${updateError.message})`;
          }
        } else {
          currentSubmitMessage += ` (Atenção: Data da próxima consulta fornecida (${nextSessionDateForPatient}) é inválida e não foi atualizada.)`;
        }
      }
      setSubmitMessage({ type: 'success', text: currentSubmitMessage });

      // Limpa os campos do formulário de prontuário.
      setFormData({
        data_hora_atendimento: new Date().toISOString().slice(0, 16),
        tipo_atendimento: '', queixa_sessao: '',
        intervencoes_orientacoes: '', encaminhamentos: '',
        plano_proxima_sessao_texto_livre: '',
      });
      setSelectedPlanoOptions([]);
      // Opcional: Limpar nextSessionDateForPatient ou mantê-lo para o próximo prontuário do mesmo paciente.
      // setNextSessionDateForPatient('');
    } catch (error) {
      setSubmitMessage({ type: 'error', text: error.message || 'Falha ao salvar prontuário.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingPatient) return <div className="page-loading">Carregando dados do paciente...</div>;
  if (errorPatient) return <div className="page-error">Erro: {errorPatient} <Link to="/pacientes">Voltar</Link></div>;
  if (!patient) return <div className="page-error">Paciente não encontrado. <Link to="/pacientes">Voltar</Link></div>;

  return (
    <div className="new-record-page-container">
      <button onClick={() => navigate(-1)} className="back-button" title="Voltar à página anterior">{'< Voltar'}</button>
      <h2>Novo Prontuário para: {patient.nomeCompleto}</h2>
      <p className="attendant-info">Atendente: {user?.name || 'N/A'}</p>

      <form onSubmit={handleSubmit} className="new-record-form">
        <div className="form-grid">
          <div className="form-group full-width">
            <label htmlFor="data_hora_atendimento">Data e Hora do Atendimento*:</label>
            <input type="datetime-local" id="data_hora_atendimento" name="data_hora_atendimento" value={formData.data_hora_atendimento} onChange={handleChange} required disabled={isSubmitting} />
          </div>

          <div className="form-group full-width">
            <label htmlFor="tipo_atendimento">Tipo de Atendimento/Técnica Aplicada:</label>
            <input type="text" id="tipo_atendimento" name="tipo_atendimento" value={formData.tipo_atendimento} onChange={handleChange} disabled={isSubmitting} placeholder="Ex: Aconselhamento, Reiki"/>
          </div>

          <div className="form-group full-width">
            <label htmlFor="queixa_sessao">Queixa/Assunto da Sessão*:</label>
            <textarea id="queixa_sessao" name="queixa_sessao" value={formData.queixa_sessao} onChange={handleChange} rows="3" required disabled={isSubmitting}></textarea>
          </div>

          <div className="form-group full-width">
            <label htmlFor="intervencoes_orientacoes">Intervenções/Orientações Realizadas:</label>
            <textarea id="intervencoes_orientacoes" name="intervencoes_orientacoes" value={formData.intervencoes_orientacoes} onChange={handleChange} rows="4" disabled={isSubmitting}></textarea>
          </div>

          <div className="form-group full-width">
            <label htmlFor="encaminhamentos">Encaminhamentos (se houver):</label>
            <input type="text" id="encaminhamentos" name="encaminhamentos" value={formData.encaminhamentos} onChange={handleChange} disabled={isSubmitting} />
          </div>

          <div className="form-group full-width">
            <label htmlFor="plano_proxima_sessao_texto_livre">Plano para Próxima Sessão (Texto Livre):</label>
            <textarea
              id="plano_proxima_sessao_texto_livre"
              name="plano_proxima_sessao_texto_livre"
              value={formData.plano_proxima_sessao_texto_livre}
              onChange={handleChange}
              rows="3"
              disabled={isSubmitting}
              placeholder="Descreva o plano ou recomendações..."
            />
          </div>

          <div className="form-group full-width">
            <label>Sugestões Adicionais para Próxima Sessão:</label>
            <div className="checkbox-group">
              {predefinedNextSessionOptions.map(option => (
                <label key={option} className="checkbox-label">
                  <input
                    type="checkbox"
                    value={option}
                    checked={selectedPlanoOptions.includes(option)}
                    onChange={() => handlePlanoOptionChange(option)}
                    disabled={isSubmitting}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
          
          <div className="form-group full-width">
            <label htmlFor="nextSessionDateForPatient">Definir/Atualizar Próxima Consulta do Paciente:</label>
            <input
              type="date"
              id="nextSessionDateForPatient"
              name="nextSessionDateForPatient"
              value={nextSessionDateForPatient}
              onChange={handleNextSessionDateChange}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {submitMessage.text && (
          <p className={`form-message ${submitMessage.type}`}>{submitMessage.text}</p>
        )}

        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando Prontuário...' : 'Salvar Prontuário'}
        </button>
      </form>
    </div>
  );
};

export default NewMedicalRecordPage;