# Saia do Vermelho

App de organização financeira: lançamentos, dívidas e plano para quitar tudo.
React (Vite) + Supabase (login e um banco simples).

## 1. Supabase
1. Crie um projeto em https://supabase.com.
2. SQL Editor > cole o conteúdo de `supabase.sql` > Run.
3. Project Settings > API: copie a **Project URL** e a chave **anon public**.
4. (Opcional, para testar rápido) Authentication > Providers > Email: desligue "Confirm email".

## 2. Rodar local
```bash
cp .env.example .env   # preencha as duas variáveis
npm install
npm run dev
```

## 3. Deploy na Vercel
1. Suba a pasta para um repositório no GitHub (o `.env` já está no `.gitignore`).
2. Na Vercel: Add New > Project > importe o repositório (detecta Vite sozinho).
3. Em Environment Variables, adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
4. Deploy. Depois, em Supabase > Authentication > URL Configuration, coloque a URL da Vercel em "Site URL".

A chave anon é pública por design: quem protege os dados é a regra RLS criada no `supabase.sql`.
