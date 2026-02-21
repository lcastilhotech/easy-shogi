# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]: 認証
      - heading "Acesso Easy Shogi" [level=1] [ref=e6]
    - generic [ref=e7]:
      - banner [ref=e8]:
        - generic [ref=e9]: Entre
        - paragraph [ref=e10]: Bem-vindo de volta
      - generic [ref=e11]:
        - generic [ref=e12]:
          - text: E-mail
          - textbox "seu@email.com" [ref=e13]: nonexistent@example.com
        - generic [ref=e14]:
          - text: Senha
          - textbox "••••••••" [ref=e15]: wrongpassword
        - paragraph [ref=e16]: Invalid API key
        - button "Processando..." [disabled] [ref=e17]
      - button "Não tem conta? Cadastre-se" [ref=e19]
    - contentinfo [ref=e20]: Tradição • Minimalismo • Maestria
  - button "Open Next.js Dev Tools" [ref=e26] [cursor=pointer]:
    - img [ref=e27]
  - alert [ref=e30]
```