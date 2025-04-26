-- AlterTable
ALTER TABLE "conversation_participants" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "conversation_participants_archived_idx" ON "conversation_participants"("archived");

-- CreateIndex
CREATE INDEX "messages_isDraft_idx" ON "messages"("isDraft");
