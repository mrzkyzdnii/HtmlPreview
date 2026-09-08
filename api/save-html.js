import fs from 'node:fs/promises'
import path from 'node:path'

const MAX_AGE=60*60*1000

export default async function handler(req,res){
 if(req.method!=='POST'){
  res.status(405).json({error:'Method Not Allowed'})
  return
 }
 try{
  let body=req.body
  if(typeof body==='string') body=JSON.parse(body)
  const html=body?.html
  if(typeof html!=='string'||!html.trim()){
   res.status(400).json({error:'HTML kosong'})
   return
  }

  const dir='/tmp/temp'
  await fs.mkdir(dir,{recursive:true})
  const file=path.join(dir,'temp1.html')
  await fs.writeFile(file,html,'utf8')

  setTimeout(async()=>{
   try{
    const stat=await fs.stat(file)
    if(Date.now()-stat.mtimeMs>=MAX_AGE) await fs.unlink(file)
   }catch{}
  },MAX_AGE+1000).unref?.()

  res.status(200).json({
   url:`${getOrigin(req)}/temp/temp1.html`,
   expiresIn:MAX_AGE,
   expiresAt:new Date(Date.now()+MAX_AGE).toISOString()
  })
 }catch(e){
  res.status(500).json({error:e.message||'Gagal menyimpan HTML'})
 }
}

function getOrigin(req){
 const proto=(req.headers['x-forwarded-proto']||'https').split(',')[0]
 const host=req.headers['x-forwarded-host']||req.headers.host
 return `${proto}://${host}`
}
