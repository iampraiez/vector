/*
  Warnings:

  - A unique constraint covering the columns `[company_id,paystack_reference]` on the table `billing_records` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[company_id,paystack_invoice_id]` on the table `invoices` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "billing_records_company_id_paystack_reference_key" ON "billing_records"("company_id", "paystack_reference");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_company_id_paystack_invoice_id_key" ON "invoices"("company_id", "paystack_invoice_id");
