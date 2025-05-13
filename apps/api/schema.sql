

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."interview_status" AS ENUM (
    'IN_PROGRESS',
    'DONE',
    'ABORTED'
);


ALTER TYPE "public"."interview_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_items_by_collection"("pcollection_id" "uuid") RETURNS TABLE("id" "uuid", "name" "text", "type" "text", "parent_item_id" "uuid", "collection_id" "uuid")
    LANGUAGE "plpgsql"
    AS $_$
BEGIN
  RETURN QUERY
  WITH RECURSIVE item_hierarchy AS (
    SELECT
      id,
      name,
      type,
      parent_item_id,
      collection_id
    FROM
      items
    WHERE
      collection_id = $1 AND parent_item_id IS NULL
    UNION ALL
    SELECT
      i.id,
      i.name,
      i.type,
      i.parent_item_id,
      i.collection_id
    FROM
      items i
      INNER JOIN item_hierarchy ih ON i.parent_item_id = ih.id
  )
  SELECT * FROM item_hierarchy;
END;
$_$;


ALTER FUNCTION "public"."get_items_by_collection"("pcollection_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
    insert into public.users (id, email, full_name)
    values (
        new.id,
        new.email,
        new.raw_user_meta_data ->> 'full_name'
    );
    return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_chat_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$ begin
  new.updated_at = now();

return new;

end;

$$;


ALTER FUNCTION "public"."update_chat_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_collection_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$ begin
  new.updated_at = now();
return new;
end;
$$;


ALTER FUNCTION "public"."update_collection_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_messages_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$ begin
  new.updated_at = now();
return new;
end;
$$;


ALTER FUNCTION "public"."update_messages_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
    new.updated_at = now();
    return new;
end;
$$;


ALTER FUNCTION "public"."update_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."chats" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."chats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."interview_answers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "turn_id" "uuid" NOT NULL,
    "answer_text" "text" NOT NULL,
    "answered_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "version" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."interview_answers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."interview_turns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "interview_id" "uuid" NOT NULL,
    "turn_no" integer NOT NULL,
    "question_text" "text" NOT NULL,
    "example_answer_text" "text",
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."interview_turns" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."interviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "item_id" "uuid",
    "seed_input" "text" NOT NULL,
    "started_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "finished_at" timestamp without time zone,
    "status" "public"."interview_status" DEFAULT 'IN_PROGRESS'::"public"."interview_status" NOT NULL,
    "total_token_cost" numeric(12,4),
    "model_used" "text",
    "metadata" "jsonb",
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."interviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "collection_id" "uuid",
    "parent_item_id" "uuid",
    "name" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "type" "text" DEFAULT 'folder'::"text" NOT NULL,
    CONSTRAINT "chk_item_parent_or_collection" CHECK (((("collection_id" IS NOT NULL) AND ("parent_item_id" IS NULL) AND ("type" = 'folder'::"text")) OR (("parent_item_id" IS NOT NULL) AND ("collection_id" IS NULL)))),
    CONSTRAINT "chk_item_type" CHECK (("type" = ANY (ARRAY['folder'::"text", 'request'::"text", 'interview'::"text"])))
);


ALTER TABLE "public"."items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "chat_id" "uuid" NOT NULL,
    "role" character varying NOT NULL,
    "content" "jsonb" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "collection_id" "uuid",
    "item_id" "uuid",
    "content" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_page_parent_or_collection" CHECK (((("collection_id" IS NOT NULL) AND ("item_id" IS NULL)) OR (("collection_id" IS NULL) AND ("item_id" IS NOT NULL))))
);


ALTER TABLE "public"."pages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_collections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_collections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."chats"
    ADD CONSTRAINT "chats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."items"
    ADD CONSTRAINT "directories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."interview_answers"
    ADD CONSTRAINT "interview_answers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."interview_answers"
    ADD CONSTRAINT "interview_answers_turn_id_version_key" UNIQUE ("turn_id", "version");



ALTER TABLE ONLY "public"."interview_turns"
    ADD CONSTRAINT "interview_turns_interview_id_turn_no_key" UNIQUE ("interview_id", "turn_no");



ALTER TABLE ONLY "public"."interview_turns"
    ADD CONSTRAINT "interview_turns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."interviews"
    ADD CONSTRAINT "interviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pages"
    ADD CONSTRAINT "pages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_collections"
    ADD CONSTRAINT "user_collections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_chat_user_id" ON "public"."chats" USING "btree" ("user_id");



CREATE INDEX "idx_messages_chat_id" ON "public"."messages" USING "btree" ("chat_id");



CREATE UNIQUE INDEX "ix_answers_latest" ON "public"."interview_answers" USING "btree" ("turn_id") WHERE ("version" = 1);



CREATE INDEX "ix_turns_interview_order" ON "public"."interview_turns" USING "btree" ("interview_id", "turn_no");



