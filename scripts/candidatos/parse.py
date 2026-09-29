import json, re, sys, os
from html.parser import HTMLParser

# Sigla (e variações) -> (sigla oficial, número). Números de partidos em cargos majoritários.
PARTIDOS = {
 'PT':13,'PSDB':45,'PMDB':15,'MDB':15,'PFL':25,'DEM':25,'PRD':25,'PPB':11,'PP':11,'PDT':12,'PTB':14,
 'PSB':40,'PCdoB':65,'PPS':23,'Cidadania':23,'PV':43,'PSOL':50,'PSTU':16,'PCB':21,'PCO':29,
 'PL':22,'PR':22,'PRB':10,'Republicanos':10,'PSL':17,'PSC':20,'PMN':33,'Mobiliza':33,'PRP':44,
 'UNIÃO':44,'União':44,'PSDC':27,'DC':27,'PRTB':28,'PHS':31,'PSN':31,'PTdoB':70,'Avante':70,
 'PTC':36,'PRN':36,'Agir':36,'PTN':19,'Podemos':19,'PODE':19,'PSD':55,'PEN':51,'Patriota':51,
 'PROS':90,'SD':77,'Solidariedade':77,'NOVO':30,'Novo':30,'REDE':18,'Rede':18,'PST':18,'PPL':54,
 'PMB':35,'MISSÃO':14,'Missão':14,'DEMOCRATA':35,'Democrata':35,'UP':80,'PRONA':56,'PAN':26,'PGT':30,
}
ALIAS = {'PC do B':'PCdoB','PT do B':'PTdoB','PCDOB':'PCdoB','PTDOB':'PTdoB','Rede Sustentabilidade':'REDE',
 'Partido Novo':'NOVO','União Brasil':'UNIÃO','Podemos (Brasil)':'Podemos','Solidariedade':'SD',
 'Cidadania':'PPS','Republicanos':'PRB','Patriota':'PEN','Avante':'PTdoB','Democracia Cristã':'DC',
 'Mobiliza':'PMN','Agir':'PTC','PODE':'Podemos','Novo':'NOVO','Rede':'REDE','União':'UNIÃO','Podemos':'Podemos'}
# nome oficial exibido, por número e ano (siglas mudam com o tempo)
def sigla_no_ano(sig, ano):
    s = ALIAS.get(sig, sig)
    ren = {
      'PMDB': 'MDB' if ano>=2018 else 'PMDB', 'PFL': 'DEM' if ano>=2008 else 'PFL',
      'DEM': 'DEM' if ano>=2008 else 'PFL', 'PPB': 'PP' if ano>=2004 else 'PPB',
      'PP': 'PP' if ano>=2004 else 'PPB', 'PL': 'PL' if (ano<2008 or ano>=2020) else 'PR',
      'PR': 'PL' if (ano<2008 or ano>=2020) else 'PR', 'PRB':'REPUBLICANOS' if ano>=2020 else 'PRB',
      'PPS':'CIDADANIA' if ano>=2020 else 'PPS','PEN':'PATRIOTA' if ano>=2018 else 'PEN',
      'PTdoB':'AVANTE' if ano>=2018 else 'PTdoB','PSDC':'DC' if ano>=2018 else 'PSDC','DC':'DC' if ano>=2018 else 'PSDC',
      'PTN':'PODE' if ano>=2018 else 'PTN','Podemos':'PODE' if ano>=2018 else 'PTN',
      'PTC':'AGIR' if ano>=2024 else 'PTC','PMN':'MOBILIZA' if ano>=2024 else 'PMN',
      'SD':'SOLIDARIEDADE','Missão':'MISSÃO','Democrata':'DEMOCRATA','PMB':'DEMOCRATA' if ano>=2026 else 'PMB','REDE':'REDE','NOVO':'NOVO','UNIÃO':'UNIÃO',
    }
    return ren.get(s, s)

PARTY_RE = '|'.join(sorted((re.escape(k) for k in list(PARTIDOS)+list(ALIAS)), key=len, reverse=True))

