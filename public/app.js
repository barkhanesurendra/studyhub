let token=localStorage.getItem("studyhub_token"), current=JSON.parse(localStorage.getItem("studyhub_user")||"null");
const api=(url,opt={})=>fetch(url,{...opt,headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{})}}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.message||"Request failed");return d});
function toast(m){let x=document.getElementById("toast");x.textContent=m;x.style.display="block";setTimeout(()=>x.style.display="none",2200)}
function openLogin(){document.getElementById("modalBody").innerHTML=`<h2>Student Login</h2><input id="name" placeholder="Name (for register)"><input id="email" placeholder="Email"><input id="pass" type="password" placeholder="Password"><button class="primary" onclick="register()">Register</button> <button onclick="login()">Login</button>`;document.getElementById("modal").classList.add("show")}
function closeModal(){document.getElementById("modal").classList.remove("show")}
async function register() {
    const studentName = document.getElementById("name").value.trim();
    const studentEmail = document.getElementById("email").value.trim();
    const studentPassword = document.getElementById("pass").value;

    if (!studentName || !studentEmail || !studentPassword) {
        toast("Please fill all fields");
        return;
    }

    try {
        const d = await api("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({
                name: studentName,
                email: studentEmail,
                password: studentPassword
            })
        });

        saveAuth(d);
        toast("Registration successful ❤️");

    } catch (e) {
        toast(e.message);
    }
}
async function login() {
    const studentEmail = document.getElementById("email").value.trim();
    const studentPassword = document.getElementById("pass").value;

    if (!studentEmail || !studentPassword) {
        toast("Please enter email and password");
        return;
    }

    try {
        const d = await api("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({
                email: studentEmail,
                password: studentPassword
            })
        });

        saveAuth(d);
        toast("Login successful ❤️");

    } catch (e) {
        toast(e.message);
    }
}
function saveAuth(d){token=d.token;current=d.user;localStorage.setItem("studyhub_token",token);localStorage.setItem("studyhub_user",JSON.stringify(current));document.getElementById("welcome").textContent="Welcome, "+current.name;closeModal();loadResults()}
async function loadCourses(){let d=await api("/api/courses");coursesList.innerHTML=d.map(x=>`<div class="card"><span class="tag">COURSE</span><h3>${x.title}</h3><p>${x.description||""}</p></div>`).join("")||"<p>No courses yet.</p>"}
async function loadNotes(){let d=await api("/api/notes");let q=(search.value||"").toLowerCase();d=d.filter(x=>(x.title+" "+(x.course_title||"")).toLowerCase().includes(q));notesList.innerHTML=d.map(x=>`<div class="card"><span class="tag">PDF</span><h3>${x.title}</h3><p>${x.course_title||"General"}</p><a href="${x.pdf_url}" target="_blank"><button>Open PDF</button></a></div>`).join("")||"<p>No matching notes.</p>"}
async function loadClasses(){let d=await api("/api/classes");classesList.innerHTML=d.map(x=>`<div class="card"><span class="tag">VIDEO CLASS</span><h3>${x.title}</h3><p>${x.course_title||"General"}</p><a href="${x.youtube_url}" target="_blank"><button>Watch Class</button></a></div>`).join("")||"<p>No classes yet.</p>"}
async function loadTests(){let d=await api("/api/tests");testsList.innerHTML=d.map(x=>`<div class="card"><span class="tag">MCQ TEST</span><h3>${x.title}</h3><button onclick="startTest(${x.id})">Start Test</button></div>`).join("")||"<p>No tests yet.</p>"}
async function startTest(id){try{let t=await api("/api/tests/"+id);document.getElementById("modalBody").innerHTML=`<h2>${t.title}</h2>${t.questions.map((q,i)=>`<div style="margin:18px 0"><b>${i+1}. ${q.question}</b>${["a","b","c","d"].map((k,j)=>`<label style="display:block;margin:7px"><input type="radio" name="q${i}" value="${j}"> ${q["option_"+k]}</label>`).join("")}</div>`).join("")}<button class="primary" onclick="submitTest(${t.id},${t.questions.length})">Submit</button>`;window.test=t;document.getElementById("modal").classList.add("show")}catch(e){toast(e.message)}}
async function submitTest(id,total){let score=0;test.questions.forEach((q,i)=>{let x=document.querySelector(`input[name=q${i}]:checked`);if(x&&Number(x.value)===q.correct_option)score++});try{await api("/api/results",{method:"POST",body:JSON.stringify({test_id:id,score,total})});toast(`Score: ${score}/${total}`);closeModal();loadResults()}catch(e){toast(e.message)}}
async function loadResults(){if(!token){results.textContent="Login to view your results.";return}try{let d=await api("/api/my-results");results.innerHTML=d.map(x=>`<p><b>${x.title}</b> — ${x.score}/${x.total}</p>`).join("")||"No results yet."}catch(e){results.textContent=e.message}}
if(current)document.getElementById("welcome").textContent="Welcome, "+current.name;
Promise.all([loadCourses(),loadNotes(),loadClasses(),loadTests(),loadResults()]);