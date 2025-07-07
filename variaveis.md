# ⚙️ Variáveis de Ambiente — Class Manager

Este arquivo documenta todas as variáveis de ambiente utilizadas no sistema.

---

## 🔙 Backend (`backend/.env`)

### 🔧 Perfil e Logs

- `SPRING_PROFILE_ACTIVE`: Perfil da aplicação (`dev`, `prod`, etc.).
- `LOGGING_LEVEL_ROOT`: Nível de log (ex: `INFO`, `DEBUG`).

### 🗄️ Banco de Dados

- `DATABASE_URL`: URL JDBC do banco (ex: `jdbc:postgresql://localhost:5432/class_manager`).
- `DATABASE_USERNAME`: Usuário do banco.
- `DATABASE_PASSWORD`: Senha do banco.

### 🧱 Hibernate

- `HIBERNATE_DDL_AUTO`: Estratégia de sincronização do banco (`update`, `validate`, etc.).
- `HIBERNATE_SHOW_SQL`: Mostra SQLs no log.
- `HIBERNATE_FORMAT_SQL`: Formata SQL no log.

### ✉️ E-mail

- `EMAIL_HOST`: Servidor SMTP.
- `EMAIL_PORT`: Porta SMTP (ex: `587`).
- `EMAIL_USERNAME`: E-mail usado para envio.
- `EMAIL_PASSWORD`: Senha do e-mail.
- `EMAIL_SMTP_AUTH`: Autenticação SMTP (`true`/`false`).
- `EMAIL_SMTP_STARTTLS_ENABLE`: TLS para SMTP (`true`/`false`).

### 👤 Usuário Administrador Inicial

- `GENERATE_ADMIN_USER`: Gera admin automaticamente (`true` ou `false`).
- `ADMIN_CONFIG_NAME`: Nome.
- `ADMIN_CONFIG_SURNAME`: Sobrenome.
- `ADMIN_CONFIG_EMAIL`: E-mail.
- `ADMIN_CONFIG_PASSWORD`: Senha.

### 🔐 Segurança

- `API_ISSUER`: URL base da API (ex: `http://localhost:8080`).
- `HEALTH_CHECK_API_KEY`: Chave secreta para autenticar ao consultar o endpoint health check.

### 🌐 CORS

- `CORS_ALLOWED_ORIGINS`: Origem permitida (ex: `http://localhost:5173`).
- `CORS_ALLOWED_METHODS`: Métodos permitidos.
- `CORS_ALLOWED_HEADERS`: Cabeçalhos permitidos.

### 🧪 Swagger

- `SWAGGER_TRYITOUT_ENABLED`: Ativa/desativa testes interativos no Swagger (default: `true`).

### 📂 Uploads

- `SPRING_SERVLET_MULTIPART_MAX_FILE_SIZE`: Tamanho máximo de upload de arquivo.
- `SPRING_SERVLET_MULTIPART_MAX_REQUEST_SIZE`: Tamanho máximo da requisição com upload.

### 🔗 URL do Frontend

- `FRONT_END_URL`: URL do frontend (usado para notificações, redirecionamentos etc.).

---

## 🔜 Frontend (`frontend/.env`)

- `VITE_API_URL`: URL da API (ex: `http://localhost:8080`). Deve ser definida na build.

---

## 📁 Observação

Os arquivos `.example_env` nas pastas `backend` e `frontend` servem como modelo para preencher essas variáveis no ambiente real. Copie o conteúdo deles para um arquivo `.env` e ajuste conforme sua infraestrutura.

---

📌 Para mais informações, consulte o [README.md](./README.md).