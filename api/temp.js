import fs from 'node:fs/promises'

const FILE='/tmp/temp/temp1.html'
const MAX_AGE=60*60*1000

export default async function handler(req,res){
 try{
  const stat=await fs.stat(FILE)
  if(Date.now()-stat.mtimeMs>=MAX_AGE){
   await fs.unlink(FILE).catch(()=>{})
   res.status(404).setHeader('Content-Type','text/html; charset=utf-8')
   res.end(`<!doctype html><html><body style="font-family:Arial;padding:40px"><h2>File HTML sudah kedaluwarsa</h2><p>File otomatis dihapus setelah 1 jam. Generate ulang dari halaman utama.</p></body></html>`)
   return
  }

  const html=await fs.readFile(FILE,'utf8')
  res.setHeader('Content-Type','text/html; charset=utf-8')
  res.setHeader('Cache-Control','no-store, no-cache, must-revalidate')
  res.setHeader('X-HTML-Expires-After',new Date(stat.mtimeMs+MAX_AGE).toISOString())
  res.status(200).send(html)
 }catch{
  res.status(404).setHeader('Content-Type','text/html; charset=utf-8')
  res.end(`<!doctype html><html><body style="font-family:Arial;padding:40px"><h2>File HTML tidak ditemukan</h2><p>Generate ulang dari halaman utama.</p></body></html>`)
 }
}
