from pathlib import Path
import hashlib,importlib.util,tempfile,threading,unittest
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('transfer',ROOT/'scripts/materialize_site.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)

class TransferTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.out=Path(self.tmp.name)/'site';self.requests=[];owner=self
        class Handler(BaseHTTPRequestHandler):
            def log_message(self,*args):pass
            def do_GET(self):
                owner.requests.append(self.path)
                data=b'bad' if self.path=='/corrupt' else b'<html>real page</html>'
                self.send_response(200);self.send_header('Content-Type','application/octet-stream');self.end_headers();self.wfile.write(data)
        self.server=ThreadingHTTPServer(('127.0.0.1',0),Handler);self.thread=threading.Thread(target=self.server.serve_forever,daemon=True);self.thread.start()
        self.origin=f'http://127.0.0.1:{self.server.server_port}/';self.data=b'<html>real page</html>'
    def tearDown(self):self.server.shutdown();self.server.server_close();self.thread.join();self.tmp.cleanup()
    def config(self,path='index.html',fetch='page.bin'):
        return {'schemaVersion':1,'origin':self.origin,'files':[{'path':path,'fetch':fetch,'bytes':len(self.data),'sha256':hashlib.sha256(self.data).hexdigest()}]}
    def test_exact_binary_document_is_saved_under_its_canonical_html_name(self):
        module.materialize(self.config(),self.out)
        self.assertEqual((self.out/'index.html').read_bytes(),self.data)
        self.assertEqual(self.requests,['/page.bin'])
    def test_a_second_run_reuses_verified_repository_files_without_network(self):
        module.materialize(self.config(),self.out);self.requests.clear()
        module.materialize(self.config(),self.out)
        self.assertEqual(self.requests,[])
    def test_corrupt_source_never_replaces_an_existing_file(self):
        self.out.mkdir();(self.out/'index.html').write_bytes(b'previous release')
        with self.assertRaises(ValueError):module.materialize(self.config(fetch='corrupt'),self.out)
        self.assertEqual((self.out/'index.html').read_bytes(),b'previous release')
        self.assertFalse(list(self.out.glob('*.part')))
    def test_unsafe_output_or_cross_origin_source_is_rejected_before_download(self):
        for path,fetch in [('../outside','page.bin'),('/absolute','page.bin'),('index.html','https://elsewhere.test/file')]:
            with self.assertRaises(ValueError):module.materialize(self.config(path,fetch),self.out)
        self.assertEqual(self.requests,[])

if __name__=='__main__':unittest.main()
