"""Associa cada candidato ao título do seu artigo na Wikipédia, usando os links das páginas das eleições."""
import html as H, json, os, re, unicodedata

AQUI = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(AQUI, '..', '..', 'src', 'data', 'presidente')

def norm(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z ]', ' ', s).split()

def links(pagina):
    out = []
    for href, attrs, texto in re.findall(r'<a href="/wiki/([^"#]+)"([^>]*)>(.*?)</a>', pagina, re.S):
        if ':' in href: continue
        titulo = re.search(r'title="([^"]+)"', attrs)
        out.append((H.unescape(titulo.group(1)) if titulo else href, H.unescape(re.sub('<[^>]+>', '', texto)).strip()))
    return out

def melhor(nome, vice, cands):
    alvo = set(norm(nome))
    pontos = []
    for titulo, texto in cands:
        if re.search(r'eleiç|partido|brasil$|^\d', titulo, re.I): continue
        t, x = set(norm(titulo)), set(norm(texto))
        if norm(texto) == norm(nome): pontos.append((3, titulo))
        elif alvo and alvo <= x: pontos.append((2, titulo))
        elif alvo and alvo <= t: pontos.append((1, titulo))
    pontos.sort(key=lambda p: -p[0])
    return pontos[0][1] if pontos else None

res = {}
for f in sorted(os.listdir(DATA)):
    ano = f[:4]
    pagina = open(os.path.join(AQUI, '.cache', f'BR-{ano}.html')).read()
    ls = links(pagina)
    for c in json.load(open(os.path.join(DATA, f)))['candidatos']:
        res[f"{ano}-{c['numero']}"] = {'nome': c['nome'], 'artigo': melhor(c['nome'], c['vice'], ls)}
json.dump(res, open(os.path.join(AQUI, 'fotos_artigos.json'), 'w'), ensure_ascii=False, indent=1)
for k, v in res.items(): print(k, '|', v['nome'], '->', v['artigo'])
