# TagMe Project

Sistema de gerenciamento com backend em Node.js e frontend em Angular.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** versão 22.5.1 ou superior
  - [Download Node.js](https://nodejs.org/)
  - Verifique a instalação: `node --version`
- **npm** (geralmente vem com o Node.js)
  - Verifique a instalação: `npm --version`
- **Angular CLI** (será instalado automaticamente se não estiver presente)
  - Para instalar globalmente: `npm install -g @angular/cli`

## 🚀 Como executar o projeto

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd tagme
```

### 2. Configurar e executar o Backend

Abra um terminal e execute:

```bash
cd tagme-backend
npm install
npm run start:dev
```

O backend será executado na porta padrão (geralmente `http://localhost:3000`).

**Aguarde a mensagem de confirmação** que o servidor está rodando antes de prosseguir para o frontend.

### 3. Configurar e executar o Frontend

Abra **outro terminal** (mantenha o do backend aberto) e execute:

```bash
cd tagme-frontend
npm install
ng serve
```

O frontend será executado em `http://localhost:4200`.

## 🌐 Acessando a aplicação

Após ambos os serviços estarem rodando:
- Frontend: [http://localhost:4200](http://localhost:4200)
- Backend API: [http://localhost:3000](http://localhost:3000)

## 🛠️ Scripts disponíveis

### Backend (tagme-backend)
- `npm run start:dev` - Inicia o servidor em modo desenvolvimento
- `npm run build` - Compila o projeto
- `npm run start` - Inicia o servidor em modo produção

### Frontend (tagme-frontend)
- `ng serve` - Inicia o servidor de desenvolvimento
- `ng build` - Compila o projeto para produção
- `ng test` - Executa os testes unitários

## 🔧 Solução de problemas

### Porta já está em uso
Se encontrar erro de porta em uso:
- Backend: Mude a porta no arquivo de configuração ou mate o processo na porta 3000
- Frontend: Use `ng serve --port 4201` para usar uma porta diferente

### Erro de dependências
Se houver problemas com as dependências:
```bash
# Limpe o cache do npm
npm cache clean --force

# Delete node_modules e reinstale
rm -rf node_modules package-lock.json  # Linux/Mac
# ou
rmdir /s node_modules & del package-lock.json  # Windows

npm install
```

### Problemas de permissão (Linux/Mac)
Se encontrar problemas de permissão:
```bash
sudo chown -R $(whoami) ~/.npm
```

## 📝 Notas importantes

- Mantenha ambos os terminais abertos durante o desenvolvimento
- O backend deve estar rodando antes de usar o frontend
- Certifique-se de estar na pasta correta antes de executar os comandos
- Em caso de mudanças no código, ambos os serviços têm hot-reload automático

## 🧪 Ambiente de teste

- **Node.js**: v22.5.1
- **Sistema**: Windows/Linux/Mac
- **Navegadores testados**: Chrome, Firefox, Edge

---

## 📧 Suporte

Em caso de problemas, verifique:
1. Se todas as dependências estão instaladas
2. Se as portas não estão sendo usadas por outros processos
3. Se o backend está rodando antes de acessar o frontend
4. Os logs nos terminais para identificar erros específicos
