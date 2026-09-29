"""Gera src/data/presidente/<ano>.json a partir das páginas em .cache/."""
import json, os, re, urllib.parse
import parse
from parse import extrai

AQUI = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(AQUI, '..', '..', 'src', 'data')
jobs = json.load(open(os.path.join(AQUI, 'jobs.json')))

# Correções manuais: (uf, ano) -> {"set": {numero: campos}, "add": [candidato], "remove": [numero]}
CORRECOES = json.load(open(os.path.join(AQUI, 'correcoes.json')))
# Gerado por fotos_links.py + fotos_baixar.py: "<ano>-<numero>" -> {foto, fotoCredito}
FOTOS_JSON = os.path.join(AQUI, 'fotos.json')
FOTOS = json.load(open(FOTOS_JSON)) if os.path.exists(FOTOS_JSON) else {}

def aplica(uf, ano, cands):
    c = CORRECOES.get(f'{uf}-{ano}', {})
    por_num = {x['numero']: x for x in cands}
    for n in c.get('remove', []): por_num.pop(n, None)
    for n, campos in c.get('set', {}).items(): por_num[n].update(campos)
    for novo in c.get('add', []): por_num[novo['numero']] = {'vice': None, **novo}
    return sorted(por_num.values(), key=lambda x: x['nome'].lower())

def fonte(titulo):
    return 'https://pt.wikipedia.org/wiki/' + urllib.parse.quote(titulo.replace(' ', '_'))

presid, relatorio = {}, []
for uf, ano, titulo in jobs:
    f = os.path.join(AQUI, '.cache', f'{uf}-{ano}.html')
    if not os.path.exists(f):
        relatorio.append(f'SEM PÁGINA {ano}'); continue
    parse.AVISOS.clear()
    cands = aplica(uf, ano, extrai(open(f).read(), ano))
    relatorio += [f'AVISO {ano}: {a}' for a in dict.fromkeys(parse.AVISOS)]
    if not 2 <= len(cands) <= 15: relatorio.append(f'CONTAGEM {ano}: {len(cands)}')
    for c in cands:
        if c['vice'] and c['vice'] == c['nome']: relatorio.append(f'VICE=NOME {ano} {c}')
    for c in cands:
        c.update(FOTOS.get(f"{ano}-{c['numero']}", {}))
    presid[ano] = {'ano': ano, 'fonte': fonte(titulo), 'candidatos': cands}

os.makedirs(os.path.join(OUT, 'presidente'), exist_ok=True)
for ano, d in presid.items():
    with open(os.path.join(OUT, 'presidente', f'{ano}.json'), 'w') as fp:
        json.dump(d, fp, ensure_ascii=False, indent=2); fp.write('\n')

print('\n'.join(relatorio) or 'sem anomalias')
