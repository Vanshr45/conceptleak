import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("demo123", 10);

  await prisma.user.upsert({
    where: { id: "user-demo" },
    update: {
      name: "Vansh",
      email: "demo@conceptleak.ai",
      authType: "email",
      passwordHash,
    },
    create: {
      id: "user-demo",
      name: "Vansh",
      email: "demo@conceptleak.ai",
      authType: "email",
      passwordHash,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    },
  });

  const demoDatasets = [
    {
      id: "demo-1",
      name: "customer_data.csv",
      size: "2.4 MB",
      uploadedAt: new Date("2024-03-25T00:00:00.000Z"),
      status: "completed",
      riskScore: 82,
      riskLevel: "HIGH",
      rowCount: 1250,
      columnCount: 5,
      columns: ["id", "name", "email", "phone", "address"],
      previewRows: [
        { id: 1, name: "Alice Johnson", email: "alice@example.com", phone: "555-0101", address: "123 Main St" },
        { id: 2, name: "Bob Smith", email: "bob@example.com", phone: "555-0102", address: "456 Oak Ave" },
        { id: 3, name: "Carol White", email: "carol@example.com", phone: "555-0103", address: "789 Pine Rd" },
        { id: 4, name: "David Brown", email: "david@example.com", phone: "555-0104", address: "321 Elm St" },
        { id: 5, name: "Eve Davis", email: "eve@example.com", phone: "555-0105", address: "654 Maple Ave" },
      ],
    },
    {
      id: "demo-2",
      name: "transactions.csv",
      size: "5.1 MB",
      uploadedAt: new Date("2024-03-24T00:00:00.000Z"),
      status: "completed",
      riskScore: 65,
      riskLevel: "HIGH",
      rowCount: 8432,
      columnCount: 5,
      columns: ["transaction_id", "customer_id", "amount", "date", "status"],
      previewRows: [
        { transaction_id: "TXN-001", customer_id: "CUST-042", amount: 299.99, date: "2024-03-20", status: "completed" },
        { transaction_id: "TXN-002", customer_id: "CUST-017", amount: 49.5, date: "2024-03-20", status: "completed" },
        { transaction_id: "TXN-003", customer_id: "CUST-088", amount: 1200, date: "2024-03-21", status: "pending" },
        { transaction_id: "TXN-004", customer_id: "CUST-042", amount: 75.25, date: "2024-03-21", status: "completed" },
        { transaction_id: "TXN-005", customer_id: "CUST-033", amount: 899, date: "2024-03-22", status: "failed" },
      ],
    },
    {
      id: "demo-3",
      name: "employees.xlsx",
      size: "1.2 MB",
      uploadedAt: new Date("2024-03-23T00:00:00.000Z"),
      status: "completed",
      riskScore: 45,
      riskLevel: "MEDIUM",
      rowCount: 342,
      columnCount: 6,
      columns: ["emp_id", "name", "department", "salary", "hire_date", "manager_id"],
      previewRows: [
        { emp_id: "E001", name: "John Doe", department: "Engineering", salary: 95000, hire_date: "2022-01-15", manager_id: "E010" },
        { emp_id: "E002", name: "Jane Roe", department: "Marketing", salary: 78000, hire_date: "2021-06-01", manager_id: "E011" },
        { emp_id: "E003", name: "Mike Lee", department: "Engineering", salary: 102000, hire_date: "2020-09-12", manager_id: "E010" },
        { emp_id: "E004", name: "Sara Kim", department: "HR", salary: 65000, hire_date: "2023-03-20", manager_id: "E012" },
        { emp_id: "E005", name: "Tom Hall", department: "Finance", salary: 88000, hire_date: "2019-11-05", manager_id: "E013" },
      ],
    },
  ];

  for (const dataset of demoDatasets) {
    await prisma.dataset.upsert({
      where: { id: dataset.id },
      update: { ...dataset, userId: "user-demo" },
      create: { ...dataset, userId: "user-demo" },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
