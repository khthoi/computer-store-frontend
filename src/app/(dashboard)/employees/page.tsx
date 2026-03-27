import type { Metadata } from "next";
import { getEmployees } from "@/src/services/employee.service";
import { EmployeesTable } from "@/src/components/admin/employees/EmployeesTable";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nhân viên — Admin",
  description: "Quản lý thông tin và vai trò nhân viên trong hệ thống.",
};

export default async function EmployeesPage() {
  const { data: employees } = await getEmployees();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Nhân viên</h1>
        <p className="mt-1 text-sm text-secondary-500">
          Quản lý thông tin, vai trò và trạng thái tài khoản nhân viên.
        </p>
      </div>
      <EmployeesTable initialEmployees={employees} />
    </div>
  );
}
