import type { Metadata } from "next";
import { getCustomers } from "@/src/services/customer.service";
import { CustomersTable } from "@/src/components/admin/customers/CustomersTable";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Khách hàng — Admin",
  description: "Quản lý hồ sơ và địa chỉ giao hàng của khách hàng.",
};

export default async function CustomersPage() {
  const { data: customers } = await getCustomers();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Khách hàng</h1>
        <p className="mt-1 text-sm text-secondary-500">
          Quản lý hồ sơ khách hàng và danh sách địa chỉ giao hàng.
        </p>
      </div>
      <CustomersTable initialCustomers={customers} />
    </div>
  );
}
