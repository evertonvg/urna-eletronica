"""Baixa (com cache) as páginas da Wikipédia de cada eleição listada em jobs.json."""
import json, os, sys, time, urllib.error, urllib.parse, urllib.request

AQUI = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(AQUI, '.cache')
UA = {'User-Agent': 'UrnaEletronicaSimulator/0.1 (educational project; python-urllib)'}


def api(params):
    q = urllib.parse.urlencode({**params, 'format': 'json', 'formatversion': 2, 'maxlag': 5})
    req = urllib.request.Request('https://pt.wikipedia.org/w/api.php?' + q, headers=UA)
    for _ in range(6):
        try:
            return json.load(urllib.request.urlopen(req, timeout=30))
        except urllib.error.HTTPError as e:
            if e.code != 429:
                raise
            espera = int(e.headers.get('Retry-After') or 20)
            print(f'429, aguardando {espera}s', file=sys.stderr)
            time.sleep(espera)
    raise SystemExit('Wikipédia continua limitando as requisições; tente mais tarde.')


def main():
    os.makedirs(CACHE, exist_ok=True)
    forcar = '--forcar' in sys.argv
    for uf, ano, titulo in json.load(open(os.path.join(AQUI, 'jobs.json'))):
        destino = os.path.join(CACHE, f'{uf}-{ano}.html')
        if os.path.exists(destino) and not forcar:
            continue
        try:
            html = api({'action': 'parse', 'page': titulo, 'prop': 'text', 'redirects': 1})['parse']['text']
            open(destino, 'w').write(html)
            print('ok', uf, ano)
        except Exception as e:
            print('ERRO', uf, ano, titulo, e, file=sys.stderr)
        time.sleep(1.5)


if __name__ == '__main__':
    main()
