const mysql=require("mysql2/promise");
const pool=mysql.createPool({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,waitForConnections:true,connectionLimit:10});
async function initDB(){
 await pool.query(`CREATE TABLE IF NOT EXISTS users(id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(100) NOT NULL,email VARCHAR(150) UNIQUE NOT NULL,password VARCHAR(255) NOT NULL,role ENUM('student','admin') DEFAULT 'student',created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
 await pool.query(`CREATE TABLE IF NOT EXISTS courses(id INT AUTO_INCREMENT PRIMARY KEY,title VARCHAR(150) NOT NULL,description TEXT)`);
 await pool.query(`CREATE TABLE IF NOT EXISTS notes(id INT AUTO_INCREMENT PRIMARY KEY,title VARCHAR(200) NOT NULL,pdf_url TEXT NOT NULL,course_id INT NULL,FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE SET NULL)`);
 await pool.query(`CREATE TABLE IF NOT EXISTS classes(id INT AUTO_INCREMENT PRIMARY KEY,title VARCHAR(200) NOT NULL,youtube_url TEXT NOT NULL,course_id INT NULL,FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE SET NULL)`);
 await pool.query(`CREATE TABLE IF NOT EXISTS tests(id INT AUTO_INCREMENT PRIMARY KEY,title VARCHAR(200) NOT NULL,course_id INT NULL,FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE SET NULL)`);
 await pool.query(`CREATE TABLE IF NOT EXISTS questions(id INT AUTO_INCREMENT PRIMARY KEY,test_id INT NOT NULL,question TEXT NOT NULL,option_a TEXT,option_b TEXT,option_c TEXT,option_d TEXT,correct_option INT NOT NULL,FOREIGN KEY(test_id) REFERENCES tests(id) ON DELETE CASCADE)`);
 await pool.query(`CREATE TABLE IF NOT EXISTS results(id INT AUTO_INCREMENT PRIMARY KEY,user_id INT NOT NULL,test_id INT NOT NULL,score INT,total INT,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,FOREIGN KEY(test_id) REFERENCES tests(id) ON DELETE CASCADE)`);
}
module.exports={pool,initDB};