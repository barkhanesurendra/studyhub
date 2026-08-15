require("dotenv").config();
const express=require("express"), cors=require("cors"), path=require("path");
const {pool,initDB}=require("./db");
const auth=require("./middleware/auth");
const app=express();
app.use(cors()); app.use(express.json()); app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));

app.get("/api/health",(req,res)=>res.json({ok:true,message:"StudyHub API running"}));

app.post("/api/auth/register",require("./routes/auth").register);
app.post("/api/auth/login",require("./routes/auth").login);

app.get("/api/courses",async(req,res)=>{try{const [r]=await pool.query("SELECT * FROM courses ORDER BY id DESC");res.json(r)}catch(e){res.status(500).json({message:e.message})}});
app.post("/api/courses",auth.admin,async(req,res)=>{try{const {title,description}=req.body;const [r]=await pool.query("INSERT INTO courses(title,description) VALUES(?,?)",[title,description]);res.json({id:r.insertId,title,description})}catch(e){res.status(500).json({message:e.message})}});

app.get("/api/notes",async(req,res)=>{try{const [r]=await pool.query("SELECT n.*,c.title course_title FROM notes n LEFT JOIN courses c ON c.id=n.course_id ORDER BY n.id DESC");res.json(r)}catch(e){res.status(500).json({message:e.message})}});
app.post("/api/notes",auth.admin,async(req,res)=>{try{const {title,pdf_url,course_id}=req.body;const [r]=await pool.query("INSERT INTO notes(title,pdf_url,course_id) VALUES(?,?,?)",[title,pdf_url,course_id||null]);res.json({id:r.insertId})}catch(e){res.status(500).json({message:e.message})}});

app.get("/api/classes",async(req,res)=>{try{const [r]=await pool.query("SELECT v.*,c.title course_title FROM classes v LEFT JOIN courses c ON c.id=v.course_id ORDER BY v.id DESC");res.json(r)}catch(e){res.status(500).json({message:e.message})}});
app.post("/api/classes",auth.admin,async(req,res)=>{try{const {title,youtube_url,course_id}=req.body;const [r]=await pool.query("INSERT INTO classes(title,youtube_url,course_id) VALUES(?,?,?)",[title,youtube_url,course_id||null]);res.json({id:r.insertId})}catch(e){res.status(500).json({message:e.message})}});

app.get("/api/tests",async(req,res)=>{try{const [r]=await pool.query("SELECT * FROM tests ORDER BY id DESC");res.json(r)}catch(e){res.status(500).json({message:e.message})}});
app.get("/api/tests/:id",async(req,res)=>{try{const [tests]=await pool.query("SELECT * FROM tests WHERE id=?",[req.params.id]);if(!tests[0])return res.status(404).json({message:"Test not found"});const [q]=await pool.query("SELECT id,question,option_a,option_b,option_c,option_d FROM questions WHERE test_id=?",[req.params.id]);res.json({...tests[0],questions:q})}catch(e){res.status(500).json({message:e.message})}});
app.post("/api/tests",auth.admin,async(req,res)=>{try{const {title,course_id,questions=[]}=req.body;const [r]=await pool.query("INSERT INTO tests(title,course_id) VALUES(?,?)",[title,course_id||null]);for(const q of questions){await pool.query("INSERT INTO questions(test_id,question,option_a,option_b,option_c,option_d,correct_option) VALUES(?,?,?,?,?,?,?)",[r.insertId,q.question,q.a,q.b,q.c,q.d,q.correct])}res.json({id:r.insertId})}catch(e){res.status(500).json({message:e.message})}});

app.post("/api/results",auth.user,async(req,res)=>{try{const {test_id,score,total}=req.body;const [r]=await pool.query("INSERT INTO results(user_id,test_id,score,total) VALUES(?,?,?,?)",[req.user.id,test_id,score,total]);res.json({id:r.insertId,score,total})}catch(e){res.status(500).json({message:e.message})}});
app.get("/api/my-results",auth.user,async(req,res)=>{const [r]=await pool.query("SELECT r.*,t.title FROM results r JOIN tests t ON t.id=r.test_id WHERE r.user_id=? ORDER BY r.id DESC",[req.user.id]);res.json(r)});
app.get("/api/admin/students",auth.admin,async(req,res)=>{const [r]=await pool.query("SELECT id,name,email,role,created_at FROM users ORDER BY id DESC");res.json(r)});

app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
initDB()
    .then(() => {
        const PORT = process.env.PORT || 5000;

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`StudyHub running on port ${PORT}`);
        });
    })
    .catch(e => {
        console.error(e);
        process.exit(1);
    });