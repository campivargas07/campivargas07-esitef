ALTER TABLE "libro_pdf_assets" ADD COLUMN IF NOT EXISTS "slot" text NOT NULL DEFAULT '1';
--> statement-breakpoint
ALTER TABLE "libro_pdf_assets" DROP CONSTRAINT IF EXISTS "libro_pdf_assets_pkey";
--> statement-breakpoint
ALTER TABLE "libro_pdf_assets" ADD PRIMARY KEY ("libro_key", "slot");
