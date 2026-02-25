export function Layout({ activeTab, onTabChange, children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              HRMS Lite (Admin Panel)
            </h1>
            <p className="text-sm text-slate-500">
              Lightweight employee and attendance management
            </p>
          </div>
          <nav className="flex gap-2 rounded-full bg-slate-100 p-1 text-sm">
            <button
              type="button"
              onClick={() => onTabChange("employees")}
              className={`rounded-full px-3 py-1 font-medium ${
                activeTab === "employees"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Employees
            </button>
            <button
              type="button"
              onClick={() => onTabChange("attendance")}
              className={`rounded-full px-3 py-1 font-medium ${
                activeTab === "attendance"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Attendance
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}

