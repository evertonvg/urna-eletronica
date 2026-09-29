"""Busca a imagem principal do artigo de cada candidato e baixa uma miniatura com autor e licença."""
import html as H, json, os, re, sys, time, urllib.error, urllib.parse, urllib.request
from baixar import UA, api

AQUI = os.path.dirname(os.path.abspath(__file__))
PUBLIC = os.path.join(AQUI, '..', '..', 'public', 'candidatos')
LARGURA = 240

artigos = json.load(open(os.path.join(AQUI, 'fotos_artigos.json')))
titulos = sorted({v['artigo'] for v in artigos.values() if v['artigo']})

# artigo -> arquivo de imagem
imagem_do_artigo = {}
for i in range(0, len(titulos), 50):
    d = api({'action': 'query', 'prop': 'pageimages', 'piprop': 'name', 'redirects': 1, 'titles': '|'.join(titulos[i:i + 50])})
    destino = {t: t for t in titulos[i:i + 50]}
    for r in d['query'].get('normalized', []) + d['query'].get('redirects', []):
        for orig, atual in list(destino.items()):
            if atual == r['from']: destino[orig] = r['to']
    por_titulo = {p['title']: p.get('pageimage') for p in d['query']['pages']}
    for orig, atual in destino.items():
        imagem_do_artigo[orig] = por_titulo.get(atual)
    time.sleep(1)

# arquivo -> miniatura + metadados
arquivos = sorted({a for a in imagem_do_artigo.values() if a})
info = {}
for i in range(0, len(arquivos), 50):
    d = api({'action': 'query', 'prop': 'imageinfo', 'iiprop': 'url|extmetadata', 'iiurlwidth': LARGURA,
             'iiextmetadatafilter': 'Artist|LicenseShortName|NonFree', 'titles': '|'.join('Ficheiro:' + a for a in arquivos[i:i + 50])})
    for p in d['query']['pages']:
        if 'imageinfo' not in p: continue
        ii = p['imageinfo'][0]; meta = ii.get('extmetadata', {})
        nome = p['title'].split(':', 1)[1].replace(' ', '_')
        limpa = lambda k: re.sub(r'\s+', ' ', H.unescape(re.sub('<[^>]+>', '', meta.get(k, {}).get('value', '')))).strip()
        info[nome] = {'thumb': ii['thumburl'], 'pagina': ii['descriptionurl'], 'autor': limpa('Artist') or None,
                      'licenca': limpa('LicenseShortName') or None, 'naoLivre': bool(meta.get('NonFree'))}
    time.sleep(1)

resultado = {}
for chave, v in artigos.items():
    ano, numero = chave.split('-')
    arq = imagem_do_artigo.get(v['artigo']) if v['artigo'] else None
    meta = info.get(arq.replace(' ', '_')) if arq else None
    if not meta or meta['naoLivre'] or meta['licenca'] in (None, 'Conteúdo restrito'):
        print('sem foto', chave, v['nome'], arq, file=sys.stderr); continue
    ext = os.path.splitext(urllib.parse.urlparse(meta['thumb']).path)[1].lower() or '.jpg'
    rel = f'{ano}/{numero}{ext}'
    destino = os.path.join(PUBLIC, rel)
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    if not os.path.exists(destino):
        for tentativa in range(5):
            try:
                open(destino, 'wb').write(urllib.request.urlopen(urllib.request.Request(meta['thumb'], headers=UA), timeout=30).read())
                break
            except urllib.error.HTTPError as e:
                if e.code != 429: raise
                time.sleep(int(e.headers.get('Retry-After') or 10))
        time.sleep(0.5)
    resultado[chave] = {'foto': f'/candidatos/{rel}', 'fotoCredito': {
        'autor': meta['autor'], 'licenca': meta['licenca'], 'fonte': meta['pagina']}}

json.dump(resultado, open(os.path.join(AQUI, 'fotos.json'), 'w'), ensure_ascii=False, indent=1)
print(len(resultado), 'fotos de', len(artigos), 'candidatos')