CREATE OR REPLACE TRIGGER "trg_interview_answers_updated_at" BEFORE UPDATE ON "public"."interview_answers" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "trg_interview_turns_updated_at" BEFORE UPDATE ON "public"."interview_turns" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "trg_interviews_updated_at" BEFORE UPDATE ON "public"."interviews" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_chat_updated_at" BEFORE UPDATE ON "public"."chats" FOR EACH ROW EXECUTE FUNCTION "public"."update_chat_updated_at"();



CREATE OR REPLACE TRIGGER "update_collection_updated_at" BEFORE UPDATE ON "public"."user_collections" FOR EACH ROW EXECUTE FUNCTION "public"."update_collection_updated_at"();



CREATE OR REPLACE TRIGGER "users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "fk_auth_user" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chats"
    ADD CONSTRAINT "fk_chat_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_collections"
    ADD CONSTRAINT "fk_collection_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."items"
    ADD CONSTRAINT "fk_directory_collection" FOREIGN KEY ("collection_id") REFERENCES "public"."user_collections"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."items"
    ADD CONSTRAINT "fk_directory_parent" FOREIGN KEY ("parent_item_id") REFERENCES "public"."items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "fk_messages_chat" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pages"
    ADD CONSTRAINT "fk_page_collection" FOREIGN KEY ("collection_id") REFERENCES "public"."user_collections"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pages"
    ADD CONSTRAINT "fk_page_item" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_answers"
    ADD CONSTRAINT "interview_answers_turn_id_fkey" FOREIGN KEY ("turn_id") REFERENCES "public"."interview_turns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_turns"
    ADD CONSTRAINT "interview_turns_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interviews"
    ADD CONSTRAINT "interviews_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interviews"
    ADD CONSTRAINT "interviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



CREATE POLICY "allow delete for chat owners" ON "public"."chats" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "allow delete for chat owners" ON "public"."messages" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."chats"
  WHERE (("chats"."id" = "messages"."chat_id") AND ("chats"."user_id" = "auth"."uid"())))));



CREATE POLICY "allow delete for directories owners" ON "public"."items" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."user_collections"
  WHERE (("user_collections"."id" = "items"."collection_id") AND ("user_collections"."user_id" = "auth"."uid"())))));



CREATE POLICY "allow delete for page owners" ON "public"."pages" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."user_collections"
  WHERE (("user_collections"."id" = "pages"."collection_id") AND ("user_collections"."user_id" = "auth"."uid"())))));



CREATE POLICY "allow delete for user_collections owners" ON "public"."user_collections" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "allow insert for authenticated users" ON "public"."chats" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "allow insert for chat owners" ON "public"."messages" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."chats"
  WHERE (("chats"."id" = "messages"."chat_id") AND ("chats"."user_id" = "auth"."uid"())))));



CREATE POLICY "allow insert for directories owners" ON "public"."items" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."user_collections"
  WHERE (("user_collections"."id" = "items"."collection_id") AND ("user_collections"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM ("public"."items" "parent"
     JOIN "public"."user_collections" ON (("parent"."collection_id" = "user_collections"."id")))
  WHERE (("parent"."id" = "items"."parent_item_id") AND ("user_collections"."user_id" = "auth"."uid"()))))));



CREATE POLICY "allow insert for page owners" ON "public"."pages" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."user_collections"
  WHERE (("user_collections"."id" = "pages"."collection_id") AND ("user_collections"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM ("public"."items"
     JOIN "public"."user_collections" ON (("items"."collection_id" = "user_collections"."id")))
  WHERE (("items"."id" = "pages"."item_id") AND ("user_collections"."user_id" = "auth"."uid"()))))));



CREATE POLICY "allow insert for user_collections owners" ON "public"."user_collections" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "allow read access for chat owners" ON "public"."chats" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "allow read access for chat owners" ON "public"."messages" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."chats"
  WHERE (("chats"."id" = "messages"."chat_id") AND ("chats"."user_id" = "auth"."uid"())))));



CREATE POLICY "allow read access for directories owners" ON "public"."items" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."user_collections"
  WHERE (("user_collections"."id" = "items"."collection_id") AND ("user_collections"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM ("public"."items" "parent"
     JOIN "public"."user_collections" ON (("parent"."collection_id" = "user_collections"."id")))
  WHERE (("parent"."id" = "items"."parent_item_id") AND ("user_collections"."user_id" = "auth"."uid"()))))));



CREATE POLICY "allow read access for page owners" ON "public"."pages" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."user_collections"
  WHERE (("user_collections"."id" = "pages"."collection_id") AND ("user_collections"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM ("public"."items"
     JOIN "public"."user_collections" ON (("items"."collection_id" = "user_collections"."id")))
  WHERE (("items"."id" = "pages"."item_id") AND ("user_collections"."user_id" = "auth"."uid"()))))));



