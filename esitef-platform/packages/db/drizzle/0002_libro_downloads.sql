CREATE TABLE IF NOT EXISTS "libro_pdf_assets" (
	"libro_key" text PRIMARY KEY NOT NULL,
	"pdf_url" text NOT NULL,
	"file_name" text,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "libro_download_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"libro_key" text NOT NULL,
	"nombre" text NOT NULL,
	"pais" text NOT NULL,
	"ciudad" text NOT NULL,
	"telefono" text NOT NULL,
	"email" text NOT NULL,
	"edad" text NOT NULL,
	"profesion" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "libro_download_leads_libro_key_idx" ON "libro_download_leads" USING btree ("libro_key");
