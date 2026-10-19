// 공식 원문 JSON의 누락·커밋 불일치를 로컬에서 검사합니다.
// 업로드·제출·서버 실행·로그인·AI 호출은 하지 않습니다.
import {readFileSync,realpathSync,statSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {resolve,relative,isAbsolute} from 'node:path';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

export const requiredFiles = [
  'on-client/student/extension.mjs',
  'on-client/public/app.js',
  'on-client/src/server.mjs',
  'on-client/src/ai/service.mjs',
  'on-client/src/ai/vault-service.mjs',
  'on-client/src/ai/app-authorization.mjs',
  'on-client/vendor/clco-http.mjs',
  'on-client/src/connection/native-context.mjs',
  'on-client/src/connection/native-login.mjs',
  'on-client/src/ai/credential-vault.mjs',
  'on-client/src/engine/sdp-host.mjs',
  'on-client/src/engine/sdp-host-config.mjs',
];
const fail = code => { throw Object.assign(new Error(code), {code}); };
const sha = (kind,bytes) => createHash('sha1').update(kind+' '+bytes.length+'\0').update(bytes).digest('hex');
export function inspectSource(source, expectedBlob) {
  if(source?.schema!=='alekov.student-source.v1'||!/^[a-f0-9]{40}$/.test(source.commit)||
    typeof source.archiveGzBase64!=='string'||typeof source.commitObjectBase64!=='string') fail('SOURCE_FORMAT_INVALID');
  const object=Buffer.from(source.commitObjectBase64,'base64');
  if(sha('commit',object)!==source.commit) fail('COMMIT_OBJECT_MISMATCH');
  let tar;
  try { tar=gunzipSync(Buffer.from(source.archiveGzBase64,'base64'),{maxOutputLength:64*1024*1024}); }
  catch { fail('SOURCE_ARCHIVE_INVALID'); }
  const found=new Map();
  for(let offset=0;offset+512<=tar.length;) {
    const header=tar.subarray(offset,offset+512);
    if(header.every(n=>n===0)) break;
    const field=(start,length)=>header.subarray(start,start+length).toString('utf8').split('\0')[0];
    const sizeText=field(124,12).trim();
    if(!/^[0-7]+$/.test(sizeText)) fail('SOURCE_ARCHIVE_INVALID');
    const size=parseInt(sizeText,8),start=offset+512,end=start+size;
    if(!Number.isSafeInteger(size)||end>tar.length) fail('SOURCE_ARCHIVE_INVALID');
    const stored=parseInt(field(148,8).trim(),8);
    const sum=header.reduce((n,b,i)=>n+(i>=148&&i<156?32:b),0);
    if(stored!==sum) fail('SOURCE_ARCHIVE_INVALID');
    const name=field(0,100);
    // 공식 도구의 필수 경로는 모두 100바이트 이하이므로 PAX 경로 확장이 필요 없다.
    if(requiredFiles.some(p=>'repo/'+p===name)) {
      const path=name.slice(5);
      if(found.has(path)||![0,48].includes(header[156])) fail('SOURCE_ARCHIVE_INVALID');
      found.set(path,sha('blob',tar.subarray(start,end)));
    }
    offset=start+Math.ceil(size/512)*512;
  }
  const missing=requiredFiles.filter(p=>!found.has(p));
  const mismatched=requiredFiles.filter(p=>found.has(p)&&found.get(p)!==expectedBlob(source.commit,p));
  return {ok:!missing.length&&!mismatched.length,commit:source.commit,checkedFiles:requiredFiles.length,missing,mismatched};
}
export function run(args) {
  if(args.length!==1) fail('USAGE: node on-client/student/verify-stage17-source.mjs <프로젝트 밖의 공식 JSON 경로>');
  const root=realpathSync(fileURLToPath(new URL('../../',import.meta.url)));
  const input=realpathSync(resolve(args[0])),rel=relative(root,input);
  if(!rel||rel!=='..'&&!rel.startsWith('..'+(process.platform==='win32'?'\\':'/'))&&!isAbsolute(rel)) fail('SOURCE_MUST_BE_OUTSIDE_PROJECT');
  if(statSync(input).size>5*1024*1024) fail('SOURCE_TOO_LARGE');
  const source=JSON.parse(readFileSync(input,'utf8'));
  const git=argv=>execFileSync('git',['--no-optional-locks','-C',root,...argv],{encoding:'utf8',windowsHide:true,timeout:10000,maxBuffer:8192,stdio:['ignore','pipe','pipe']}).trim();
  const normalize=url=>typeof url==='string'?url.trim().replace(/^git@github\.com:/,'https://github.com/').replace(/\.git\/?$/,'').replace(/\/$/,'').toLowerCase():'';
  if(normalize(source.repoUrl)!==normalize(git(['config','--get','remote.origin.url']))) fail('SOURCE_REPOSITORY_MISMATCH');
  const result=inspectSource(source,(commit,path)=>git(['rev-parse','--verify',commit+':'+path]));
  // 파일명·해시·누락 여부만 출력한다. 원문·자격·개인 설정을 출력하지 않는다.
  process.stdout.write(JSON.stringify({...result,note:'로컬 원문 포함 검사입니다. 운영 연결·공식 통과를 인증하지 않습니다.'},null,2)+'\n');
  return result.ok?0:1;
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url) {
  try { process.exitCode=run(process.argv.slice(2)); }
  catch(error) { process.stderr.write((error?.code?.startsWith?.('USAGE:')?error.code:/^[A-Z_]+$/.test(error?.code??'')?error.code:'SOURCE_CHECK_FAILED')+'\n');process.exitCode=1; }
}
