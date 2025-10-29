// src/components/PatientForm.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { registerPatient, updatePatient } from '../services/api';
import './PatientForm.css';

/**
 * @fileoverview Componente de formulário para cadastrar ou editar informações de pacientes.
 * Inclui campos para dados pessoais, contato, endereço e outras informações relevantes.
 * Adapta-se para modo de criação ou edição com base na prop `initialData`.
 */

/**
 * Opções predefinidas para o campo de seleção de gênero.
 * @type {Array<{value: string, label: string}>}
 */
const generoOptions = [
  { value: '', label: 'Selecione...' },
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Feminino', label: 'Feminino' },
  { value: 'Não desejo informar', label: 'Não desejo Informar' },
  // { value: 'Outro', label: 'Outro' }, // Opção "Outro" pode ser adicionada com lógica adicional se necessário.
];

/**
 * Componente PatientForm para criar e atualizar registros de pacientes.
 *
 * @param {object} props - Propriedades do componente.
 * @param {function} props.onFormSubmitSuccess - Callback executado após o formulário ser submetido com sucesso (tanto para criação quanto para edição).
 * @param {object|null} [props.initialData=null] - Dados iniciais do paciente para preencher o formulário em modo de edição. Se null, o formulário opera em modo de criação.
 * @returns {JSX.Element} O JSX do formulário de paciente.
 */
