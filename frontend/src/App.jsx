import { useState } from "react";
import { Layout } from "./components/Layout";
import { EmployeesPage } from "./pages/EmployeesPage";
import { AttendancePage } from "./pages/AttendancePage";

function App() {
  const [activeTab, setActiveTab] = useState("employees");

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "employees" ? <EmployeesPage /> : <AttendancePage />}
    </Layout>
  );
}

export default App;

