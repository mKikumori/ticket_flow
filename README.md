# ticket-flow
Sistema de Tickets ( Voltado a HelpDesk )que roda em tempo real, onde é possível fazer o gerenciamento de todo o ciclo do Ticket, visualizar todos os registros e informações dos Tickets de forma individual e de forma geral.

## Wireframe Design
https://www.figma.com/exemplo

## Arquitetura

Este projeto segue o padrão arquitetural **MVVM (Model-View-ViewModel)** para garantir uma separação clara de responsabilidades, manutenibilidade e escalabilidade.

### MVVM Breakdown:

1. **Model**: Esta camada é responsável pelos dados e pela lógica de negócios da aplicação. Ela interage com recursos externos, como APIs ou bancos de dados, para recuperar ou manipular dados.
    - Localizado em: `lib/models/` and `lib/services/`
    - **Examplo**: `user.js`, `application.js`, `auth_service.js`, `application_service.js`

2. **View**: A camada **View** representa a interface do usuário (UI) e exibe os dados provenientes da **ViewModel**. Ela é, em sua maioria, passiva e não trata a lógica de negócios.
    - Localizada em: `lib/views/`
    - **Example**: `sign_up.jsx`, `home.jsx`, `applications_list.jsx`

3. **ViewModel**: O **ViewModel** é responsável por gerenciar o estado da aplicação, lidar com a lógica de negócios e preparar os dados para a **View** exibir. Ele se comunica com a camada **Model** para buscar e processar dados.
    - Located in: `lib/view_models/`
    - **Example**: `auth_view_model.jsx`, `application_view_model.jsx`

### Estrutura das pastas

```plaintext
lib/
├── main.jsx              # Ponto de entrada do app
├── config/                # Arquivos de configuração
│   └── app_config.jsx    # Configuração de todo o aplicativo (tema, rotas, etc.)
├── models/                # Modelos de dados (por exemplo, para usuário, aplicativo)
│   └── user.jsx          # Modelo do Usuário
│   └── application.jsx  # Modelo do App
├── services/              # Serviços de API e lógica de dados
│   └── auth_service.jsx  # Lógica de autenticação (login, cadastro, MFA)
│   └── application_service.jsx  # Operações CRUD para aplicações
├── view_models/           # Camada ViewModel (Gerenciamento de estado)
│   └── auth_view_model.jsx  # Gerencia a lógica de negócios para as páginas de autenticação.
│   └── application_view_model.jsx  # Gerencia a lógica de negócios das páginas da aplicação.
├── views/                 # Camada de visualização (componentes de UI/páginas)
│   ├── launch/            # Views relacionadas às primeiras páginas
│   │   ├── start.jsx     # Página inicial
│   ├── auth/              # Views relacionadas à autenticação
│   │   ├── sign_up.jsx  # Página de Registro
│   │   ├── sign_in.jsx  # Página de login
│   ├── home/             # HViews relacionadas à Home Page
│   │   └── home.jsx     # Home page
│   ├── applications/     # Views relacionadas à aplicação
│   │   ├── applications_list.jsx  # Visualização de lista de aplicativos
│   │   ├── application_read.jsx   # Visualização de leitura de aplicativos
│   │   ├── application_edit.jsx   # Visualização de edição de aplicativos
│   │   └── application_create.jsx # Visualização de criação de aplicativos
├── widgets/               # Componentes de interface reutilizáveis
│   ├── custom_button.jsx # Widget de botão reutilizável
│   ├── custom_text_field.jsx # Widget de campo de texto reutilizável
│   └── loading_indicator.jsx  # Widget de indicador de carregamento
└── utils/                 # Classes e funções utilitárias
    ├── validators.js     # Funções de validação de entrada
    └── api.js            # Funções auxiliares para requisições de API