const PatientForm = ({ onFormSubmitSuccess, initialData }) => {
  const { user } = useAuth(); // Hook para acessar o token do usuário autenticado.

  /**
   * Estado para os dados do formulário do paciente.
   * @type {[object, function(object): void]}
   */
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    dataNascimento: '',
    genero: '',
    telefonePrincipal: '',
    cep: '',
    logradouro: '',
    numeroEndereco: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    comoConheceu: '',
    motivoInicialBusca: '',
  });

  /**
   * Estado para controlar o feedback de carregamento durante a submissão do formulário.
   * @type {[boolean, function(boolean): void]}
   */
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Estado para exibir mensagens de sucesso ou erro após a submissão.
   * @type {[{type: string, text: string}, function({type: string, text: string}): void]}
   */
  const [message, setMessage] = useState({ type: '', text: '' });

  /**
   * Determina se o formulário está em modo de edição.
   * Verdadeiro se `initialData` for fornecido e contiver um `id`.
   * @type {boolean}
   */
  const isEditMode = Boolean(initialData && initialData.id);

  /**
   * Efeito para preencher o formulário com `initialData` quando em modo de edição,
   * ou para limpar o formulário quando não estiver em modo de edição ou `initialData` mudar.
   */
  useEffect(() => {
    const initialFormState = {
      nomeCompleto: '', dataNascimento: '', genero: '',
      telefonePrincipal: '',
      cep: '', logradouro: '', numeroEndereco: '', complemento: '',
      bairro: '', cidade: '', estado: '', comoConheceu: '',
      motivoInicialBusca: '',
    };

    if (isEditMode && initialData) {
      setFormData({
        nomeCompleto: initialData.nomeCompleto || '',
        dataNascimento: initialData.dataNascimento ? initialData.dataNascimento.split('T')[0] : '',
        genero: initialData.genero || '',
        telefonePrincipal: initialData.telefonePrincipal || '',
        cep: initialData.cep || '',
        logradouro: initialData.logradouro || '',
        numeroEndereco: initialData.numeroEndereco || '',
        complemento: initialData.complemento || '',
        bairro: initialData.bairro || '',
        cidade: initialData.cidade || '',
        estado: initialData.estado || '',
        comoConheceu: initialData.comoConheceu || '',
        motivoInicialBusca: initialData.motivoInicialBusca || '',
      });
    } else {
      setFormData(initialFormState);
    }
  }, [initialData, isEditMode]);

  /**
   * Manipulador para atualizar o estado `formData` quando o valor de um campo do formulário muda.
   * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>} e - O evento de mudança.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Manipulador para a submissão do formulário.
   * Envia os dados para a API para criar um novo paciente ou atualizar um existente.
   * @param {React.FormEvent<HTMLFormElement>} e - O evento de submissão do formulário.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.token) {
      setMessage({ type: 'error', text: 'Erro de autenticação. Faça login novamente.' });
      return;
    }
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    const dataToSend = { ...formData };
    // Garante que datas vazias sejam enviadas como null para o backend, se desejado.
    if (dataToSend.dataNascimento === '') dataToSend.dataNascimento = null;

    try {
      let responseMessage = '';
      if (isEditMode) {
        const updatedPatient = await updatePatient(initialData.id, dataToSend, user.token);
        responseMessage = `Paciente ${updatedPatient.nomeCompleto || dataToSend.nomeCompleto} atualizado com sucesso!`;
      } else {
        const newPatient = await registerPatient(dataToSend, user.token);
        responseMessage = `Paciente ${newPatient.nomeCompleto || dataToSend.nomeCompleto} cadastrado com sucesso!`;
      }
      setMessage({ type: 'success', text: responseMessage });

      if (!isEditMode) { // Limpa o formulário apenas em modo de novo cadastro.
        setFormData({
            nomeCompleto: '', dataNascimento: '', genero: '',
            telefonePrincipal: '',
            cep: '', logradouro: '', numeroEndereco: '', complemento: '',
            bairro: '', cidade: '', estado: '', comoConheceu: '',
            motivoInicialBusca: '',
        });
      }

      if (onFormSubmitSuccess) {
        onFormSubmitSuccess(); // Chama o callback de sucesso.
      }

    } catch (error) {
      // Em produção, erros específicos da API podem ser logados em um serviço de monitoramento.
      setMessage({ type: 'error', text: error.message || (isEditMode ? 'Falha ao atualizar paciente.' : 'Falha ao cadastrar paciente.') });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="patient-form-container">
      <h3>{isEditMode ? `Editar Paciente: ${initialData?.nomeCompleto || ''}` : 'Cadastrar Novo Paciente'}</h3>
      <form onSubmit={handleSubmit} className="patient-form">

        <div className="form-section">
          <h4>Dados Pessoais</h4>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nomeCompleto">Nome Completo*:</label>
              <input type="text" id="nomeCompleto" name="nomeCompleto" value={formData.nomeCompleto} onChange={handleChange} required disabled={isLoading} />
            </div>
            <div className="form-group">
              <label htmlFor="dataNascimento">Data de Nascimento:</label>
              <input type="date" id="dataNascimento" name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} disabled={isLoading} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="genero">Gênero:</label>
              <select
                id="genero"
                name="genero"
                value={formData.genero}
                onChange={handleChange}
                disabled={isLoading}
                className="form-input-select"
              >
                {generoOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
             <div className="form-group"> {/* Espaço reservado onde estava o CPF, pode ser usado para outro campo ou removido se o layout não precisar. */}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4>Contato</h4>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="telefonePrincipal">Telefone Principal*:</label>
              <input type="tel" id="telefonePrincipal" name="telefonePrincipal" value={formData.telefonePrincipal} onChange={handleChange} required disabled={isLoading} />
            </div>
             <div className="form-group"> {/* Espaço reservado onde estava o Email. */}
            </div>
          </div>
        </div>

        <div className="form-section">
            <h4>Endereço</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cep">CEP:</label>
                <input type="text" id="cep" name="cep" value={formData.cep} onChange={handleChange} disabled={isLoading} />
              </div>
              <div className="form-group">
                <label htmlFor="logradouro">Logradouro (Rua/Avenida):</label>
                <input type="text" id="logradouro" name="logradouro" value={formData.logradouro} onChange={handleChange} disabled={isLoading} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="numeroEndereco">Número:</label>
                <input type="text" id="numeroEndereco" name="numeroEndereco" value={formData.numeroEndereco} onChange={handleChange} disabled={isLoading} />
              </div>
              <div className="form-group">
                <label htmlFor="complemento">Complemento:</label>
                <input type="text" id="complemento" name="complemento" value={formData.complemento} onChange={handleChange} disabled={isLoading} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bairro">Bairro:</label>
                <input type="text" id="bairro" name="bairro" value={formData.bairro} onChange={handleChange} disabled={isLoading} />
              </div>
              <div className="form-group">
                <label htmlFor="cidade">Cidade:</label>
                <input type="text" id="cidade" name="cidade" value={formData.cidade} onChange={handleChange} disabled={isLoading} />
              </div>
            </div>
             <div className="form-row">
              <div className="form-group">
                <label htmlFor="estado">Estado:</label>
                <input type="text" id="estado" name="estado" value={formData.estado} onChange={handleChange} disabled={isLoading} />
              </div>
               <div className="form-group"> {/* Espaço reservado. */}
                </div>
            </div>
        </div>
        
        <div className="form-section">
            <h4>Outras Informações</h4>
            <div className="form-group full-width">
              <label htmlFor="comoConheceu">Como Conheceu a Casa?</label>
              <input type="text" id="comoConheceu" name="comoConheceu" value={formData.comoConheceu} onChange={handleChange} disabled={isLoading} />
            </div>
            <div className="form-group full-width">
              <label htmlFor="motivoInicialBusca">Motivo Inicial da Busca / Queixa Principal:</label>
              <textarea id="motivoInicialBusca" name="motivoInicialBusca" value={formData.motivoInicialBusca} onChange={handleChange} rows="3" disabled={isLoading}></textarea>
            </div>
        </div>

        {message.text && (
          <p className={`form-message ${message.type}`}>{message.text}</p>
        )}

        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? (isEditMode ? 'Atualizando...' : 'Salvando...') : (isEditMode ? 'Atualizar Paciente' : 'Salvar Cadastro')}
        </button>
      </form>
    </div>
  );
};

export default PatientForm;