-- CreateIndex
CREATE INDEX "Grade_subjectId_idx" ON "Grade" USING HASH ("subjectId");

-- CreateIndex
CREATE INDEX "Subject_semesterId_idx" ON "Subject" USING HASH ("semesterId");
