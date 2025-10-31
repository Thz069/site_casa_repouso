# Casa de Acompanhamento Espiritual - Sistema de Gestão

Este é um sistema web desenvolvido em React para a gestão de pacientes e seus prontuários de acompanhamento espiritual. A aplicação permite que usuários autorizados (atendentes) gerenciem informações de pacientes e registrem novos atendimentos de forma organizada e segura.

## 🏛️ Arquitetura e Estrutura de Arquivos

O projeto é estruturado de forma modular para separar responsabilidades, facilitando a manutenção e escalabilidade.

- **`src/components`**: Contém componentes React reutilizáveis, como formulários, listas e modais (ex: `PatientForm`, `PatientList`, `AllPatientRecordsModal`).
- **`src/pages`**: Contém os componentes que representam as páginas completas da aplicação (ex: `PatientManagementPage`, `NewMedicalRecordPage`). Eles organizam os componentes menores para formar uma visão completa.
- **`src/contexts`**: Gerencia o estado global da aplicação. Atualmente, inclui o `AuthContext` para controlar a autenticação do usuário em toda a aplicação.
- **`src/services`**: Camada responsável pela comunicação com a API do backend. O arquivo `api.js` centraliza todas as chamadas `fetch` para os endpoints do servidor.

## ✨ Funcionalidades Detalhadas

### 1. Autenticação e Cadastro de Usuários

- **Login e Cadastro:** Acesso seguro via página de login e uma página de cadastro para novos usuários.
- **Comunicação com Backend:** A autenticação é feita através de chamadas à API, que valida as credenciais e retorna um token de acesso.
- **Rotas Protegidas:** Utiliza `ProtectedRoute` para garantir que apenas usuários autenticados acessem as páginas de dados.

### 2. Gestão de Pacientes (CRUD Completo)
- **Cadastro:** Um formulário completo para registrar novos pacientes.
- **Visualização:** Lista todos os pacientes com uma função de busca para filtragem rápida.
- **Detalhes:** Um modal exibe todas as informações de um paciente selecionado.
- **Atualização:** O mesmo formulário de cadastro é usado para editar as informações de um paciente existente.
- **Exclusão:** Funcionalidade para remover um paciente do sistema (requer confirmação).

### 3. Gestão de Prontuários
- **Criação de Prontuário:** Formulário para adicionar um novo registro de atendimento a um paciente específico, incluindo detalhes da sessão e plano para o futuro.
- **Histórico de Prontuários:** Um modal permite visualizar todos os prontuários já registrados para um paciente.
- **Lista Geral de Prontuários:** Uma página dedicada lista todos os prontuários de todos os pacientes, permitindo uma visão geral dos atendimentos.
- **Atualização da Próxima Consulta:** Ao criar um prontuário, é possível definir ou atualizar a data da próxima consulta geral do paciente.

## 🔌 Interação com a API Backend

O frontend espera que um servidor backend esteja rodando e respondendo na seguinte URL base:
`http://localhost:3001/api`

### Endpoints Esperados

O `frontend` está configurado para interagir com os seguintes endpoints:

- **Autenticação:**
  - `POST /auth/login` - Autentica um usuário e retorna um token.
  - `POST /auth/register` - Registra um novo usuário.
- **Pacientes:**
  - `GET /patients` - Retorna a lista de todos os pacientes.
  - `POST /patients` - Cria um novo paciente.
  - `GET /patients/:id` - Retorna os detalhes de um paciente específico.
  - `PUT /patients/:id` - Atualiza um paciente existente.
  - `DELETE /patients/:id` - Exclui um paciente.
- **Prontuários:**
  - `GET /patients/:patientId/records` - Retorna todos os prontuários de um paciente.
  - `POST /patients/:patientId/records` - Adiciona um novo prontuário a um paciente.
  - `GET /geral/todos-prontuarios` - Retorna uma lista de todos os prontuários de todos os pacientes.

### Modelos de Dados (JSON)

O frontend envia e espera receber dados do backend nos seguintes formatos:

**Objeto Paciente:**
```json
{
  "nomeCompleto": "string",
  "dataNascimento": "YYYY-MM-DD",
  "genero": "string",
  "telefonePrincipal": "string",
  "cep": "string",
  "logradouro": "string",
  "numeroEndereco": "string",
  "complemento": "string",
  "bairro": "string",
  "cidade": "string",
  "estado": "string",
  "comoConheceu": "string",
  "motivoInicialBusca": "string",
  "data_proxima_consulta": "YYYY-MM-DD"
}
```

**Objeto Prontuário:**
```json
{
  "data_hora_atendimento": "ISO 8601 DateTime",
  "tipo_atendimento": "string",
  "queixa_sessao": "string",
  "intervencoes_orientacoes": "string",
  "encaminhamentos": "string",
  "plano_proxima_sessao": "string",
  "id_atendente_fk": "string"
}
```

## 🚀 Como Executar o Projeto

Siga os passos abaixo para configurar e executar o projeto em seu ambiente de desenvolvimento local.

### Pré-requisitos

- **Node.js:** (Versão 14.x ou superior)
- **npm** ou **yarn**
- Um **servidor de API backend** compatível com os endpoints e modelos de dados descritos acima, rodando em `http://localhost:3001`.

### Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Thz069/site_casa_repouso.git
   ```

2. **Navegue até o diretório do projeto:**
   ```bash
   cd site_casa_repouso
   ```

3. **Instale as dependências:**
   ```bash
   npm install
   ```

### Scripts Disponíveis

- **`npm start`**: Inicia a aplicação em modo de desenvolvimento em [http://localhost:3000](http://localhost:3000).
- **`npm test`**: Executa os testes.
- **`npm run build`**: Compila a aplicação para produção.

## 💡 Sugestões para Melhorias Futuras

- **Validação de Dados:** Adicionar validação nos formulários (frontend e backend) usando bibliotecas como `Yup` ou `Zod`.
- **Paginação:** Implementar paginação nas listas de pacientes e prontuários para melhor desempenho com grandes volumes de dados.
- **Documentação da API:** Criar uma documentação formal da API no backend usando ferramentas como Swagger ou OpenAPI.
- **Testes Unitários e de Integração:** Expandir a cobertura de testes para garantir a confiabilidade dos componentes e serviços.
