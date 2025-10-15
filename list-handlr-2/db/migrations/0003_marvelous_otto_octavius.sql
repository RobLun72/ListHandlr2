CREATE UNIQUE INDEX "collab_group_members_group_member_idx" ON "collab_group_members" USING btree ("group_id","member_user_id");--> statement-breakpointCREATE UNIQUE INDEX "collab_group_members_group_member_idx" ON "collab_group_members" USING btree ("group_id","member_user_id");--> statement-breakpoint

CREATE UNIQUE INDEX "collab_groups_owner_name_idx" ON "collab_groups" USING btree ("owner_user_id","name");CREATE UNIQUE INDEX "collab_groups_owner_name_idx" ON "collab_groups" USING btree ("owner_user_id","name");
