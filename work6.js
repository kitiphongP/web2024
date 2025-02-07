const firebaseConfig = {
    apiKey: "AIzaSyCLDTGU00dDPTQ0g5v0413ClP9b8KOd_ss",
    authDomain: "lab-webapp-aa3bf.firebaseapp.com",
    projectId: "lab-webapp-aa3bf",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

class App extends React.Component {
    state = { user: null, students: [], editingStudent: null, newStudent: { studentId: "", title: "นาย", fname: "", lname: "", email: "", phone: "" } };

    componentDidMount() {
        firebase.auth().onAuthStateChanged(user => {
            if (!user) {
                window.location.href = "work6_login.html"; // ถ้ายังไม่ได้ล็อกอิน ให้ไปที่หน้า Login
            } else {
                this.setState({ user });
                this.loadAllStudents(); // 🔹 ดึงข้อมูลนักศึกษาทุกคน
            }
        });
    }

    async loadAllStudents() {
        try {
            const querySnapshot = await db.collection("students").get();
            const students = [];
            
            querySnapshot.forEach((doc) => {
                students.push({ id: doc.id, ...doc.data() });
            });

            this.setState({ students });
        } catch (error) {
            console.error("🚨 เกิดข้อผิดพลาดในการโหลดข้อมูล:", error);
        }
    }

    handleChange = (event) => {
        const { name, value } = event.target;
        this.setState(prevState => ({
            newStudent: { ...prevState.newStudent, [name]: value }
        }));
    };

    addStudent = async () => {
        const { newStudent } = this.state;
        if (!newStudent.studentId || !newStudent.fname || !newStudent.lname || !newStudent.email || !newStudent.phone) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        try {
            await db.collection("students").add(newStudent);
            alert("เพิ่มข้อมูลนักศึกษาสำเร็จ!");
            this.loadAllStudents();
        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการเพิ่มข้อมูล:", error);
        }
    };

    editStudent = (student) => {
        this.setState({ editingStudent: student, newStudent: student });
    };

    updateStudent = async () => {
        const { editingStudent, newStudent } = this.state;
        if (!newStudent.fname || !newStudent.lname || !newStudent.email || !newStudent.phone) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        try {
            await db.collection("students").doc(editingStudent.id).update(newStudent);
            alert("อัปเดตข้อมูลนักศึกษาสำเร็จ!");
            this.setState({ editingStudent: null, newStudent: { studentId: "", title: "นาย", fname: "", lname: "", email: "", phone: "" } });
            this.loadAllStudents();
        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูล:", error);
        }
    };

    deleteStudent = async (id) => {
        if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?")) return;

        try {
            await db.collection("students").doc(id).delete();
            alert("ลบข้อมูลนักศึกษาสำเร็จ!");
            this.loadAllStudents();
        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการลบข้อมูล:", error);
        }
    };

    logout = () => {
        firebase.auth().signOut().then(() => {
            window.location.href = "work6_login.html";
        });
    };

    render() {
        const { user, students, editingStudent, newStudent } = this.state;
        return (
            <div className="container">
                <h1>ระบบจัดการนักศึกษา</h1>
                <p>ผู้ใช้ปัจจุบัน: {user?.email}</p>
                <button className="btn btn-danger" onClick={this.logout}>ออกจากระบบ</button>

                

                <h2 className="mt-4">รายชื่อนักศึกษา</h2>
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>รหัสนักศึกษา</th>
                            <th>คำนำหน้า</th>
                            <th>ชื่อ</th>
                            <th>นามสกุล</th>
                            <th>Email</th>
                            <th>เบอร์โทรศัพท์</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <tr key={student.id}>
                                <td>{student.studentId}</td>
                                <td>{student.title}</td>
                                <td>{student.fname}</td>
                                <td>{student.lname}</td>
                                <td>{student.email}</td>
                                <td>{student.phone}</td>
                                <td className="d-flex justify-content-center gap-2">
                                    <button className="btn btn-warning btn-sm" onClick={() => this.editStudent(student)}>แก้ไข</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => this.deleteStudent(student.id)}>ลบ</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <h2 className="mt-4">{editingStudent ? "แก้ไขข้อมูล" : "เพิ่มนักศึกษา"}</h2>
                <input type="text" name="studentId" placeholder="รหัสนักศึกษา" className="form-control mb-2" value={newStudent.studentId} onChange={this.handleChange} />
                <select name="title" className="form-select mb-2" value={newStudent.title} onChange={this.handleChange}>
                    <option value="นาย">นาย</option>
                    <option value="นางสาว">นางสาว</option>
                </select>
                <input type="text" name="fname" placeholder="ชื่อ" className="form-control mb-2" value={newStudent.fname} onChange={this.handleChange} />
                <input type="text" name="lname" placeholder="นามสกุล" className="form-control mb-2" value={newStudent.lname} onChange={this.handleChange} />
                <input type="email" name="email" placeholder="Email" className="form-control mb-2" value={newStudent.email} onChange={this.handleChange} />
                <input type="text" name="phone" placeholder="เบอร์โทรศัพท์" className="form-control mb-2" value={newStudent.phone} onChange={this.handleChange} />
                <button className="btn btn-success w-100 mb-2" onClick={editingStudent ? this.updateStudent : this.addStudent}>
                    {editingStudent ? "อัปเดตข้อมูล" : "เพิ่มนักศึกษา"}
                </button>
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById("app"));
