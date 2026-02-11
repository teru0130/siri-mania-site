-- CreateTable
CREATE TABLE "sample_videos" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "embed_code" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail_url" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sample_videos_pkey" PRIMARY KEY ("id")
);
