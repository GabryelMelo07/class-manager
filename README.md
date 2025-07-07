# 📚 Class Manager

**Class Manager** é um sistema **gratuito** de gerenciamento de horários acadêmicos que permite a organização de cursos, professores, salas de aula, disciplinas, turmas e horários.
O projeto foi construído em cima da licença de código aberto (*open-source*) do <a target="_blank" rel="noopener noreferrer" href='https://github.com/GabryelMelo07/class-manager/blob/master/LICENSE'>MIT</a>

---

## 🚀 Implantação

Para implantar o sistema, é necessário que o ambiente suporte containers Docker. O ambiente pode ser:

- Um servidor dedicado;
- Ou uma ferramenta como o **AWS ECR (Elastic Container Registry)**.

### 1. 🔁 Clone o Repositório

```bash
git clone https://github.com/GabryelMelo07/class-manager
cd class-manager
```

### 2. 🐳 Dockerfiles

Os `Dockerfile` já estão preparados nas pastas:

- `backend/`
- `frontend/`

### 3. ⚙️ Configuração de Variáveis de Ambiente

É **imprescindível** configurar as variáveis de ambiente **ANTES** de rodar os containers.

- Exemplo de configuração:
  - Backend: [`backend/example.env`](backend/example.env)
  - Frontend: [`frontend/example.env`](frontend/example.env)

> 📄 Para entender o significado e uso de cada variável, consulte o arquivo [variaveis.md](./variaveis.md)

---

## 🔧 Variáveis Importantes

### Backend

As variáveis obrigatórias incluem:

- Banco de dados (`DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`);
- Configuração de e-mail (`EMAIL_*`);
- Informações do usuário admin inicial (`ADMIN_CONFIG_*`);
- API issuer e CORS (`API_ISSUER`, `CORS_*`);
- URL do frontend (`FRONT_END_URL`);

### Frontend

- A variável obrigatória é: `VITE_API_URL`

---

## ▶️ Executando o Sistema

Após configurar o ambiente e variáveis:

```bash
# Backend
cd backend
docker build -t class-manager-backend .
docker run --env-file .env -p 8080:8080 class-manager-backend

# Frontend
cd ../frontend
docker build -t class-manager-frontend .
docker run --env-file .env -p 5173:5173 class-manager-frontend
```

O sistema estará disponível em:

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend (Swagger): [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

---

## 🧪 Swagger

O Swagger está disponível na rota:

```
/swagger-ui/index.html
```

- O botão "Try it out" pode ser ativado/desativado via a variável `SWAGGER_TRYITOUT_ENABLED`.
- Por padrão, está **ativado**.

---

## 🧑‍🏫 Cadastro Inicial (Admin)

Se a variável `GENERATE_ADMIN_USER` estiver como `true` (valor padrão), um usuário administrador será criado automaticamente com os dados definidos nas variáveis `ADMIN_CONFIG_*`.

---

## 🗂️ Fluxo de Cadastro no Sistema

A ordem ideal para cadastro no sistema é:

1. **Usuários** (Administradores, Coordenadores de curso, Professores);
2. **Semestre**;
3. **Cursos** (obrigatório informar o Coordenador);
4. **Timeslots** para os cursos;
5. **Salas de aula**;
6. **Disciplinas** (depende de professores);
7. **Turmas** (depende de disciplinas e salas);
8. **Horários** (manualmente ou automaticamente).

> ⚠️ Alguns cadastros também podem ser feitos por coordenadores (em seus respectivos cursos).

---

## ✅ Validação

Todos os dados podem ser validados e ajustados por um administrador na aba de edição do sistema.

---

## 📝 Licença

Este projeto está sob a licença MIT.

---

📌 Desenvolvido por [Gabryel Melo](https://github.com/GabryelMelo07)