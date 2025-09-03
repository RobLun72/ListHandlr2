export interface User {
  id?: string | undefined;
  provided_id?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
  username?: string | undefined;
  last_name?: string | undefined;
  first_name?: string | undefined;
  is_suspended?: boolean | undefined;
  picture?: string | undefined;
  total_sign_ins?: number | null | undefined;
  failed_sign_ins?: number | null | undefined;
  last_signed_in?: string | null | undefined;
  created_on?: string | null | undefined;
  organizations?: string[] | undefined;
  identities?:
    | {
        type?: string | undefined;
        identity?: string | undefined;
      }[]
    | undefined;
}
