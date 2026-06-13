import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260613085000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "ai_product_request" add column if not exists "brand_id" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "ai_product_request" drop column if exists "brand_id";`);
  }

}
