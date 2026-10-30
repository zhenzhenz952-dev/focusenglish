"""Copy a declared public snapshot into site/, verifying bytes before replacing files."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.parse import urljoin,urlsplit
from urllib.request import Request,build_opener,HTTPRedirectHandler
from urllib.error import HTTPError,URLError
import argparse,hashlib,http.client,json,re,time

AGENT='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self,*args):return None

def digest_file(path):
    digest=hashlib.sha256()
    with path.open('rb') as source:
        for data in iter(lambda:source.read(65536),b''):digest.update(data)
    return digest.hexdigest()

def materialize(config,output):
    output=Path(output).resolve()
    if config.get('schemaVersion')!=1:raise ValueError('Unsupported snapshot schema')
    origin=config['origin'];base=urlsplit(origin)
    if base.scheme!='https' and not(base.scheme=='http' and base.hostname in ('127.0.0.1','localhost')):raise ValueError('Snapshot origin must use HTTPS')
    if base.username or base.password or base.query or base.fragment:raise ValueError('Invalid snapshot origin')
    pending=[];seen=set()
    for item in config['files']:
        path=item['path']
        if not isinstance(path,str) or not path or re.search(r'[\\:%?#\x00-\x1f]',path) or any(part in ('','.','..') for part in path.split('/')):raise ValueError('Unsafe output path')
        target=output/path
        if not target.resolve().is_relative_to(output) or path in seen:raise ValueError('Duplicate or escaping output path')
        seen.add(path);url=urljoin(origin,item['fetch']);source=urlsplit(url)
        if (source.scheme,source.netloc)!=(base.scheme,base.netloc) or source.query or source.fragment:raise ValueError('Cross-origin source is not allowed')
        if type(item['bytes']) is not int or not 0<=item['bytes']<=25*1024**2 or not re.fullmatch(r'[a-f0-9]{64}',item['sha256']):raise ValueError('Missing byte or digest declaration')
        pending.append((item,target,url))
    def transfer(entry):
        item,target,url=entry
        if target.is_file() and target.stat().st_size==item['bytes'] and digest_file(target)==item['sha256']:return 'reused'
        target.parent.mkdir(parents=True,exist_ok=True);partial=target.with_name(target.name+'.part')
        if partial.is_symlink():raise ValueError('Unexpected temporary symlink')
        for attempt in range(3):
            try:
                request=Request(url,headers={'User-Agent':AGENT,'Cache-Control':'no-cache'})
                with build_opener(NoRedirect()).open(request,timeout=30) as response,partial.open('wb') as sink:
                    if response.status!=200 or response.geturl()!=url:raise ValueError('Unexpected source response')
                    digest=hashlib.sha256();count=0
                    while True:
                        data=response.read(65536)
                        if not data:break
                        count+=len(data)
                        if count>item['bytes']:raise ValueError('Oversized source: '+item['path'])
                        digest.update(data);sink.write(data)
                if count!=item['bytes'] or digest.hexdigest()!=item['sha256']:raise ValueError('Source checksum mismatch: '+item['path'])
                partial.replace(target);print('Verified '+item['path'],flush=True);return 'downloaded'
            except HTTPError as error:
                if error.code not in (429,500,502,503,504) or attempt==2:raise
            except (URLError,OSError,http.client.HTTPException):
                if attempt==2:raise
            finally:
                if partial.exists():partial.unlink()
            time.sleep(attempt+1)
    with ThreadPoolExecutor(max_workers=3) as executor:results=list(executor.map(transfer,pending))
    output.mkdir(parents=True,exist_ok=True);(output/'.nojekyll').write_bytes(b'')
    result={'verified':len(results),'downloaded':results.count('downloaded'),'reused':results.count('reused'),'sourceVersion':config.get('sourceVersion')}
    print(json.dumps(result),flush=True);return result

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--config',default='deploy/assets.json');parser.add_argument('--output',default='site')
    args=parser.parse_args();materialize(json.loads(Path(args.config).read_text(encoding='utf-8')),args.output)
