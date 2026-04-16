-- Supabase Storage Configuration for Winner Proofs

-- Create the bucket for storing screenshots
insert into storage.buckets (id, name, public) 
values ('proofs', 'proofs', false)
on conflict (id) do nothing;

-- RLS Policies for the 'proofs' bucket

-- 1. Allow authenticated users to upload files to their own folder [userId]/file.ext
create policy "Users can upload their own proofs 6v1z_0"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'proofs' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- 2. Allow users to see their own uploaded proofs
create policy "Users can view their own proofs 6v1z_1"
on storage.objects for select
to authenticated
using (
  bucket_id = 'proofs' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- 3. Allow admins to view all proofs for verification
create policy "Admins can view all proofs 6v1z_2"
on storage.objects for select
to authenticated
using (
  bucket_id = 'proofs' AND
  (
    exists (
      select 1 from auth.users 
      where id = auth.uid() 
      and raw_user_meta_data->>'role' = 'admin'
    )
  )
);

-- 4. Allow admins to delete proofs if necessary
create policy "Admins can manage proofs 6v1z_3"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'proofs' AND
  (
    exists (
      select 1 from auth.users 
      where id = auth.uid() 
      and raw_user_meta_data->>'role' = 'admin'
    )
  )
);
