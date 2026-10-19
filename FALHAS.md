# FALHAS — animabooksf

| data | o que quebrou | menor correção | prompt \| infra |
|---|---|---|---|
| 2026-10-19 | public/sprites/veiculo_bicicleta.svg não abria no navegador (atributo rx repetido na mesma tag) | remover o rx duplicado; validar todo SVG com parser XML antes de publicar | infra |
| 2026-10-19 | App fora do ar (Vercel 402) por depender de servidor (/api + arquivos no disco) | export estático + localStorage + catálogo gerado no build, publicado no GitHub Pages | infra |