def acha_partido(txt):
    for m in re.finditer(r'\(([^()]{1,40})\)', txt):
        inner = m.group(1).strip()
        if inner in PARTIDOS or inner in ALIAS: return inner
    t = txt.strip()
    if t in PARTIDOS or t in ALIAS: return t
    m = re.match(rf'^({PARTY_RE})\b', t)
    return m.group(1) if m else None

class Tables(HTMLParser):
    def __init__(s):
        super().__init__(); s.tables=[]; s.stack=[]; s.cell=None; s.skip=0
    def handle_starttag(s,tag,a):
        a=dict(a)
        if tag=='table': s.stack.append([])
        elif tag=='tr' and s.stack: s.stack[-1].append([])
        elif tag in('td','th') and s.stack and s.stack[-1]:
            s.cell={'h':tag=='th','t':'','span':int(re.sub(r'\D','',a.get('colspan','1')) or 1)}
            s.stack[-1][-1].append(s.cell)
        elif tag in('sup','style') : s.skip+=1
        elif tag=='br' and s.cell: s.cell['t']+=' '
    def handle_endtag(s,tag):
        if tag=='table' and s.stack: s.tables.append(s.stack.pop())
        elif tag in('td','th'): s.cell=None
        elif tag in('sup','style') and s.skip: s.skip-=1
    def handle_data(s,d):
        if s.cell is not None and not s.skip: s.cell['t']+=d

LIXO = re.compile(r'total|votos|brancos?|nulos?|absten|comparec|eleitores|seç|válidos|não participaram|segundo turno', re.I)

def limpa_nome(t):
    t = re.sub(r'\([^()]*\)', '', t)
    t = re.sub(r'\[[^\]]*\]', '', t)
    t = re.sub(r'\s+', ' ', t).strip(' *†‡–-')
    return t

EXCLUIR = re.compile(r'vereador|câmara|legislat|deputad|senad|governad|pesquisa|sondag|pré-candidat|intenç|debate|ver também|referênc|notas|bancada|assembleia|conselh|proporcional|renúncia|indeferi|desist|impugna|rendimento|financ|por partido|apoios|plano de mídia|ligações', re.I)

def secoes_validas(html):
    partes = re.split(r'(?=<h[2-4][ >])', html)
    ok = []; excluido_nivel = None
    for parte in partes:
        m = re.match(r'<h([2-4])[^>]*>(.*?)</h[2-4]>', parte, re.S)
        if not m: ok.append(parte); continue
        nivel = int(m.group(1)); titulo = re.sub('<[^>]+>', '', m.group(2))
        if excluido_nivel is not None and nivel > excluido_nivel: continue
        excluido_nivel = None
        if EXCLUIR.search(titulo): excluido_nivel = nivel; continue
        ok.append(parte)
    return ''.join(ok)

NOME_RUIM = re.compile(r'não disponível|desconhecid|a definir|partido|coligad|coligação|"|“|”|frente|aliança|união por|^vice|candidat', re.I)

AVISOS = []
NOME_PARTIDO = re.compile(r'^([^()]{2,45}?)\s*\(([^()]{1,30})\)\s*$')

def linhas(tb):
    """Gera (tem_vice, cells) para cada linha de dados de uma tabela com cabeçalho de candidato."""
    header = None
    for row in tb:
        textos = [c['t'].strip() for c in row]
        if row and all(c['h'] for c in row) and any(re.search(r'candidat|^prefeit|^presidente', t, re.I) for t in textos):
            header = textos; continue
        if header is None: continue
        yield header, [c['t'].strip() for c in row if not (c['h'] and len(row) == 1)]

