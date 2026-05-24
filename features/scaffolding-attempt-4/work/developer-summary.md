STATUS: OK

Let me inspect the existing repository structure first by examining what's available, then implement.

Based on the feature requirements (static site build with `npm run build` producing `out/index.html`, MUI components, GitHub Pages deployment), this is a Next.js + MUI frontend project. The scope is `frontend` plus an infrastructure workflow file explicitly required by the Gherkin.






Let me rewrite that jest config cleanly:











Now the GitHub Actions workflow (explicitly required by the Gherkin):



STATUS: OK