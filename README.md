# ESG e Tal — Site + Admin CMS

> Site institucional com painel de administração oculto, alimentado por **Firebase Realtime Database** e publicado automaticamente no **GitHub Pages** via GitHub Actions.

---

## Estrutura do projeto

```
├── index.html            ← Site principal (não edite logos/imagens aqui)
├── main.js               ← Lógica Alpine.js + dados do site
├── admin.js              ← Painel CMS oculto (Easter egg: Ctrl+Shift+A)
├── firebase-config.js    ← ⚠️ SUAS credenciais Firebase (não comite em público)
├── styles.css            ← Estilos extras (opcional, inline no index.html)
└── .github/
    └── workflows/
        └── deploy.yml    ← Deploy automático para GitHub Pages
```

---

## 1 — Configurar o Firebase

### 1.1 Criar projeto

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em **Adicionar projeto** → dê um nome → crie
3. Na aba lateral, vá em **Compilação → Realtime Database**
4. Clique em **Criar banco de dados** → escolha o servidor mais próximo → modo de **produção**
5. Na aba lateral, vá em **Compilação → Authentication → Sign-in method**
6. Ative **E-mail/senha**
7. Vá em **Authentication → Usuários → Adicionar usuário** e crie sua conta de admin

### 1.2 Regras do Realtime Database

Em **Realtime Database → Regras**, substitua pelo seguinte:

```json
{
  "rules": {
    ".read": true,
    ".write": "auth != null"
  }
}
```

> **Por quê `.read: true`?** O site é público — qualquer pessoa pode ler os dados (notícias, artigos etc.). Apenas usuários autenticados podem escrever.

### 1.3 Obter as credenciais

1. Em **Configurações do projeto** (ícone de engrenagem) → **Geral**
2. Role até **Seus aplicativos** → clique em `</>` (Web)
3. Registre o app (nome livre) — **não** ative o Firebase Hosting
4. Copie o objeto `firebaseConfig`

### 1.4 Preencher `firebase-config.js`

Abra o arquivo e substitua os valores:

```js
const firebaseConfig = {
  apiKey:            "AIzaSy...",
  authDomain:        "seu-projeto.firebaseapp.com",
  databaseURL:       "https://seu-projeto-default-rtdb.firebaseio.com",
  projectId:         "seu-projeto",
  storageBucket:     "seu-projeto.appspot.com",
  messagingSenderId: "123456789012",
  appId:             "1:123456789012:web:abc123"
};
```

> **Segurança:** As chaves do Firebase para web são públicas por design — a segurança real vem das **Regras do Database**, não do sigilo das chaves. Se o repositório for público, isso é normal e esperado.

---

## 2 — Publicar no GitHub Pages

### 2.1 Criar repositório

```bash
git init
git add .
git commit -m "chore: initial deploy"
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git push -u origin main
```

### 2.2 Ativar GitHub Pages

1. No repositório, vá em **Settings → Pages**
2. Em **Source**, selecione **GitHub Actions**
3. Salve

### 2.3 Deploy automático

O arquivo `.github/workflows/deploy.yml` dispara automaticamente a cada `git push` para `main`. Você também pode clicar em **Actions → Deploy to GitHub Pages → Run workflow** para disparar manualmente.

O site ficará disponível em:

```
https://SEU_USUARIO.github.io/SEU_REPO/
```

---

## 3 — Usar o Painel Admin

### Ativar

No site publicado (ou em localhost), pressione:

```
Ctrl + Shift + A
```

Um modal escuro aparecerá sobre o site. O site continua totalmente visível para visitantes — nada indica que o painel existe.

### Login

Use o e-mail e senha criados no Firebase Authentication (passo 1.1).

### O que você pode editar em tempo real

| Seção | O que edita |
|-------|-------------|
| **Notícias** | Manchetes, datas e textos das notícias 1 e 2 (PT + EN) |
| **Notícias Extras** | Adiciona/remove notícias dinâmicas ilimitadas (PT + EN) |
| **Pesquisa** | Manchete, autor, CTA e parágrafos do artigo em destaque (PT + EN) |
| **Artigos Extras** | Adiciona/remove artigos de pesquisa dinâmicos (PT + EN) |
| **Hero Stats** | Os 4 números/badges do hero (valor + label PT + label EN) |

### Como funciona a sincronização

1. Você salva no painel → dados vão para o Firebase Realtime Database
2. O Firebase dispara um evento em **todos os visitantes abertos** no momento
3. A página atualiza os dados via Alpine.js **sem recarregar**

---

## 4 — Desenvolvimento local

Você precisa de um servidor HTTP local (o Firebase não funciona com `file://`):

```bash
# Opção A — Python (já instalado na maioria dos sistemas)
python3 -m http.server 8080

# Opção B — Node.js
npx serve .

# Opção C — VS Code
# Instale a extensão "Live Server" e clique em "Go Live"
```

Acesse `http://localhost:8080` e pressione `Ctrl+Shift+A`.

---

## 5 — Fluxo de trabalho dia a dia

```
Editar firebase-config.js
       ↓
git add . && git commit -m "feat: ..."
       ↓
git push origin main
       ↓
GitHub Actions faz o deploy (~30 segundos)
       ↓
Site atualizado em https://SEU_USUARIO.github.io/SEU_REPO/
       ↓
Abrir site → Ctrl+Shift+A → Login → Editar → Salvar
       ↓
Todos os visitantes veem as mudanças em tempo real
```

---

## 6 — Estrutura dos dados no Firebase

```
siteContent/
├── news/
│   ├── pt/
│   │   ├── item1/   { date, headline, link, body, body2 }
│   │   └── item2/   { date, headline, body }
│   └── en/
│       ├── item1/   { ... }
│       └── item2/   { ... }
├── dynamicNews/
│   └── {id}/        { id, date:{pt,en}, headline:{pt,en}, body:{pt,en},
│                       linkUrl, linkText:{pt,en}, createdAt }
├── research/
│   ├── pt/item1/    { date, headline, author, cta, body1, body2, body3 }
│   └── en/item1/    { ... }
├── dynamicResearch/
│   └── {id}/        { id, date:{pt,en}, headline:{pt,en}, author:{pt,en},
│                       body:{pt,en}, ctaUrl, ctaText:{pt,en}, createdAt }
└── heroStats/       [ {value, label_pt, label_en}, ... ]  (array de 4)
```

---

## 7 — FAQ

**O painel some depois de salvar/recarregar?**  
Sim — ele só aparece quando você pressiona `Ctrl+Shift+A`. Isso é intencional; para visitantes, ele é completamente invisível.

**Posso ter vários admins?**  
Sim. Crie quantos usuários quiser no Firebase Authentication. Todos usam o mesmo painel.

**Como faço backup dos dados?**  
No console Firebase → Realtime Database → ⋮ (três pontos) → **Exportar JSON**.

**O site quebra se o Firebase estiver fora do ar?**  
Não. Os dados padrão estão embutidos no `main.js`. O Firebase enriquece/atualiza esses dados quando disponível — se estiver offline, o site exibe o conteúdo original.

**Como adiciono imagens às notícias?**  
Por ora, use URLs externas (ex: imagens no GitHub, Cloudinary, ou o próprio `esgetal.com.br`). O campo "URL do Link" nas notícias dinâmicas pode apontar para um artigo com imagem.

---

## Licença

Propriedade de **ESG e Tal Consultancy** — uso interno.
