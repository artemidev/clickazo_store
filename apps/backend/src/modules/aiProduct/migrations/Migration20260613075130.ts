import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260613075130 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "ai_product_request" ("id" text not null, "input_name" text not null, "status" text check ("status" in ('pending', 'researching', 'generating', 'translating', 'pricing', 'creating_product', 'completed', 'failed')) not null default 'pending', "research_data" jsonb null, "generated_content" jsonb null, "translated_content" jsonb null, "price_suggestion" jsonb null, "product_id" text null, "error" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "ai_product_request_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ai_product_request_deleted_at" ON "ai_product_request" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "ai_product_request" cascade;`);
  }

}
