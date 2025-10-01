require('dotenv').config()
const express=require('express')
const axios=require('axios')
const Database=require('better-sqlite3')

const app=express()
app.use(express.json())
const db=new Database('data.db')
db.exec(`CREATE TABLE IF NOT EXISTS payables(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 title TEXT, amount REAL, status TEXT DEFAULT 'pending'
)`)

let tokenCache={token:null,expires:0}
async function getToken(){
 if(tokenCache.token && Date.now()<tokenCache.expires) return tokenCache.token
 const {BRADESCO_CLIENT_ID,BRADESCO_CLIENT_SECRET,BRADESCO_TOKEN_URL}=process.env
 if(!BRADESCO_CLIENT_ID) return null
 const auth=Buffer.from(`${BRADESCO_CLIENT_ID}:${BRADESCO_CLIENT_SECRET}`).toString('base64')
 const r=await axios.post(BRADESCO_TOKEN_URL,"grant_type=client_credentials",{
   headers:{Authorization:`Basic ${auth}`,"Content-Type":"application/x-www-form-urlencoded"}
 })
 tokenCache={token:r.data.access_token,expires:Date.now()+(r.data.expires_in*1000)}
 return tokenCache.token
}

app.get('/api/bank/balance',async(req,res)=>{
 if(!process.env.BRADESCO_CLIENT_ID) return res.json({available:1234.56})
 const token=await getToken()
 try{
   const r=await axios.get(`${process.env.BRADESCO_API_BASE}/open-banking/accounts/v1/accounts`,{
     headers:{Authorization:`Bearer ${token}`}
   })
   res.json(r.data)
 }catch(e){res.status(500).json({error:e.message})}
})

app.get('/api/payables',(req,res)=>res.json(db.prepare("SELECT * FROM payables").all()))
app.post('/api/payables',(req,res)=>{
 const {title,amount,status}=req.body
 const info=db.prepare("INSERT INTO payables(title,amount,status) VALUES (?,?,?)").run(title,amount,status||'pending')
 res.json(db.prepare("SELECT * FROM payables WHERE id=?").get(info.lastInsertRowid))
})
app.post('/api/payables/:id',(req,res)=>{
 const {status}=req.body
 db.prepare("UPDATE payables SET status=? WHERE id=?").run(status,req.params.id)
 res.json(db.prepare("SELECT * FROM payables WHERE id=?").get(req.params.id))
})

app.listen(process.env.PORT||3000,()=>console.log("Backend rodando"))