def candidato_da_linha(header, cells):
    tem_vice = any(re.search(r'vice', h, re.I) for h in header)
    tem_num = any(re.fullmatch(r'n[º°o.]*|número', h.strip(), re.I) for h in header)
    num = next((c for c in cells if re.fullmatch(r'\d{2}', c)), None) if tem_num else None
    cells = [re.sub(r'\s*[-–(]?\s*(re)?eleit[oa]\)?\s*$', '', c, flags=re.I) for c in cells]
    cells = [re.sub(rf'^(.{{2,40}}?)\s+({PARTY_RE})$', r'\1 (\2)', c) for c in cells]
    pares = [(i, NOME_PARTIDO.match(c)) for i, c in enumerate(cells)]
    pares = [(i, m) for i, m in pares if m and acha_partido('(' + m.group(2) + ')')]
    if pares:
        i, m = pares[0]
        nome, sig = m.group(1), acha_partido('(' + m.group(2) + ')')
        vice = pares[1][1].group(1) if len(pares) > 1 and tem_vice else None
    else:
        nomes = [c for c in cells if c and not re.search(r'\d', c) and not acha_partido(c)]
        if not nomes: return None
        nome = nomes[0]
        sig = acha_partido(nome) or next((acha_partido(c) for c in cells if c.strip() in PARTIDOS or c.strip() in ALIAS), None)
        vice = nomes[1] if tem_vice and len(nomes) > 1 else None
    if sig is None or LIXO.search(nome): return None
    nome = limpa_nome(nome); vice = limpa_nome(vice) if vice else None
    if not nome or len(nome) > 45 or re.search(r'\d', nome) or NOME_RUIM.search(nome): return None
    if vice and (LIXO.search(vice) or NOME_RUIM.search(vice) or len(vice) > 45): vice = None
    base = ALIAS.get(sig, sig)
    numero_partido = str(PARTIDOS.get(base, PARTIDOS.get(sig)))
    numero = numero_partido
    if num and num != numero_partido:
        # A linha é de uma chapa com outro número: o nome achado é do vice, não do titular.
        return None
    tier = 2 if tem_vice else (1 if pares else 0)
    return tier, {'numero': numero, 'nome': nome, 'partido': sigla_no_ano(sig, 0), 'sig': sig, 'vice': vice}

def mesma_pessoa(a, b):
    pa = {w.lower() for w in re.findall(r'\w{3,}', a)}; pb = {w.lower() for w in re.findall(r'\w{3,}', b)}
    return bool(pa & pb)

def extrai(html, ano):
    p = Tables(); p.feed(secoes_validas(html))
    todos = []
    for tb in p.tables:
        cab = ' '.join(c['t'] for row in tb[:3] for c in row if c['h'])
        if re.search(r'vereador|deputad|senad|governad', cab, re.I): continue
        for header, cells in linhas(tb):
            r = candidato_da_linha(header, cells)
            if r: todos.append(r)
    usados = []
    for tier in (2, 1, 0):
        usados = [c for t, c in todos if t == tier]
        if len({c['numero'] for c in usados}) >= 2: break
    vices = {c['vice'] for _, c in todos if c['vice']}
    titulares = {c['nome'] for c in usados}
    # Quem só aparece como vice em outra tabela não é titular.
    usados = [c for c in usados if c['nome'] not in vices or c['nome'] in titulares and sum(1 for x in usados if x['nome'] == c['nome'] and x['vice']) > 0]
    usados = [c for c in usados if c['nome'] not in vices]
    achados = {}
    for c in usados:
        c['partido'] = sigla_no_ano(c.pop('sig'), ano)
        atual = achados.get(c['numero'])
        if atual is None: achados[c['numero']] = c; continue
        if len(c['nome']) < len(atual['nome']) and mesma_pessoa(c['nome'], atual['nome']): atual['nome'] = c['nome']
        if c['vice'] and (not atual['vice'] or len(c['vice']) < len(atual['vice'])): atual['vice'] = c['vice']
    for c in achados.values():
        # "Vice" que é o próprio titular com outro nome: tabela desalinhada.
        if c['vice'] and len(set(re.findall(r'\w{3,}', c['vice'].lower())) & set(re.findall(r'\w{3,}', c['nome'].lower()))) >= 2:
            c['nome'] = min(c['nome'], c['vice'], key=len); c['vice'] = None
    return sorted(achados.values(), key=lambda c: c['nome'])

if __name__ == '__main__':  # uso: python3 parse.py .cache/SP-2024.html
    for f in sys.argv[1:]:
        uf, ano = os.path.basename(f)[:-5].split('-')
        r = extrai(open(f).read(), int(ano))
        print(f'== {uf} {ano}: {len(r)}')
        for c in r: print('  ', c['numero'], c['partido'], '|', c['nome'], '|', c['vice'])