CREATE POLICY "allow read access for user_collections owners" ON "public"."user_collections" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "allow update for chat owners" ON "public"."chats" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "allow update for directories owners" ON "public"."items" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."user_collections"
  WHERE (("user_collections"."id" = "items"."collection_id") AND ("user_collections"."user_id" = "auth"."uid"())))));



CREATE POLICY "allow update for message owners" ON "public"."messages" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."chats"
  WHERE (("chats"."id" = "messages"."chat_id") AND ("chats"."user_id" = "auth"."uid"())))));



CREATE POLICY "allow update for page owners" ON "public"."pages" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."user_collections"
  WHERE (("user_collections"."id" = "pages"."collection_id") AND ("user_collections"."user_id" = "auth"."uid"())))));



CREATE POLICY "allow update for user_collections owners" ON "public"."user_collections" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "answers_delete_owner" ON "public"."interview_answers" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."interview_turns" "t"
     JOIN "public"."interviews" "s" ON (("s"."id" = "t"."interview_id")))
  WHERE (("t"."id" = "interview_answers"."turn_id") AND ("s"."user_id" = "auth"."uid"())))));



CREATE POLICY "answers_insert_owner" ON "public"."interview_answers" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."interview_turns" "t"
     JOIN "public"."interviews" "s" ON (("s"."id" = "t"."interview_id")))
  WHERE (("t"."id" = "interview_answers"."turn_id") AND ("s"."user_id" = "auth"."uid"())))));



CREATE POLICY "answers_select_owner" ON "public"."interview_answers" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."interview_turns" "t"
     JOIN "public"."interviews" "s" ON (("s"."id" = "t"."interview_id")))
  WHERE (("t"."id" = "interview_answers"."turn_id") AND ("s"."user_id" = "auth"."uid"())))));



CREATE POLICY "answers_update_owner" ON "public"."interview_answers" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."interview_turns" "t"
     JOIN "public"."interviews" "s" ON (("s"."id" = "t"."interview_id")))
  WHERE (("t"."id" = "interview_answers"."turn_id") AND ("s"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."chats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."interview_answers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."interview_turns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."interviews" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "interviews_delete_owner" ON "public"."interviews" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "interviews_insert_owner" ON "public"."interviews" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "interviews_select_owner" ON "public"."interviews" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "interviews_update_owner" ON "public"."interviews" FOR UPDATE USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "select_own_profile" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "turns_delete_owner" ON "public"."interview_turns" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."interviews"
  WHERE (("interviews"."id" = "interview_turns"."interview_id") AND ("interviews"."user_id" = "auth"."uid"())))));



CREATE POLICY "turns_insert_owner" ON "public"."interview_turns" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."interviews"
  WHERE (("interviews"."id" = "interview_turns"."interview_id") AND ("interviews"."user_id" = "auth"."uid"())))));



CREATE POLICY "turns_select_owner" ON "public"."interview_turns" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."interviews"
  WHERE (("interviews"."id" = "interview_turns"."interview_id") AND ("interviews"."user_id" = "auth"."uid"())))));



CREATE POLICY "turns_update_owner" ON "public"."interview_turns" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."interviews"
  WHERE (("interviews"."id" = "interview_turns"."interview_id") AND ("interviews"."user_id" = "auth"."uid"())))));



CREATE POLICY "update_own_profile" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."user_collections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";





























































































































































































GRANT ALL ON FUNCTION "public"."get_items_by_collection"("pcollection_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_items_by_collection"("pcollection_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_items_by_collection"("pcollection_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_chat_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_chat_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_chat_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_collection_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_collection_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_collection_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_messages_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_messages_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_messages_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."chats" TO "anon";
GRANT ALL ON TABLE "public"."chats" TO "authenticated";
GRANT ALL ON TABLE "public"."chats" TO "service_role";



GRANT ALL ON TABLE "public"."interview_answers" TO "anon";
GRANT ALL ON TABLE "public"."interview_answers" TO "authenticated";
GRANT ALL ON TABLE "public"."interview_answers" TO "service_role";



GRANT ALL ON TABLE "public"."interview_turns" TO "anon";
GRANT ALL ON TABLE "public"."interview_turns" TO "authenticated";
GRANT ALL ON TABLE "public"."interview_turns" TO "service_role";



GRANT ALL ON TABLE "public"."interviews" TO "anon";
GRANT ALL ON TABLE "public"."interviews" TO "authenticated";
GRANT ALL ON TABLE "public"."interviews" TO "service_role";



GRANT ALL ON TABLE "public"."items" TO "anon";
GRANT ALL ON TABLE "public"."items" TO "authenticated";
GRANT ALL ON TABLE "public"."items" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."pages" TO "anon";
GRANT ALL ON TABLE "public"."pages" TO "authenticated";
GRANT ALL ON TABLE "public"."pages" TO "service_role";



GRANT ALL ON TABLE "public"."user_collections" TO "anon";
GRANT ALL ON TABLE "public"."user_collections" TO "authenticated";
GRANT ALL ON TABLE "public"."user_collections" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
